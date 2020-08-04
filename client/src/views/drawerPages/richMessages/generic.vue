<template>
  <v-container>
    <strong>Rich message de tipo: generic</strong>
    <!-- {{elements}} -->
    <br />
    <v-dialog v-model="dialog" width="800">
      <template v-slot:activator="{ on:dialog }">
        <v-tooltip bottom>
          <template v-slot:activator="{ on: tooltip }">
            <v-btn color="primary" dark v-on="{ ...tooltip, ...dialog }">Editar</v-btn>
          </template>
          <span>Editar pantallas</span>
        </v-tooltip>
      </template>
      <v-card>
        <v-toolbar color="primary" dark>
          <v-toolbar-title>Mensaje tipo generic</v-toolbar-title>
        </v-toolbar>
        <v-container>
          <v-tabs>
            <v-tab v-for="(element,elementIndex) in elements" :key="elementIndex">
              <v-icon left>mdi-access-point</v-icon>
              {{elementIndex+1}}. {{element.title}}
            </v-tab>
            <v-tab-item v-for="(element,elementIndex) in elements" :key="'pantallas'+elementIndex">
              <v-card flat>
                <v-container>
                  <v-row>
                    <v-text-field clearable class="mx-3" label="Título" v-model="element.title"></v-text-field>
                    <v-text-field
                      clearable
                      class="mx-3"
                      label="Descripción"
                      v-model="element.subtitle"
                    ></v-text-field>
                  </v-row>
                  <v-text-field clearable label="URL de la imagen" v-model="element.image_url"></v-text-field>
                  <div class="ml-2 headline">Botones</div>
                  <v-row
                    class="ml-4"
                    v-for="(button,buttonIndex) in element.buttons"
                    :key="buttonIndex"
                  >
                    <span class="title">Botón {{buttonIndex+1}}</span>
                    <v-btn
                      class="ml-3"
                      small
                      color="error"
                      @click="deleteButtonScreen(element.buttons,buttonIndex)"
                    >Eliminar</v-btn>
                    <v-col class="ma-0" cols="12" sm="12">
                      <v-row>
                        <p class="subtitle-1">Tipo:</p>
                        <v-radio-group
                          @change="changeButtonType(element.buttons,elementIndex,buttonIndex,button.type)"
                          class="ma-0 ml-5"
                          row
                          v-model="button.type"
                        >
                          <v-radio color="primary" label="POSTBACK" value="postback"></v-radio>
                          <v-radio color="primary" label="ENLACE WEB" value="web_url"></v-radio>
                        </v-radio-group>
                      </v-row>
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-text-field clearable label="texto del botón" v-model="button.title"></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-if="button.type=='postback'"
                        clearable
                        label="Mensaje de emparejamiento"
                        v-model="button.payload"
                      ></v-text-field>
                      <v-text-field
                        v-if="button.type=='web_url'"
                        clearable
                        label="Url"
                        v-model="button.url"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="12">
                      <v-radio-group v-model="webview" row>
                        <v-radio label="Option 1" value="radio-1"></v-radio>
                        <v-radio label="Option 2" value="radio-2"></v-radio>
                      </v-radio-group>
                    </v-col>
                  </v-row>
                  <v-row justify="center">
                    <v-col sm="4">
                      <v-card outlined class="pa-3">
                        <strong>Vista previa del rich message</strong>
                        <v-img
                          v-if="element.image_url"
                          :src="element.image_url"
                          aspect-ratio="1.7"
                          contain
                        ></v-img>
                        <strong>{{element.title}}</strong>
                        <p>{{element.subtitle}}</p>
                        <v-btn
                          class="wrapText"
                          block
                          outlined
                          color="primary"
                          v-for="button in element.buttons"
                          :key="button.id"
                        >{{button.title}}</v-btn>
                      </v-card>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card>
            </v-tab-item>
          </v-tabs>
        </v-container>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="success" @click="dialog = false;saveGeneric();">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-row justify="center">
      <v-col sm="3" v-for="(element,elementIndex) in elements" :key="element.id">
        <v-btn small color="error" @click="deleteGenericScreen(elementIndex)">Eliminar</v-btn>
        <v-card outlined class="pa-3">
          <strong>Vista previa del rich message</strong>
          <v-img v-if="element.image_url" :src="element.image_url" aspect-ratio="1.7" contain></v-img>
          <strong>{{element.title}}</strong>
          <p>{{element.subtitle}}</p>
          <v-btn
            class="wrapText"
            block
            outlined
            color="primary"
            v-for="button in element.buttons"
            :key="button.id"
          >{{button.title}}</v-btn>
        </v-card>
      </v-col>
      <v-btn color="primary" @click="addGenericScreen">Añadir otra pantalla</v-btn>
    </v-row>
  </v-container>
</template>

<script>
export default {
  props: ["data", "index"],
  name: "generic",
  data() {
    return {
      dialog: false,
      elements: this.data.facebook.attachment.payload.elements,
    };
  },
  methods: {
    deleteButtonScreen(buttons, buttonIndex) {
      buttons.splice(buttonIndex, 1);
    },
    deleteGenericScreen(index) {
      this.elements.splice(index, 1);
    },
    changeButtonType(buttons, elementIndex, buttonIndex, type) {
      if (type == "postback") {
        buttons.splice(buttonIndex, 1, {
          payload: "",
          type: "postback",
          title: buttons[buttonIndex].title,
        });
      }
      if (type == "web_url") {
        buttons.splice(buttonIndex, 1, {
          type: "web_url",
          url: "",
          title: buttons[buttonIndex].title,
        });
      }
    },
    saveGeneric() {
      let newData = this.data;
      newData.facebook.attachment.payload.elements = this.elements;
      this.$emit("onSaveGeneric", newData, this.index);
    },
    addGenericScreen() {
      this.elements.push({
        title: "Créditos",
        buttons: [
          {
            payload: "boton 01",
            type: "postback",
            title: "boton 01",
          },
          {
            type: "postback",
            title: "boton 02",
            payload: "boton 02",
          },
          {
            title: "boton 03",
            payload: "boton 03",
            type: "postback",
          },
        ],
        subtitle: "Contamos con las siguientes opciones",
        image_url:
          "http://4.bp.blogspot.com/-_QCxfa0Jjv4/U1h7FRoJnAI/AAAAAAAAAYg/lbU-uWs5T-M/s1600/cpa-school-test.png",
      });
      this.saveGeneric();
    },
  },
};
</script>

<style lang="scss" scoped>
.wrapText {
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>