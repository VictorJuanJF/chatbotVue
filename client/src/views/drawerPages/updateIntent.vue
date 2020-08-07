<template>
  <v-container v-if="intent">
    <h1>Nombre de la intención: {{intent.displayName}}</h1>
    <v-container class="pa-8">
      <v-text-field label="Nombre de la intención" v-model="intent.displayName"></v-text-field>
      <div class="title">Frases de entrenamiento</div>
      <v-text-field
        label="Añade una frase de entrenamiento"
        prepend-inner-icon="mdi-format-quote-close"
        @keyup.enter="addTrainingPhrase(newTrainingPhrase)"
        v-model="newTrainingPhrase"
      ></v-text-field>
      <v-row
        align="center"
        v-for="(trainingPhrase,trainingPhraseIndex) in trainingPhrases"
        :key="trainingPhraseIndex"
      >
        <v-col cols="12" sm="1">
          <p class="text-center">{{trainingPhraseIndex+1}}</p>
        </v-col>
        <v-col class="pa-0" cols="12" sm="10">
          <v-text-field
            prepend-inner-icon="mdi-format-quote-close"
            v-model="trainingPhrase.parts[0].text"
          ></v-text-field>
        </v-col>
        <v-col cols="12" sm="1">
          <v-btn icon @click="deleteTrainingPhrase(trainingPhraseIndex)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
    <div class="title">Respuestas</div>
    <draggable
      @change="rerenderComponents"
      v-model="intent.messages"
      handle=".my-handle"
      :animation="300"
    >
      <transition-group>
        <v-card
          v-for="(multipleMessage,multipleMessageIndex) in intent.messages"
          :key="'mensaje'+multipleMessageIndex"
        >
          <div v-if="multipleMessage.hasOwnProperty('text')">
            <v-card-title @click class="primary my-handle">
              <v-icon dark class="mr-4">mdi-magnify</v-icon>
              <h2 class="white--text title">Mensaje Múltiple</h2>
              <v-spacer></v-spacer>
              <v-btn @click="deleteMessage(multipleMessageIndex)" small color="error">Eliminar</v-btn>
            </v-card-title>
            <v-container>
              <v-row
                align="center"
                v-for="(message,messageIndex) in multipleMessage.text.text"
                :key="'multiple'+messageIndex"
              >
                <v-col cols="12" sm="1" class="text-center">{{messageIndex+1}}</v-col>
                <v-col cols="12" sm="11">
                  <v-textarea
                    append-outer-icon="mdi-delete"
                    @click:append-outer="deleteFallbackResponse(multipleMessageIndex,messageIndex)"
                    rows="1"
                    v-model="multipleMessage.text.text[messageIndex]"
                    auto-grow
                  ></v-textarea>
                </v-col>
              </v-row>
              <v-row justify="center">
                <v-col cols="11">
                  <v-textarea
                    placeholder="Ingresa una variante a la respuesta"
                    @keyup.enter="addResponseVariant(multipleMessage.text.text,responseVariant)"
                    rows="1"
                    v-model="responseVariant"
                    auto-grow
                  ></v-textarea>
                </v-col>
              </v-row>
            </v-container>
          </div>
          <div v-if="multipleMessage.hasOwnProperty('payload')">
            <v-card-title @click class="primary my-handle">
              <v-icon dark class="mr-4">mdi-magnify</v-icon>
              <h2 class="white--text title">Rich Message</h2>
              <v-spacer></v-spacer>
              <v-btn @click="deleteMessage(multipleMessageIndex)" small color="error">Eliminar</v-btn>
            </v-card-title>
            <v-container>
              <component
                v-if="!rerender"
                @onSaveGeneric="saveGeneric"
                @onSaveButton="saveButton"
                @onSaveQuickReply="saveQuickReply"
                :index="multipleMessageIndex"
                :data="structProtoToJson(multipleMessage.payload)"
                :is="dynamicComponent(typeRichMessage(multipleMessageIndex))"
              ></component>
            </v-container>
          </div>
        </v-card>
      </transition-group>
    </draggable>
    <v-btn text color="error" :to="{name:'dashboard'}">Atras</v-btn>
    <v-btn class="ml-3" @click="saveIntent(intent)" color="success">Guardar</v-btn>
    <v-menu open-on-hover top offset-y>
      <template v-slot:activator="{ on }">
        <v-btn v-on="on" class="ml-3" color="primary">Añadir respuesta</v-btn>
      </template>
      <v-list>
        <v-list-item @click="insertElement('simpleMessage')">
          <v-list-item-title>Mensaje Simple</v-list-item-title>
        </v-list-item>
        <v-list-item @click="insertElement('button')">
          <v-list-item-title>Botón</v-list-item-title>
        </v-list-item>
        <v-list-item @click="insertElement('generic')">
          <v-list-item-title>Menú Carrusel</v-list-item-title>
        </v-list-item>
        <v-list-item @click="insertElement('quickReply')">
          <v-list-item-title>Quick replies</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-container>
</template>

<script>
import {
  jsonToStructProto,
  structProtoToJson,
} from "../../tools/structFunctions";
import generic from "./richMessages/generic";
import quickReply from "./richMessages/quickReply";
import simpleButton from "./richMessages/simpleButton";
import {
  messageTemplate,
  genericTemplate,
  quickReplyTemplate,
  buttonTemplate,
} from "../../tools/richMessageTemplates";
import draggable from "vuedraggable";
export default {
  components: {
    draggable,
  },
  data() {
    return {
      responseVariant: "",
      rerender: false,
      intent: null,
      newTrainingPhrase: "",
      components: [generic, quickReply, simpleButton],
    };
  },
  mounted() {
    this.initialData();
  },
  methods: {
    addResponseVariant(responses, responseVariant) {
      responses.push(responseVariant);
      this.responseVariant = "";
    },
    rerenderComponents() {
      console.log("renderizar de nuevo");
      this.rerender = true;
      setTimeout(() => {
        this.rerender = false;
      }, 200);
    },
    deleteMessage(index) {
      this.intent.messages.splice(index, 1);
    },
    dynamicComponent(type) {
      switch (type) {
        case "button":
          return this.components[2];
          break;
        case "generic":
          return this.components[0];
          break;
        case "quickReply":
          return this.components[1];
          break;
        default:
          break;
      }
    },
    typeRichMessage(messageIndex) {
      return this.structProtoToJson(this.intent.messages[messageIndex].payload)
        .facebook.attachment
        ? this.structProtoToJson(this.intent.messages[messageIndex].payload)
            .facebook.attachment.payload.template_type
        : "quickReply";
    },
    jsonToStructProto(json) {
      return jsonToStructProto(json);
    },
    structProtoToJson(struct) {
      return structProtoToJson(struct);
    },
    deleteFallbackResponse(messageIndex, fallbackMessageIndex) {
      this.intent.messages[messageIndex].text.text.splice(
        fallbackMessageIndex,
        1
      );
    },
    initialData() {
      this.intent = this.$store.state.intents.find((intent) =>
        intent.name.includes(this.intentId)
      );
    },
    saveIntent(newIntent) {
      this.$store.dispatch("showOverlay", {
        active: true,
        text: "Actualizando",
      });
      console.log(
        "se lanzará esto: ",
        structProtoToJson(newIntent.messages[0].payload)
      );
      axios
        .put("/api/chatbot/agent/intents/update", { newIntent })
        .then((res) => {
          console.log(res);
          if (res.data.ok) {
            this.$store.dispatch("showOverlay", {
              active: false,
              text: "",
            });
            this.$store.dispatch("showSnackbar", {
              text: res.data.message,
              color: "success",
            });
          }
        })
        .catch((err) => {
          console.error(err);
        })
        .finally(() => {
          this.$store.dispatch("showOverlay", {
            active: false,
            text: "Actualizando",
          });
        });
    },
    addTrainingPhrase(trainingPhrase) {
      this.intent.trainingPhrases.push({
        parts: [
          {
            text: trainingPhrase,
            entityType: "",
            alias: "",
            userDefined: false,
          },
        ],
        name: "be6f229c-44c2-496f-929d-7f79c7395b9d",
        type: "EXAMPLE",
        timesAddedCount: 0,
      });
    },
    deleteTrainingPhrase(index) {
      this.intent.trainingPhrases.splice(index, 1);
    },
    saveGeneric(data, index) {
      console.log(
        "se actualizara el generic que cuenta con es: ",
        this.structProtoToJson(this.intent.messages[index].payload)
      );
      this.intent.messages[index].payload = this.jsonToStructProto(data);
    },
    saveButton(data, index) {
      this.intent.messages[index].payload = this.jsonToStructProto(data);
    },
    saveQuickReply(data, index) {
      console.log(
        "actualmente hay esto: ",
        this.intent.messages[index].payload
      );
      console.log("se guardara esto: ", this.jsonToStructProto(data), index);
      this.intent.messages[index].payload = this.jsonToStructProto(data);
    },
    insertElement(type) {
      switch (type) {
        case "simpleMessage":
          this.intent.messages.push(messageTemplate());
          break;
        case "button":
          this.intent.messages.push(buttonTemplate());
          break;
        case "generic":
          this.intent.messages.push(genericTemplate());
          break;
        case "quickReply":
          console.log("se agregara el intent: ", quickReplyTemplate());
          this.intent.messages.push(quickReplyTemplate());
          break;

        default:
          break;
      }
    },
  },
  computed: {
    intentId() {
      return this.$route.params.id;
    },
    trainingPhrases() {
      return this.intent.trainingPhrases;
    },
  },
};
</script>

<style lang="scss" scoped>
</style>