<template>
  <v-container>
    <strong>Rich message de tipo: button</strong>
    <br />
    <v-dialog v-model="dialog" width="800">
      <template v-slot:activator="{ on:dialog }">
        <v-tooltip bottom>
          <template v-slot:activator="{ on: tooltip }">
            <v-btn color="primary" dark v-on="{ ...tooltip, ...dialog }">Editar</v-btn>
          </template>
          <span>editar</span>
        </v-tooltip>
      </template>
      <v-card>
        <v-toolbar color="primary" dark>
          <v-toolbar-title>Editar mensaje de tipo botón</v-toolbar-title>
        </v-toolbar>
        <v-container>
          <v-textarea v-model="buttons.text" label="Mensaje que acompaña al botón (Obligatorio)"></v-textarea>
          <v-row align="center">
            <v-col cols="12" sm="6">
              <v-col cols="12" v-for="(button,i) in buttons.buttons" :key="i">
                <v-text-field
                  clearable
                  outlined
                  :label="'Texto del botón '+(i+1)"
                  v-model="button.title"
                ></v-text-field>
                <v-text-field
                  clearable
                  outlined
                  :label="'URL del botón '+(i+1)"
                  v-model="button.url"
                ></v-text-field>
              </v-col>
            </v-col>
            <v-col cols="12" sm="6">
              <v-card class="pa-5" outlined>
                <strong>Vista previa del rich message</strong>
                <pre>{{buttons.text}}</pre>
                <v-btn
                  block
                  outlined
                  v-for="(button,buttonIndex) in buttons.buttons"
                  :key="buttonIndex"
                  color="primary"
                >{{button.title}}</v-btn>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="addButton">Añadir otro botón (MAX 3)</v-btn>
          <v-btn class="ml-3" color="success" @click="dialog = false;saveButton();">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-row justify="center">
      <v-col sm="4">
        <v-card class="pa-5" outlined>
          <strong>Vista previa del rich message</strong>
          <pre>{{buttons.text}}</pre>
          <v-btn
            block
            outlined
            v-for="(button,buttonIndex) in buttons.buttons"
            :key="buttonIndex"
            color="primary"
          >{{button.title}}</v-btn>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  props: ["data", "index"],
  data() {
    return {
      dialog: false,
      buttons: this.data.facebook.attachment.payload,
    };
  },
  methods: {
    addButton() {
      this.buttons.buttons.push({
        type: "web_url",
        url:
          "https://developers.facebook.com/docs/messenger-platform/send-messages/template/list",
        title: "Ejemplo",
      });
    },
    saveButton() {
      let newData = this.data;
      newData.facebook.attachment.payload = this.buttons;
      this.$emit("onSaveButton", newData, this.index);
    },
  },
};
</script>

<style lang="scss" scoped>
</style>