<template>
  <v-container>
    <h1>Usuarios de Charly Bot</h1>
    <v-data-table
      :headers="headers"
      :items="users"
      :items-per-page="10"
      class="elevation-1"
      :loading="users.length==0"
      loading-text="Cargando usuarios del chatbot"
    >
      <template v-slot:item.document_num="{item}">
        <v-chip v-if="!item.document_num" color="error">Falta</v-chip>
        <p v-else>{{item.document_num}}</p>
      </template>
      <template v-slot:item.hoja_informativa="{item}">
        <p v-if="!item.hoja_informativa">Por definir</p>
      </template>
      <template v-slot:item.date="{item}">
        <p>{{item.date | formatDate}}</p>
      </template>
    </v-data-table>
  </v-container>
</template>

<script>
import { format } from "date-fns";
export default {
  filters: {
    formatDate: function (value) {
      return format(new Date(value), "dd/MM/yyyy");
    },
  },
  data() {
    return {
      headers: [
        {
          text: "Nombres",
          align: "left",
          value: "first_name",
        },
        { text: "Apellidos", value: "last_name" },
        { text: "ID de Facebook", value: "fb_id" },
        { text: "Fecha de Registro", value: "date" },
        {
          text: "DNI",
          value: "document_num",
        },
      ],
      users: [],
    };
  },
  beforeMount() {
    this.getInitialData();
  },
  methods: {
    getInitialData() {
      axios
        .get("/api/chatbot/users/list")
        .then((res) => {
          if (res.data.ok) {
            this.users = res.data.payload;
          }
        })
        .catch((err) => {
          console.error(err);
        });
    },
  },
};
</script>
</script>

<style lang="scss" scoped>
</style>