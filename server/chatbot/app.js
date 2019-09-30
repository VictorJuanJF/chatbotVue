'use strict';
const dialogflow = require('dialogflow');
const config = require('./config');
const express = require('express');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const request = require('request');
const app = express();
const router = express.Router();
const uuid = require('uuid');
const levenshtainService = require('../Algorithms/Levenshtein');
//database
const agenciesService = require('../database/agencies');
const userService = require('../database/users');
// Facebook me da payloads (botones,carrusel,etc) en protocolo struct, con la libreria
//de abajo puedo desestructuarlo y mandarlo a graph api
const {
    structProtoToJson
} = require('./structFunctions');


// Messenger API parameters
if (!config.FB_PAGE_TOKEN) {
    throw new Error('missing FB_PAGE_TOKEN');
}
if (!config.FB_VERIFY_TOKEN) {
    throw new Error('missing FB_VERIFY_TOKEN');
}
if (!config.GOOGLE_PROJECT_ID) {
    throw new Error('missing GOOGLE_PROJECT_ID');
}
if (!config.DF_LANGUAGE_CODE) {
    throw new Error('missing DF_LANGUAGE_CODE');
}
if (!config.GOOGLE_CLIENT_EMAIL) {
    throw new Error('missing GOOGLE_CLIENT_EMAIL');
}
if (!config.GOOGLE_PRIVATE_KEY) {
    throw new Error('missing GOOGLE_PRIVATE_KEY');
}
if (!config.FB_APP_SECRET) {
    throw new Error('missing FB_APP_SECRET');
}
if (!config.SERVER_URL) { //used for ink to static files
    throw new Error('missing SERVER_URL');
}



// app.set('port', (process.env.PORT || 5000))

//verify request came from facebook
app.use(bodyParser.json({
    verify: verifyRequestSignature
}));

//serve static files in the public directory
// app.use(express.static('public'));

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: false
}));

// Process application/json
app.use(bodyParser.json());

//maps
const sessionIds = new Map();
const usersMap = new Map();
const privacyPolicy = new Map();
const documentNumbers = new Map();

const credentials = {
    client_email: config.GOOGLE_CLIENT_EMAIL,
    private_key: config.GOOGLE_PRIVATE_KEY,
};

const sessionClient = new dialogflow.SessionsClient({
    projectId: config.GOOGLE_PROJECT_ID,
    credentials
});


// Index route
// app.get('/', function(req, res) {
//     res.send('Hello world, I am a chat bot')
// })

// for Facebook verification
router.get('/webhook/', function (req, res) {
    if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === config.FB_VERIFY_TOKEN) {
        res.status(200).send(req.query['hub.challenge']);
    } else {
        console.error("Failed validation. Make sure the validation tokens match.");
        res.sendStatus(403);
    }
})

/*
 * All callbacks for Messenger are POST-ed. They will be sent to the same
 * webhook. Be sure to subscribe your app to your page to receive callbacks
 * for your page. 
 * https://developers.facebook.com/docs/messenger-platform/product-overview/setup#subscribe_app
 *
 */
router.post('/webhook/', function (req, res) {
    var data = req.body;
    // Make sure this is a page subscription
    if (data.object == 'page') {
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
                    console.log("Webhook received unknown messagingEvent: ", messagingEvent);
                }
            });
        });

        // Assume all went well.
        // You must send back a 200, within 20 seconds
        res.sendStatus(200);
    }
});

function setSessionAndUser(senderID, callback) {
    if (!sessionIds.has(senderID)) {
        console.log("se cumplio la primera condicion");
        sessionIds.set(senderID, uuid.v1());
    }
    if (!usersMap.has(senderID)) {
        console.log("empezando la segunda condicion");
        usersMap.set(senderID, uuid.v1());
        userService.addUser((err, user) => {
            if (err) {
                console.log("algo salio mal agregando al usuario..", err);
            } else {
                usersMap.set(senderID, user);
                console.log("se termino de resolver el add user");
                callback(true);
            }
        }, senderID);
    } else {
        console.log("no paso nada y se mando callback true");
        callback(true);
    }
    console.log("se termino el setUser");
}

function verifyPrivacyPolicy(senderID) {
    console.log("se empezara a verificar las politicas");
    return new Promise((resolve, reject) => {
        if (privacyPolicy.has(senderID)) {
            console.log("el usuario estaba registrado en map y se envio: ", privacyPolicy.get(senderID));
            resolve(privacyPolicy.get(senderID));
        } else {
            console.log("el usuario no estaba en map y se procedio a buscar en la bd");
            userService.getPrivacyPolicyStatus(senderID, (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    console.log("en el map se colocara: ", res);
                    privacyPolicy.set(senderID, res);
                    console.log("estado de las politicas: ", privacyPolicy.get(senderID));

                    resolve(privacyPolicy.get(senderID));
                }

            });
        }
    });
}

function verifyDocumentNum(senderID) {
    console.log("se empezara a verificar el dni");
    return new Promise((resolve, reject) => {
        if (documentNumbers.has(senderID)) {
            console.log("el usuario estaba registrado en map y se envio: ", documentNumbers.get(senderID));
            resolve(documentNumbers.get(senderID));
        } else {
            console.log("el usuario no estaba en map y se procedio a buscar en la bd");
            userService.getDocumentNum(senderID, (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    console.log("en el map se colocara: ", res);
                    if (isDefined(res)) {
                        documentNumbers.set(senderID, res);
                        console.log("estado del dni es: ", documentNumbers.get(senderID));
                        resolve(documentNumbers.get(senderID));
                    } else {
                        resolve(null);
                    }
                }

            });
        }
    });
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
    console.log("se recibio el mensaje: ", messageText);

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
    sendTextMessage(senderID, "Attachment received. Thank you.");
}

function handleQuickReply(senderID, quickReply, messageId) {
    var quickReplyPayload = quickReply.payload;
    console.log("Quick reply for message %s with payload %s", messageId, quickReplyPayload);
    //send payload to api.ai
    sendToDialogFlow(senderID, quickReplyPayload);
}

//https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-echo
function handleEcho(messageId, appId, metadata) {
    // Just logging message echoes to console
    console.log("Received echo for message %s and app %d with metadata %s", messageId, appId, metadata);
}

async function handleDialogFlowAction(sender, action, messages, contexts, parameters) {
    let dynamicResponseIndex = null;
    let dynamicResponse = "";
    let agencyName = null;
    //looking for $any parameter // because of it represents agencie name (cmac)
    if (parameters.fields.hasOwnProperty('any')) {
        agencyName = parameters.fields.any.stringValue;
        dynamicResponseIndex = messages.findIndex(message => message.text.text[0].includes(agencyName));
    }
    switch (action) {
        case 'Agencia.listado.region.action': {
            let region = parameters.fields.regions.stringValue;
            let regionsDictionary = require('../Algorithms/regionsDictionary').entries;
            levenshtainService.compareStrings(region, regionsDictionary, (regionFinded) => {
                if (regionFinded) {
                    agenciesService.listAgenciesByRegion(regionFinded, (err, agencies) => {
                        console.log("llegaron estas agencias: ", agencies);
                        let agenciesByRegion = "";
                        agencies.forEach((agency, agencyIndex) => {
                            agenciesByRegion += "AGENCIA " + agency.agency_name;
                            if (agencyIndex < agencies.length - 1) {
                                agenciesByRegion += (agencyIndex) == agencies.length - 2 ? " y " : " ,";
                            }
                        });
                        console.log("las agencias: ", agenciesByRegion);
                        let dynamicRespose = "";
                        for (let index = 0; index < messages.length; index++) {
                            const message = messages[index];
                            dynamicResponse = message.text.text[0].replace(region, regionFinded).replace('$agencias', agenciesByRegion);
                            messages[index].text.text[0] = dynamicResponse;
                        }
                        handleMessages(messages, sender);
                    });
                } else {
                    sendToDialogFlow(sender, "Agencia.listado.region.fallback")
                }

            });
            break;
        }
        case 'horario.action':
            if (agencyName) {
                agenciesService.listAgencies((err, agencies) => {
                    if (err) {
                        console.log("algo salio mal en la llamada a la base de datos: ", err);
                    } else {
                        var agenciesDictionary = [];
                        agencies.forEach(strg => {
                            agenciesDictionary.push({
                                value: strg.agency_name,
                                synonym: [strg.agency_name]
                            });
                        });
                        levenshtainService.compareStrings(agencyName, agenciesDictionary, (agency) => {
                            if (agency) {
                                var agency = agencies.find(agencie => agencie.agency_name == agency);
                                for (let index = 0; index < messages.length; index++) {
                                    const message = messages[index];
                                    dynamicResponse = message.text.text[0].replace(agencyName, agency.agency_name).replace('$direccion', agency.address).replace('$horario', agency.schedule);
                                    messages[index].text.text[0] = dynamicResponse;
                                }
                                handleMessages(messages, sender);
                            } else {
                                console.log("como el valor es menor a 0.6 se entro al mensaje de rechazo");
                                sendToDialogFlow(sender, "Agencia.horario.fallback");
                            }

                        });
                    }
                });
            } else {
                console.log("Por favor, define el parametro $any (nombre de la agencia)");
                sendTextMessage(sender, "Aún no me enseñaron sobre los horarios de las agencias");
            }
            break;
        case 'agencia.ubicacion.action':
            if (agencyName) {
                agenciesService.listAgencies((err, agencies) => {
                    if (err) {
                        console.log("algo salio mal en la llamada a la base de datos: ", err);
                    } else {
                        var agenciesDictionary = [];
                        agencies.forEach(strg => {
                            agenciesDictionary.push({
                                value: strg.agency_name,
                                synonym: [strg.agency_name]
                            });
                        });
                        levenshtainService.compareStrings(agencyName, agenciesDictionary, (agency) => {
                            if (agency) {
                                var agency = agencies.find(agencie => agencie.agency_name == agency);
                                for (let index = 0; index < messages.length; index++) {
                                    const message = messages[index];
                                    dynamicResponse = message.text.text[0].replace(agencyName, agency.agency_name).replace('$direccion', agency.address).replace('$horario', agency.schedule);
                                    messages[index].text.text[0] = dynamicResponse;
                                }
                                handleMessages(messages, sender);
                            } else {
                                sendToDialogFlow(sender, "Agencia.ubicacion.fallback");
                            }

                        });
                    }
                });
            } else {
                console.log("Por favor, define el parametro $any (nombre de la agencia)");
                sendTextMessage(sender, "Aún no me enseñaron sobre las ubicaciones de las agencias");
            }
            break;
        case 'UsuarioDNI.UsuarioDNI-yes':
            // let dni = parameters.fields.dni;
            console.log("el DNI a guardar es: ", contexts[0].parameters);
            // console.log("el DNI a guardar es: ", contexts[0].parameters.fields.dni.numberValue);
            let dni = contexts[0].parameters.fields.dni.numberValue;
            if (dni.toString().length != 8) {
                sendTextMessage(sender, "El DNI debe contener 8 dígitos");
                setTimeout(() => {
                    sendToDialogFlow(sender, "Usuario.DNI.action");
                }, 1000);
            } else {
                await userService.updateDocumentNum(dni.toString(), sender);
                handleMessages(messages, sender);
                setTimeout(() => {
                    sendToDialogFlow(sender, "welcome_intent");
                }, 1000);
            }
            break;
        case 'Get_started_dni.action':
            handleMessages(messages, sender);
            setTimeout(() => {
                sendToDialogFlow(sender, "Usuario.DNI.action");
            }, 1000);
            break;

        default:
            //unhandled action, just send back the text
            console.log("se mandara el mensaje por defecto de handleDialogFlowAction");
            handleMessages(messages, sender);
    }
}

function convertToTextMessage(text) {
    return {
        platform: "PLATFORM_UNSPECIFIED",
        text: {
            text: [text]
        },
        message: "text"
    }
}

function handleMessage(message, sender) {
    switch (message.message) {
        case "text": //text
            message.text.text.forEach((text) => {
                if (text !== '') {
                    sendTextMessage(sender, text);
                }
            });
            break;
        case "quickReplies": //quick replies
            let replies = [];
            message.quickReplies.quickReplies.forEach((text) => {
                let reply = {
                    "content_type": "text",
                    "title": text,
                    "payload": text
                }
                replies.push(reply);
            });
            sendQuickReply(sender, message.quickReplies.title, replies);
            break;
        case "image": //image
            sendImageMessage(sender, message.image.imageUri);
            break;
        case "payload":
            let desestructPayload = structProtoToJson(message.payload);
            var messageData = {
                recipient: {
                    id: sender
                },
                message: desestructPayload.facebook

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
            let isLink = (message.card.buttons[b].postback.substring(0, 4) === 'http');
            let button;
            if (isLink) {
                button = {
                    "type": "web_url",
                    "title": message.card.buttons[b].text,
                    "url": message.card.buttons[b].postback
                }
            } else {
                button = {
                    "type": "postback",
                    "title": message.card.buttons[b].text,
                    "payload": message.card.buttons[b].postback
                }
            }
            buttons.push(button);
        }


        let element = {
            "title": message.card.title,
            "image_url": message.card.imageUri,
            "subtitle": message.card.subtitle,
            "buttons": buttons
        };
        elements.push(element);
    }
    sendGenericMessage(sender, elements);
}


function handleMessages(messages, sender) {
    let timeoutInterval = 1100;
    let previousType;
    let cardTypes = [];
    let timeout = 0;
    for (var i = 0; i < messages.length; i++) {

        if (previousType == "card" && (messages[i].message != "card" || i == messages.length - 1)) {
            timeout = (i - 1) * timeoutInterval;
            setTimeout(handleCardMessages.bind(null, cardTypes, sender), timeout);
            cardTypes = [];
            timeout = i * timeoutInterval;
            setTimeout(handleMessage.bind(null, messages[i], sender), timeout);
        } else if (messages[i].message == "card" && i == messages.length - 1) {
            cardTypes.push(messages[i]);
            timeout = (i - 1) * timeoutInterval;
            setTimeout(handleCardMessages.bind(null, cardTypes, sender), timeout);
            cardTypes = [];
        } else if (messages[i].message == "card") {
            cardTypes.push(messages[i]);
        } else {
            timeout = i * timeoutInterval;
            setTimeout(handleMessage.bind(null, messages[i], sender), timeout);
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
    console.log("el intent activo fue: ", response.intent.displayName);
    let documentNum = await verifyDocumentNum(sender);
    console.log("el numero de doc recibido fue: ", documentNum);
    if (!isDefined(documentNum)) {
        let intentName = response.intent.displayName;
        if (intentName != 'Get_started_dni' && intentName != 'Usuario.DNI' && intentName != 'Usuario.DNI - yes') {
            console.log("no habia dni y se pedira");
            return sendToDialogFlow(sender, "GET_STARTED");
        }
    }
    if (isDefined(action)) {
        handleDialogFlowAction(sender, action, messages, contexts, parameters);
    } else if (isDefined(messages)) {
        handleMessages(messages, sender);
    } else if (responseText == '' && !isDefined(action)) {
        //dialogflow could not evaluate input.
        sendTextMessage(sender, "I'm not sure what you want. Can you be more specific? gaa");
    } else if (isDefined(responseText)) {
        sendTextMessage(sender, responseText);
    }
}
async function sendToDialogFlow(sender, textString, params) {
    let textToDialogFlow = textString;
    sendTypingOn(sender);
    console.log("se enviara el texto a Dialogflow: ", textString);
    setSessionAndUser(sender, async (callback) => {
        if (callback) {
            try {
                const sessionPath = sessionClient.sessionPath(
                    config.GOOGLE_PROJECT_ID,
                    sessionIds.get(sender)
                );

                const request = {
                    session: sessionPath,
                    queryInput: {
                        text: {
                            text: textToDialogFlow,
                            languageCode: config.DF_LANGUAGE_CODE,
                        },
                    },
                    queryParams: {
                        payload: {
                            data: params
                        }
                    }
                };
                const responses = await sessionClient.detectIntent(request);

                const result = responses[0].queryResult;
                let defaultResponses = [];
                result.fulfillmentMessages.forEach(element => {
                    if (element.platform == 'PLATFORM_UNSPECIFIED') {
                        defaultResponses.push(element);
                    }
                });
                result.fulfillmentMessages = defaultResponses;
                handleDialogFlowResponse(sender, result);
            } catch (e) {
                console.log('error');
                console.log(e);
            }
        }
    });

}




function sendTextMessage(recipientId, text) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            text: text
        }
    }
    callSendAPI(messageData);
}

/*
 * Send an image using the Send API.
 *
 */
function sendImageMessage(recipientId, imageUrl) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "image",
                payload: {
                    url: imageUrl
                }
            }
        }
    };

    callSendAPI(messageData);
}

/*
 * Send a Gif using the Send API.
 *
 */
function sendGifMessage(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "image",
                payload: {
                    url: config.SERVER_URL + "/assets/instagram_logo.gif"
                }
            }
        }
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
            id: recipientId
        },
        message: {
            attachment: {
                type: "audio",
                payload: {
                    url: config.SERVER_URL + "/assets/sample.mp3"
                }
            }
        }
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
            id: recipientId
        },
        message: {
            attachment: {
                type: "video",
                payload: {
                    url: config.SERVER_URL + videoName
                }
            }
        }
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
            id: recipientId
        },
        message: {
            attachment: {
                type: "file",
                payload: {
                    url: config.SERVER_URL + fileName
                }
            }
        }
    };

    callSendAPI(messageData);
}



/*
 * Send a button message using the Send API.
 *
 */
function sendButtonMessage(recipientId, text, buttons) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "button",
                    text: text,
                    buttons: buttons
                }
            }
        }
    };

    callSendAPI(messageData);
}


function sendGenericMessage(recipientId, elements) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "generic",
                    elements: elements
                }
            }
        }
    };

    callSendAPI(messageData);
}


function sendReceiptMessage(recipientId, recipient_name, currency, payment_method,
    timestamp, elements, address, summary, adjustments) {
    // Generate a random receipt ID as the API requires a unique ID
    var receiptId = "order" + Math.floor(Math.random() * 1000);

    var messageData = {
        recipient: {
            id: recipientId
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
                    adjustments: adjustments
                }
            }
        }
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
            id: recipientId
        },
        message: {
            text: text,
            metadata: isDefined(metadata) ? metadata : '',
            quick_replies: replies
        }
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
            id: recipientId
        },
        sender_action: "mark_seen"
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
            id: recipientId
        },
        sender_action: "typing_on"
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
            id: recipientId
        },
        sender_action: "typing_off"
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
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "button",
                    text: "Welcome. Link your account.",
                    buttons: [{
                        type: "account_link",
                        url: config.SERVER_URL + "/authorize"
                    }]
                }
            }
        }
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
    let sender = messageData.recipient.id;
    request({
        uri: 'https://graph.facebook.com/v3.2/me/messages',
        qs: {
            access_token: config.FB_PAGE_TOKEN
        },
        method: 'POST',
        json: messageData
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var recipientId = body.recipient_id;
            var messageId = body.message_id;

            if (messageId) {
                console.log("Successfully sent message with id %s to recipient %s",
                    messageId, recipientId);
            } else {
                console.log("Successfully called Send API for recipient %s",
                    recipientId);
            }
        } else {
            console.error("Failed calling Send API", response.statusCode, response.statusMessage, body.error);
        }
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
    if (payload != 'GET_STARTED') {
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

    console.log("Received message read event for watermark %d and sequence " +
        "number %d", watermark, sequenceNumber);
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

    console.log("Received account link event with for user %d with status %s " +
        "and auth code %s ", senderID, status, authCode);
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
            console.log("Received delivery confirmation for message ID: %s",
                messageID);
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

    console.log("Received authentication for user %d and page %d with pass " +
        "through param '%s' at %d", senderID, recipientID, passThroughParam,
        timeOfAuth);

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
        throw new Error('Couldn\'t validate the signature.');
    } else {
        var elements = signature.split('=');
        var method = elements[0];
        var signatureHash = elements[1];

        var expectedHash = crypto.createHmac('sha1', config.FB_APP_SECRET)
            .update(buf)
            .digest('hex');

        if (signatureHash != expectedHash) {
            throw new Error("Couldn't validate the request signature.");
        }
    }
}

function isDefined(obj) {
    if (typeof obj == 'undefined') {
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