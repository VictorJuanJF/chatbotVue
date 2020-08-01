const dialogflow = require("dialogflow");
const uuid = require("uuid");
const fs = require("fs");
/**
 *
 *
 * @param {*} name represent full path from parent to intent
 */
function extractIntentId(name) {
  let basePath = `projects/${process.env.GOOGLE_PROJECT_ID}/agent/intents/`;
  let intentId = name.substring(name.lastIndexOf("/") + 1, name.length);
  return intentId;
}

let credentialsPath = __dirname + "/credencialesJSON/";
fs.readdirSync("./server/chatbot/credencialesJSON").forEach((file) => {
  credentialsPath = credentialsPath + file;
});
// Instantiates clients
const intentsClient = new dialogflow.IntentsClient({
  projectId: process.env.GOOGLE_PROJECT_ID,
  keyFilename: credentialsPath,
});

// The path to identify the agent that owns the intents.
const projectAgentPath = intentsClient.projectAgentPath(
  process.env.GOOGLE_PROJECT_ID
);

/**
 * Send a query to the dialogflow agent, and return the query result.
 * @param {string} projectId The project to be used
 */
async function runSample(projectId) {
  // A unique identifier for the given session
  const sessionId = uuid.v4();

  // Create a new session
  const sessionClient = new dialogflow.SessionsClient();
  const sessionPath = sessionClient.sessionPath(projectId, sessionId);

  // The text query request.
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        // The query to send to the dialogflow agent
        text: "nuevo intent",
        // The language used by the client (en-US)
        languageCode: "es",
      },
    },
  };

  // Send request and log result
  const responses = await sessionClient.detectIntent(request);
  console.log("Detected intent");
  console.log("el resultado es: ", responses);
  const result = responses[0].queryResult;
  console.log(`  Query: ${result.queryText}`);
  console.log(`  Response: ${result.fulfillmentText}`);
  if (result.intent) {
    console.log(`  Intent: ${result.intent.displayName}`);
  } else {
    console.log(`  No intent matched.`);
  }
}
async function createIntent(displayName, trainingPhrasesParts, messageTexts) {
  const trainingPhrases = [];

  trainingPhrasesParts.forEach((trainingPhrasesPart) => {
    const part = {
      text: trainingPhrasesPart,
    };

    // Here we create a new training phrase for each provided part.
    const trainingPhrase = {
      type: "EXAMPLE",
      parts: [part],
    };

    trainingPhrases.push(trainingPhrase);
  });
  console.log("el listado de frases entrenadas: ", trainingPhrases);
  // createIntent('AmiIntentDesdeApi6', ['Hola que tal', 'Como estas', 'Brus Harper'], [
  //     'que pasa', 'como te va',
  // ]);

  const messageText = {
    text: messageTexts,
  };

  const message = {
    text: messageText,
  };

  const intent = {
    displayName: displayName,
    trainingPhrases: trainingPhrases,
    messages: [message, message],
  };

  console.log("las respuestas son: ", JSON.stringify(message));

  const createIntentRequest = {
    parent: projectAgentPath,
    intent: intent,
  };

  // Create the intent
  const responses = await intentsClient.createIntent(createIntentRequest);
  console.log(`Intent ${responses[0].name} created`);
  // [END dialogflow_create_intent]
}

async function deleteIntent(projectId, intentId) {
  console.log("Empezando eliminacion de intent");
  // [START dialogflow_delete_intent]
  // Imports the Dialogflow library
  const dialogflow = require("dialogflow");

  // Instantiates clients
  const intentsClient = new dialogflow.IntentsClient();

  const intentPath = intentsClient.intentPath(projectId, intentId);

  const request = {
    name: intentPath,
  };

  // Send the request for deleting the intent.
  const result = await intentsClient.deleteIntent(request);
  console.log(`Intent ${intentPath} deleted`);
  return result;
  // [END dialogflow_delete_intent]
}

const listIntents = async (callback) => {
  const request = {
    parent: projectAgentPath,
    intentView: "INTENT_VIEW_FULL",
  };
  const [response] = await intentsClient.listIntents(request);
  callback(response);
};

const updateIntent = async (newIntent, callback) => {
  console.log("se entro a actualizar intent");
  const request = {
    intent: newIntent,
    updateMask: {
      paths: ["messages", "display_name", "training_phrases"],
    },
    // parent: projectAgentPath,
  };
  const [response] = await intentsClient.updateIntent(request);
  callback(response);
};

async function listEntities(projectId, entityTypeId) {
  // [START dialogflow_create_entity]
  // Imports the Dialogflow library
  const dialogflow = require("dialogflow");

  // Instantiates clients
  const entityTypesClient = new dialogflow.EntityTypesClient();

  // The path to the agent the entity types belong to.
  const entityTypePath = entityTypesClient.entityTypePath(
    projectId,
    entityTypeId
  );

  // The request.
  const request = {
    name: entityTypePath,
  };

  // Call the client library to retrieve a list of all existing entity types.
  const [response] = await entityTypesClient.getEntityType(request);
  response.entities.forEach((entity) => {
    console.log(`Entity value: ${entity.value}`);
    console.log(`Entity synonyms: ${entity.synonyms}`);
  });
  return response;
  // [END dialogflow_create_entity]
}

async function deleteEntity(projectId, entityTypeId, entityValue) {
  // [START dialogflow_delete_entity]
  // Imports the Dialogflow library
  const dialogflow = require("dialogflow");

  // Instantiates clients
  const entityTypesClient = new dialogflow.EntityTypesClient();

  // The path to the agent the entity types belong to.
  const entityTypePath = entityTypesClient.entityTypePath(
    projectId,
    entityTypeId
  );

  const request = {
    parent: entityTypePath,
    entityValues: [entityValue],
  };

  // Call the client library to delete the entity type.
  await entityTypesClient.batchDeleteEntities(request);
  console.log(`Entity Value ${entityValue} deleted`);
  // [END dialogflow_delete_entity]
}

async function listEntities(projectId, entityTypeId) {
  console.log("Empezando listado de entities");
  // [START dialogflow_create_entity]
  // Imports the Dialogflow library
  const dialogflow = require("dialogflow");

  // Instantiates clients
  const entityTypesClient = new dialogflow.EntityTypesClient();

  // The path to the agent the entity types belong to.
  const entityTypePath = entityTypesClient.entityTypePath(
    projectId,
    entityTypeId
  );

  // The request.
  const request = {
    name: entityTypePath,
  };

  // Call the client library to retrieve a list of all existing entity types.
  const [response] = await entityTypesClient.getEntityType(request);
  response.entities.forEach((entity) => {
    console.log(`Entity value: ${entity.value}`);
    console.log(`Entity synonyms: ${entity.synonyms}`);
  });
  return response;
  // [END dialogflow_create_entity]
}

async function listEntityTypes(projectId) {
  // [START dialogflow_list_entity_types]
  // Imports the Dialogflow library
  const dialogflow = require("dialogflow");

  // Instantiates clients
  const entityTypesClient = new dialogflow.EntityTypesClient();

  // The path to the agent the entity types belong to.
  const agentPath = entityTypesClient.projectAgentPath(projectId);

  const request = {
    parent: agentPath,
  };

  // Call the client library to retrieve a list of all existing entity types.
  const [response] = await entityTypesClient.listEntityTypes(request);
  response.forEach((entityType) => {
    console.log(`Entity type name: ${entityType.name}`);
    console.log(`Entity type display name: ${entityType.displayName}`);
    console.log(`Number of entities: ${entityType.entities.length}\n`);
  });
  return response;
  // [END dialogflow_list_entity_types]
}

module.exports = {
  listIntents,
  updateIntent,
};
