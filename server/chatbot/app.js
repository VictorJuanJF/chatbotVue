"use strict";
const dialogflow = require("dialogflow");
const express = require("express");
const crypto = require("crypto");
const bodyParser = require("body-parser");
const request = require("request");
const app = express();
const router = express.Router();
const uuid = require("uuid");
const levenshtainService = require("../Algorithms/Levenshtein");
//database
const agenciesService = require("../database/agencies");
const userService = require("../database/users");
// Facebook me da payloads (botones,carrusel,etc) en protocolo struct, con la libreria
//de abajo puedo desestructuarlo y mandarlo a graph api
const { structProtoToJson, jsonToStructProto } = require("./structFunctions");
//fb service
const fbService = require("../fbService/fbService");
const { getDocumentNum } = require("../database/users");

// Messenger API parameters
if (!process.env.FB_PAGE_TOKEN) {
  throw new Error("missing FB_PAGE_TOKEN");
}
if (!process.env.FB_VERIFY_TOKEN) {
  throw new Error("missing FB_VERIFY_TOKEN");
}
if (!process.env.GOOGLE_PROJECT_ID) {
  throw new Error("missing GOOGLE_PROJECT_ID");
}
if (!process.env.DF_LANGUAGE_CODE) {
  throw new Error("missing DF_LANGUAGE_CODE");
}
if (!process.env.GOOGLE_CLIENT_EMAIL) {
  throw new Error("missing GOOGLE_CLIENT_EMAIL");
}
if (!process.env.GOOGLE_PRIVATE_KEY) {
  throw new Error("missing GOOGLE_PRIVATE_KEY");
}
if (!process.env.FB_APP_SECRET) {
  throw new Error("missing FB_APP_SECRET");
}
if (!process.env.SERVER_URL) {
  //used for ink to static files
  throw new Error("missing SERVER_URL");
}

// app.set('port', (process.env.PORT || 5000))

//verify request came from facebook
app.use(
  bodyParser.json({
    verify: verifyRequestSignature,
  })
);

//serve static files in the public directory
// app.use(express.static('public'));

// Process application/x-www-form-urlencoded
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);

// Process application/json
app.use(bodyParser.json());

//maps
const sessionIds = new Map();
const privacyPolicy = new Map();
const documentNumbers = new Map();

const credentials = {
  client_email: process.env.GOOGLE_CLIENT_EMAIL,
  private_key: process.env.GOOGLE_PRIVATE_KEY,
};

const sessionClient = new dialogflow.SessionsClient({
  projectId: process.env.GOOGLE_PROJECT_ID,
  credentials,
});

// Index route
// app.get('/', function(req, res) {
//     res.send('Hello world, I am a chat bot')
// })

// for Facebook verification
router.get("/webhook/", function (req, res) {
  if (
    req.query["hub.mode"] === "subscribe" &&
    req.query["hub.verify_token"] === process.env.FB_VERIFY_TOKEN
  ) {
    res.status(200).send(req.query["hub.challenge"]);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);
  }
});

/*
 * All callbacks for Messenger are POST-ed. They will be sent to the same
 * webhook. Be sure to subscribe your app to your page to receive callbacks
 * for your page.
 * https://developers.facebook.com/docs/messenger-platform/product-overview/setup#subscribe_app
 *
 */
router.post("/webhook/", function (req, res) {
  var data = req.body;
  // Make sure this is a page subscription
  if (data.object == "page") {
    // Iterate over each entry
    // There may be multiple if batched
    data.entry.forEach(function (pageEntry) {
      var pageID = pageEntry.id;
      var timeOfEvent = pageEntry.time;

      // Iterate over each messaging event
      pageEntry.messaging.forEach(function (messagingEvent) {
        if (messagingEvent.optin) {
          receivedAuthentication(messagingEvent);
        } else if (messagingEvent.message) {
          receivedMessage(messagingEvent);
        } else if (messagingEvent.delivery) {
          receivedDeliveryConfirmation(messagingEvent);
        } else if (messagingEvent.postback) {
          receivedPostback(messagingEvent);
        } else if (messagingEvent.read) {
          receivedMessageRead(messagingEvent);
        } else if (messagingEvent.account_linking) {
          receivedAccountLink(messagingEvent);
        } else {
          console.log(
            "Webhook received unknown messagingEvent: ",
            messagingEvent
          );
        }
      });
    });

    // Assume all went well.
    // You must send back a 200, within 20 seconds
    res.sendStatus(200);
  }
});

async function setSessionAndUser(senderID) {
  if (!sessionIds.has(senderID)) {
    try {
      //check if user exists in db
      let userExists = await userService.listOne(senderID);
      if (!userExists) {
        //get info from graph api
        let userData = await fbService.getUserData(senderID);
        //create user
        await userService.create(userData);
      }
      //set session
      sessionIds.set(senderID, uuid.v1());
    } catch (error) {
      throw error;
    }
  }
}

async function verifyPrivacyPolicy(senderID) {
  try {
    if (!privacyPolicy.has(senderID)) {
      console.log("no tenia politicas y se procedio a buscar en la bd");
      let privacyPolicyStatus = await userService.getPrivacyPolicyStatus(
        senderID
      );
      privacyPolicy.set(senderID, privacyPolicyStatus);
    }
    return privacyPolicy.get(senderID);
  } catch (error) {
    throw error;
  }
}

async function verifyDocumentNum(senderID) {
  if (documentNumbers.has(senderID)) {
  } else {
    console.log(
      "el usuario no estaba en map dni y se procedio a buscar en la bd"
    );
    try {
      let dni = await userService.getDocumentNum(senderID);
      documentNumbers.set(senderID, dni);
    } catch (error) {
      throw error;
    }
  }
  return documentNumbers.get(senderID);
}

function receivedMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;
  //console.log("Received message for user %d and page %d at %d with message:", senderID, recipientID, timeOfMessage);
  //console.log(JSON.stringify(message));

  var isEcho = message.is_echo;
  var messageId = message.mid;
  var appId = message.app_id;
  var metadata = message.metadata;

  // You may get a text or attachment but not both
  var messageText = message.text;
  var messageAttachments = message.attachments;
  var quickReply = message.quick_reply;
  if (isEcho) {
    handleEcho(messageId, appId, metadata);
    return;
  } else if (quickReply) {
    handleQuickReply(senderID, quickReply, messageId);
    return;
  }

  if (messageText) {
    //send message to api.ai
    sendToDialogFlow(senderID, messageText);
  } else if (messageAttachments) {
    handleMessageAttachments(messageAttachments, senderID);
  }
}

function handleMessageAttachments(messageAttachments, senderID) {
  //for now just reply
  sendTextMessage(senderID, "Aún no entiendo ese tipo de mensajes");
}

function handleQuickReply(senderID, quickReply, messageId) {
  var quickReplyPayload = quickReply.payload;
  console.log(
    "Quick reply for message %s with payload %s",
    messageId,
    quickReplyPayload
  );
  //send payload to api.ai
  sendToDialogFlow(senderID, quickReplyPayload);
}

//https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-echo
function handleEcho(messageId, appId, metadata) {
  // Just logging message echoes to console
  console.log(
    "Received echo for message %s and app %d with metadata %s",
    messageId,
    appId,
    metadata
  );
}

async function handleDialogFlowAction(
  sender,
  action,
  messages,
  contexts,
  parameters
) {
  let dynamicResponseIndex;
  let dynamicResponse = "";
  let agencyName = null;
  //looking for $any parameter // because of it represents agencie name (cmac)
  if (parameters.fields.hasOwnProperty("any")) {
    agencyName = parameters.fields.any.stringValue;
    // dynamicResponseIndex = messages.findIndex((message) =>
    //   message.text.text[0].includes(agencyName)
    // );
  }
  switch (action) {
    case "Agencia.listado.region.action": {
      let region = parameters.fields.regions.stringValue;
      let regionsDictionary = require("../Algorithms/regionsDictionary")
        .entries;
      levenshtainService.compareStrings(
        region,
        regionsDictionary,
        async (regionFinded) => {
          if (regionFinded) {
            try {
              let agencies = await agenciesService.listAgenciesByRegion(
                regionFinded
              );
              let agenciesByRegion = "";
              agencies.forEach((agency, agencyIndex) => {
                agenciesByRegion += "AGENCIA " + agency.agency_name;
                if (agencyIndex < agencies.length - 1) {
                  agenciesByRegion +=
                    agencyIndex == agencies.length - 2 ? " y " : " ,";
                }
              });
              console.log("las agencias: ", agenciesByRegion);
              for (let index = 0; index < messages.length; index++) {
                const message = messages[index];
                dynamicResponse = message.text.text[0]
                  .replace(region, regionFinded)
                  .replace("$agencias", agenciesByRegion);
                messages[index].text.text[0] = dynamicResponse;
              }
              handleMessages(messages, sender);
            } catch (error) {
              console.log(error);
              throw error;
            }
          } else {
            sendToDialogFlow(sender, "Agencia.listado.region.fallback");
          }
        }
      );
      break;
    }
    case "horario.action":
      if (agencyName) {
        try {
          let agencies = await agenciesService.listAgencies();
          let agenciesDictionary = [];
          agencies.forEach((strg) => {
            agenciesDictionary.push({
              value: strg.agency_name,
              synonym: [strg.agency_name],
            });
          });
          levenshtainService.compareStrings(
            agencyName,
            agenciesDictionary,
            (agencyName) => {
              if (agencyName) {
                let agency = agencies.find(
                  (agencie) => agencie.agency_name == agencyName
                );
                for (let index = 0; index < messages.length; index++) {
                  if (messages[index].hasOwnProperty("payload")) {
                    messages[index] = buildAgencyCard(messages[index], agency);
                  }
                }
                handleMessages(messages, sender);
              } else {
                sendToDialogFlow(sender, "Agencia.ubicacion.fallback");
              }
            }
          );
        } catch (error) {
          console.log(error);
        }
      } else {
        console.log(
          "Por favor, define el parametro $any (nombre de la agencia)"
        );
        sendTextMessage(
          sender,
          "Aún no me enseñaron sobre las ubicaciones de las agencias"
        );
      }
      break;
    case "agencia.ubicacion.action":
      if (agencyName) {
        try {
          let agencies = await agenciesService.listAgencies();
          let agenciesDictionary = [];
          agencies.forEach((strg) => {
            agenciesDictionary.push({
              value: strg.agency_name,
              synonym: [strg.agency_name],
            });
          });
          levenshtainService.compareStrings(
            agencyName,
            agenciesDictionary,
            (agencyName) => {
              if (agencyName) {
                let agency = agencies.find(
                  (agencie) => agencie.agency_name == agencyName
                );
                for (let index = 0; index < messages.length; index++) {
                  if (messages[index].hasOwnProperty("payload")) {
                    messages[index] = buildAgencyCard(messages[index], agency);
                  }
                }
                handleMessages(messages, sender);
              } else {
                sendToDialogFlow(sender, "Agencia.ubicacion.fallback");
              }
            }
          );
        } catch (error) {
          console.log(error);
        }
      } else {
        console.log(
          "Por favor, define el parametro $any (nombre de la agencia)"
        );
        sendTextMessage(
          sender,
          "Aún no me enseñaron sobre las ubicaciones de las agencias"
        );
      }
      break;
    case "UsuarioDNI.UsuarioDNI-yes":
      let dni = contexts[0].parameters.fields["dni.original"].stringValue;
      if (dni.length != 8) {
        sendTextMessage(sender, "El DNI debe contener 8 dígitos");
        setTimeout(() => {
          sendToDialogFlow(sender, "Usuario.DNI.action");
        }, 1000);
      } else {
        try {
          await userService.updateDocumentNum(dni, sender);
          //set document num into map
          documentNumbers.set(sender, dni);
          //send responses...
          handleMessages(messages, sender);
          setTimeout(() => {
            sendToDialogFlow(sender, "welcome_intent");
          }, 1000);
        } catch (error) {
          await sendTextMessage(
            sender,
            "Algo salió mal... probablemente ese DNI ya estaba registrado"
          );
          throw error;
        }
      }
      break;
    case "Get_started_dni.action":
      handleMessages(messages, sender);
      setTimeout(() => {
        sendToDialogFlow(sender, "Usuario.DNI.action");
      }, 1000);
      break;
    case "Get_Started-yes.action":
      try {
        await userService.updatePrivacyPolicyStatus(sender);
        privacyPolicy.set(sender, true);
        handleMessages(messages, sender);
        setTimeout(() => {
          sendToDialogFlow(sender, "GET_STARTED.DNI");
        }, 1000);
      } catch (error) {
        throw error;
      }
      break;
    case "Usuario.DNI.solicitudActualizacion.action":
      handleMessages(messages, sender);
      setTimeout(() => {
        sendToDialogFlow(
          sender,
          "Usuario.DNI.solicitudActualizacion.actualizacion"
        );
      }, 1000);
      break;
    case "Usuario.DNI.solicitudActualizacion.actualizacion.action":
      console.log(
        "vinieron estos parametros: ",
        JSON.stringify(contexts[0], null, " ")
      );
      let newDni = contexts[0].parameters.fields["dni.original"].stringValue;
      if (newDni) {
        if (newDni.length != 8) {
          sendTextMessage(sender, "El DNI debe contener 8 dígitos");
          setTimeout(() => {
            sendToDialogFlow(
              sender,
              "Usuario.DNI.solicitudActualizacion.actualizacion.action"
            );
          }, 1000);
        } else {
          try {
            await userService.updateDocumentNum(newDni, sender);
            //set document num into map
            documentNumbers.set(sender, newDni);
            //send responses...
            handleMessages(messages, sender);
          } catch (error) {
            await sendTextMessage(
              sender,
              "El DNI " + newDni + " ya estaba registrado"
            );
            sendToDialogFlow(
              sender,
              "Usuario.DNI.solicitudActualizacion.actualizacion.action"
            );
            throw error;
          }
        }
      } else {
        handleMessages(messages, sender);
      }
      break;

    default:
      //unhandled action, just send back the text
      handleMessages(messages, sender);
  }
}

function buildAgencyCard(message, agencyData) {
  let payload = structProtoToJson(message.payload);
  //generic message (image + title)
  if (payload.facebook.attachment.payload.template_type === "generic") {
    let image = payload.facebook.attachment.payload.elements[0].image_url;
    let title = payload.facebook.attachment.payload.elements[0].title;
    let subtitle = payload.facebook.attachment.payload.elements[0].subtitle;
    if (image.includes("{agencia_imagen}")) {
      payload.facebook.attachment.payload.elements[0].image_url = image.replace(
        "{agencia_imagen}",
        agencyData.image
      );
    }
    if (title.includes("{agencia_nombre}")) {
      payload.facebook.attachment.payload.elements[0].title = title.replace(
        "{agencia_nombre}",
        agencyData.agency_name
      );
    }
    if (subtitle) {
      if (
        subtitle.includes("{agencia_direccion}") ||
        subtitle.includes("{agencia_horarios}")
      ) {
        payload.facebook.attachment.payload.elements[0].subtitle = subtitle
          .replace("{agencia_direccion}", agencyData.address)
          .replace("agencia_horarios", agencyData.schedule);
      }
    }
  }
  //button message (horario + direcion + boton)
  if (payload.facebook.attachment.payload.template_type === "button") {
    let button = payload.facebook.attachment.payload;
    if (
      button.text.includes("{agencia_direccion}") ||
      button.text.includes("{agencia_horarios}")
    ) {
      button.text = button.text
        .replace("{agencia_direccion}", agencyData.address)
        .replace("{agencia_horarios}", agencyData.schedule);
    }
    for (const buttonElement of button.buttons) {
      if (buttonElement.hasOwnProperty("url")) {
        if (buttonElement.url.includes("{agencia_url}")) {
          buttonElement.url = buttonElement.url.replace(
            "{agencia_url}",
            agencyData.url
          );
        }
      }
    }
  }
  message.payload = jsonToStructProto(payload);
  return message;
}

function convertToTextMessage(text) {
  return {
    platform: "PLATFORM_UNSPECIFIED",
    text: {
      text: [text],
    },
    message: "text",
  };
}

async function handleMessage(message, sender) {
  switch (message.message) {
    case "text": //text
      for (const text of message.text.text) {
        if (text !== "") {
          await sendTextMessage(sender, text);
        }
      }
      break;
    case "quickReplies": //quick replies
      let replies = [];
      message.quickReplies.quickReplies.forEach((text) => {
        let reply = {
          content_type: "text",
          title: text,
          payload: text,
        };
        replies.push(reply);
      });
      sendQuickReply(sender, message.quickReplies.title, replies);
      break;
    case "image": //image
      sendImageMessage(sender, message.image.imageUri);
      break;
    case "payload":
      let desestructPayload = structProtoToJson(message.payload);
      let richElement = desestructPayload.facebook.attachment.payload;
      // console.log("el rich element: ", richElement);
      //check if generic has no buttons
      if (richElement.template_type === "generic") {
        for (const card of richElement.elements) {
          if (card.buttons.length === 0) delete card["buttons"];
          if (!card.subtitle) delete card["subtitle"];
        }
        console.log("el carrusel: ", richElement);
      }
      try {
        let cards = desestructPayload.facebook.attachment.payload.elements;
        if (cards)
          for (const card of cards) {
            for (const button of card.buttons) {
              if (button.type == "web_url") {
                if (button.url.includes("{dni}"))
                  button.url = button.url.replace(
                    "{dni}",
                    await getDocumentNum(sender)
                  );
              }
            }
          }
      } catch (error) {
        console.log(error);
      }
      var messageData = {
        recipient: {
          id: sender,
        },
        message: desestructPayload.facebook,
      };
      callSendAPI(messageData);
      break;
  }
}

function handleCardMessages(messages, sender) {
  let elements = [];
  for (var m = 0; m < messages.length; m++) {
    let message = messages[m];
    let buttons = [];
    for (var b = 0; b < message.card.buttons.length; b++) {
      let isLink = message.card.buttons[b].postback.substring(0, 4) === "http";
      let button;
      if (isLink) {
        button = {
          type: "web_url",
          title: message.card.buttons[b].text,
          url: message.card.buttons[b].postback,
        };
      } else {
        button = {
          type: "postback",
          title: message.card.buttons[b].text,
          payload: message.card.buttons[b].postback,
        };
      }
      buttons.push(button);
    }

    let element = {
      title: message.card.title,
      image_url: message.card.imageUri,
      subtitle: message.card.subtitle,
      buttons: buttons,
    };
    elements.push(element);
  }
  sendGenericMessage(sender, elements);
}
async function handleMessages(messages, sender) {
  let timeoutInterval = 1100;
  let previousType;
  let cardTypes = [];
  let timeout = 0;
  for (var i = 0; i < messages.length; i++) {
    if (
      previousType == "card" &&
      (messages[i].message != "card" || i == messages.length - 1)
    ) {
      timeout = (i - 1) * timeoutInterval;
      setTimeout(handleCardMessages.bind(null, cardTypes, sender), timeout);
      cardTypes = [];
      timeout = i * timeoutInterval;
      setTimeout(await handleMessage.bind(null, messages[i], sender), timeout);
    } else if (messages[i].message == "card" && i == messages.length - 1) {
      cardTypes.push(messages[i]);
      timeout = (i - 1) * timeoutInterval;
      setTimeout(handleCardMessages.bind(null, cardTypes, sender), timeout);
      cardTypes = [];
    } else if (messages[i].message == "card") {
      cardTypes.push(messages[i]);
    } else {
      timeout = i * timeoutInterval;
      setTimeout(await handleMessage.bind(null, messages[i], sender), timeout);
    }

    previousType = messages[i].message;
  }
}

async function handleDialogFlowResponse(sender, response) {
  let responseText = response.fulfillmentMessages.fulfillmentText;
  let messages = response.fulfillmentMessages;
  let action = response.action;
  let contexts = response.outputContexts;
  let parameters = response.parameters;
  let intentName = response.intent.displayName;
  //   check contrato
  let privacyPolicyStatus = await verifyPrivacyPolicy(sender);
  if (!isDefined(privacyPolicyStatus)) {
    if (
      intentName != "Get_Started" &&
      intentName != "Get_Started - yes" &&
      intentName != "Get_Started - no"
    ) {
      return sendToDialogFlow(sender, "GET_STARTED.contrato");
    }
  }
  //check dni
  if (privacyPolicyStatus) {
    let documentNum = await verifyDocumentNum(sender);
    if (!isDefined(documentNum)) {
      if (
        intentName != "Get_started_dni" &&
        intentName != "Usuario.DNI" &&
        intentName != "Usuario.DNI - yes"
      ) {
        console.log("no habia dni y se pedira..");
        return sendToDialogFlow(sender, "GET_STARTED.dni");
      }
    }
  }
  //end
  if (isDefined(action)) {
    handleDialogFlowAction(sender, action, messages, contexts, parameters);
  } else if (isDefined(messages)) {
    handleMessages(messages, sender);
  } else if (responseText == "" && !isDefined(action)) {
    //dialogflow could not evaluate input.
    sendTextMessage(
      sender,
      "I'm not sure what you want. Can you be more specific?"
    );
  } else if (isDefined(responseText)) {
    sendTextMessage(sender, responseText);
  }
}
async function sendToDialogFlow(sender, textString, params) {
  let textToDialogFlow = textString;
  sendTypingOn(sender);
  console.log("Mensaje para Dialogflow: ", textString);
  try {
    await setSessionAndUser(sender);
    const sessionPath = sessionClient.sessionPath(
      process.env.GOOGLE_PROJECT_ID,
      sessionIds.get(sender)
    );

    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: textToDialogFlow,
          languageCode: process.env.DF_LANGUAGE_CODE,
        },
      },
      queryParams: {
        payload: {
          data: params,
        },
      },
    };
    const responses = await sessionClient.detectIntent(request);

    const result = responses[0].queryResult;
    let defaultResponses = [];
    result.fulfillmentMessages.forEach((element) => {
      if (element.platform == "PLATFORM_UNSPECIFIED") {
        defaultResponses.push(element);
      }
    });
    result.fulfillmentMessages = defaultResponses;
    handleDialogFlowResponse(sender, result);
  } catch (error) {
    console.log("error en sendToDialogflow:", error);
  }
}

async function sendTextMessage(recipientId, text) {
  if (text.includes("{first_name}") || text.includes("{last_name}")) {
    let userData = await fbService.getUserData(recipientId);
    text = text
      .replace("{first_name}", userData.first_name)
      .replace("{last_name}", userData.last_name);
  }
  if (text.includes("{dni}"))
    text = text.replace("{dni}", await getDocumentNum(recipientId));
  var messageData = {
    recipient: {
      id: recipientId,
    },
    message: {
      text: text,
    },
  };
  callSendAPI(messageData);
}

/*
 * Send an image using the Send API.
 *
 */
async function sendImageMessage(recipientId, imageUrl) {
  var messageData = {
    recipient: {
      id: recipientId,
    },
    message: {
      attachment: {
        type: "image",
        payload: {
          url: imageUrl,
        },
      },
    },
  };

  await callSendAPI(messageData);
}

/*
 * Send a Gif using the Send API.
 *
 */
function sendGifMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId,
    },
    message: {
      attachment: {
        type: "image",
        payload: {
          url: process.env.SERVER_URL + "/assets/instagram_logo.gif",
        },
      },
    },
  };

  callSendAPI(messageData);
}

/*
 * Send audio using the Send API.
 *
 */
function sendAudioMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId,
    },
    message: {
      attachment: {
        type: "audio",
        payload: {
          url: process.env.SERVER_URL + "/assets/sample.mp3",
        },
      },
    },
  };

  callSendAPI(messageData);
}

/*
 * Send a video using the Send API.
 * example videoName: "/assets/allofus480.mov"
 */
function sendVideoMessage(recipientId, videoName) {
  var messageData = {
    recipient: {
      id: recipientId,
    },
    message: {
      attachment: {
        type: "video",
        payload: {
          url: process.env.SERVER_URL + videoName,
        },
      },
    },
  };

  callSendAPI(messageData);
}

/*
 * Send a video using the Send API.
 * example fileName: fileName"/assets/test.txt"
 */
function sendFileMessage(recipientId, fileName) {
  var messageData = {
    recipient: {
      id: recipientId,
    },
    message: {
      attachment: {
        type: "file",
        payload: {
          url: process.env.SERVER_URL + fileName,
        },
      },
    },
  };

  callSendAPI(messageData);
}

/*
 * Send a button message using the Send API.
 *
 */
async function sendButtonMessage(recipientId, text, buttons) {
  var messageData = {
    recipient: {
      id: recipientId,
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: text,
          buttons: buttons,
        },
      },
    },
  };
  await callSendAPI(messageData);
}

async function sendGenericMessage(recipientId, elements) {
  var messageData = {
    recipient: {
      id: recipientId,
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: elements,
        },
      },
    },
  };
  await callSendAPI(messageData);
}

function sendReceiptMessage(
  recipientId,
  recipient_name,
  currency,
  payment_method,
  timestamp,
  elements,
  address,
  summary,
  adjustments
) {
  // Generate a random receipt ID as the API requires a unique ID
  var receiptId = "order" + Math.floor(Math.random() * 1000);

  var messageData = {
    recipient: {
      id: recipientId,
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "receipt",
          recipient_name: recipient_name,
          order_number: receiptId,
          currency: currency,
          payment_method: payment_method,
          timestamp: timestamp,
          elements: elements,
          address: address,
          summary: summary,
          adjustments: adjustments,
        },
      },
    },
  };

  callSendAPI(messageData);
}

/*
 * Send a message with Quick Reply buttons.
 *
 */
function sendQuickReply(recipientId, text, replies, metadata) {
  var messageData = {
    recipient: {
      id: recipientId,
    },
    message: {
      text: text,
      metadata: isDefined(metadata) ? metadata : "",
      quick_replies: replies,
    },
  };

  callSendAPI(messageData);
}

/*
 * Send a read receipt to indicate the message has been read
 *
 */
function sendReadReceipt(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId,
    },
    sender_action: "mark_seen",
  };

  callSendAPI(messageData);
}

/*
 * Turn typing indicator on
 *
 */
function sendTypingOn(recipientId) {
  console.log("activando typing");

  var messageData = {
    recipient: {
      id: recipientId,
    },
    sender_action: "typing_on",
  };

  callSendAPI(messageData);
}

/*
 * Turn typing indicator off
 *
 */
function sendTypingOff(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId,
    },
    sender_action: "typing_off",
  };

  callSendAPI(messageData);
}

/*
 * Send a message with the account linking call-to-action
 *
 */
function sendAccountLinking(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId,
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: "Welcome. Link your account.",
          buttons: [
            {
              type: "account_link",
              url: process.env.SERVER_URL + "/authorize",
            },
          ],
        },
      },
    },
  };
  sendTypingOff(recipientId);
  callSendAPI(messageData);
}

/*
 * Call the Send API. The message data goes in the body. If successful, we'll
 * get the message id in a response
 *
 */
async function callSendAPI(messageData) {
  return new Promise((resolve, reject) => {
    request(
      {
        uri: "https://graph.facebook.com/v3.2/me/messages",
        qs: {
          access_token: process.env.FB_PAGE_TOKEN,
        },
        method: "POST",
        json: messageData,
      },
      function (error, response, body) {
        if (!error && response.statusCode == 200) {
          var recipientId = body.recipient_id;
          var messageId = body.message_id;

          if (messageId) {
            console.log(
              "Successfully sent message with id %s to recipient %s",
              messageId,
              recipientId
            );
          } else {
            console.log(
              "Successfully called Send API for recipient %s",
              recipientId
            );
          }
          resolve();
        } else {
          console.error(
            "Failed calling Send API",
            response.statusCode,
            response.statusMessage,
            body.error
          );
          reject();
        }
      }
    );
  });
}

/*
 * Postback Event
 *
 * This event is called when a postback is tapped on a Structured Message.
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/postback-received
 *
 */
function receivedPostback(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfPostback = event.timestamp;
  // The 'payload' param is a developer-defined field which is set in a postback
  // button for Structured Messages.
  var payload = event.postback.payload;
  console.log("el payload de postback: ", payload);
  if (payload != "GET_STARTED") {
    sendToDialogFlow(senderID, payload);
  } else {
    sendToDialogFlow(senderID, "Empezar");
  }
  // console.log("Received postback for user %d and page %d with payload '%s' " +
  //     "at %d", senderID, recipientID, payload, timeOfPostback);
}

/*
 * Message Read Event
 *
 * This event is called when a previously-sent message has been read.
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-read
 *
 */
function receivedMessageRead(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;

  // All messages before watermark (a timestamp) or sequence have been seen.
  var watermark = event.read.watermark;
  var sequenceNumber = event.read.seq;

  console.log(
    "Received message read event for watermark %d and sequence " + "number %d",
    watermark,
    sequenceNumber
  );
}

/*
 * Account Link Event
 *
 * This event is called when the Link Account or UnLink Account action has been
 * tapped.
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/account-linking
 *
 */
function receivedAccountLink(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;

  var status = event.account_linking.status;
  var authCode = event.account_linking.authorization_code;

  console.log(
    "Received account link event with for user %d with status %s " +
      "and auth code %s ",
    senderID,
    status,
    authCode
  );
}

/*
 * Delivery Confirmation Event
 *
 * This event is sent to confirm the delivery of a message. Read more about
 * these fields at https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-delivered
 *
 */
function receivedDeliveryConfirmation(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var delivery = event.delivery;
  var messageIDs = delivery.mids;
  var watermark = delivery.watermark;
  var sequenceNumber = delivery.seq;

  if (messageIDs) {
    messageIDs.forEach(function (messageID) {
      console.log(
        "Received delivery confirmation for message ID: %s",
        messageID
      );
    });
  }

  console.log("All message before %d were delivered.", watermark);
}

/*
 * Authorization Event
 *
 * The value for 'optin.ref' is defined in the entry point. For the "Send to
 * Messenger" plugin, it is the 'data-ref' field. Read more at
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/authentication
 *
 */
function receivedAuthentication(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfAuth = event.timestamp;

  // The 'ref' field is set in the 'Send to Messenger' plugin, in the 'data-ref'
  // The developer can set this to an arbitrary value to associate the
  // authentication callback with the 'Send to Messenger' click event. This is
  // a way to do account linking when the user clicks the 'Send to Messenger'
  // plugin.
  var passThroughParam = event.optin.ref;

  console.log(
    "Received authentication for user %d and page %d with pass " +
      "through param '%s' at %d",
    senderID,
    recipientID,
    passThroughParam,
    timeOfAuth
  );

  // When an authentication is received, we'll send a message back to the sender
  // to let them know it was successful.
  sendTextMessage(senderID, "Authentication successful");
}

/*
 * Verify that the callback came from Facebook. Using the App Secret from
 * the App Dashboard, we can verify the signature that is sent with each
 * callback in the x-hub-signature field, located in the header.
 *
 * https://developers.facebook.com/docs/graph-api/webhooks#setup
 *
 */
function verifyRequestSignature(req, res, buf) {
  var signature = req.headers["x-hub-signature"];

  if (!signature) {
    throw new Error("Couldn't validate the signature.");
  } else {
    var elements = signature.split("=");
    var method = elements[0];
    var signatureHash = elements[1];

    var expectedHash = crypto
      .createHmac("sha1", process.env.FB_APP_SECRET)
      .update(buf)
      .digest("hex");

    if (signatureHash != expectedHash) {
      throw new Error("Couldn't validate the request signature.");
    }
  }
}

function isDefined(obj) {
  if (typeof obj == "undefined") {
    return false;
  }

  if (!obj) {
    return false;
  }
  if (obj == "") {
    return false;
  }
  return obj != null;
}

// // Spin up the server
// app.listen(app.get('port'), function() {
//     console.log('running on port', app.get('port'))
// })
module.exports = router;
