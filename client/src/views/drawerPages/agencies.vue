<template>
  <v-container>
    <h1>Listado de agencias</h1>
    <v-data-table
      :search="search"
      :headers="headers"
      :items="agencies"
      :items-per-page="10"
      class="elevation-1"
      :loading="agencies.length==0"
      loading-text="Cargando agencias"
    >
      <template v-slot:top>
        <v-toolbar flat color="white">
          <v-text-field
            v-model="search"
            append-icon="search"
            label="Buscar"
            single-line
            hide-details
          ></v-text-field>
          <div class="flex-grow-1"></div>
          <v-dialog persistent v-model="dialog" max-width="500px">
            <template v-slot:activator="{ on }">
              <v-btn color="primary" dark class="mb-2" v-on="on">Nueva agencia</v-btn>
            </template>
            <v-card>
              <v-card-title>
                <span class="headline">{{ formTitle }}</span>
              </v-card-title>
              <v-card-text>
                <v-container>
                  <h1>Hola</h1>
                  <v-row>
                    <v-col cols="12" sm="6" md="6">
                      <v-text-field v-model="editedItem.agency_name" label="Nombre"></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6" md="6">
                      <v-select
                        :items="regions"
                        v-model="editedItem.region"
                        item-text="name"
                        item-value="id"
                        label="Región"
                      ></v-select>
                    </v-col>
                    <v-col cols="12" sm="12" md="12">
                      <v-text-field v-model="editedItem.address" label="Dirección"></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="12" md="12">
                      <v-text-field v-model="editedItem.reference" label="Referencia"></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="12" md="12">
                      <v-text-field v-model="editedItem.schedule" label="Horarios"></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="12" md="12">
                      <v-text-field v-model="editedItem.url" label="URL para más información"></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="12" md="12">
                      <v-text-field v-model="editedItem.image" label="URL de imagen"></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model="newSynonym"
                        placeholder="Ingresa sinónimo (enter)"
                        @keyup.enter="addSynonym(newSynonym)"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-chip color="primary" v-for="synonym in editedItem.synonyms">{{ synonym }}</v-chip>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card-text>

              <v-card-actions>
                <div class="flex-grow-1"></div>
                <v-btn color="error" text @click="close">Cancelar</v-btn>
                <v-btn color="success" @click="save">Guardar</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-toolbar>
      </template>
      <template v-slot:item.image="{item}">
        <v-img :src="item.image" aspect-ratio="1" contain></v-img>
      </template>
      <template v-slot:item.action="{ item }">
        <v-icon color="primary" small class="mr-2" @click="editItem(item)">edit</v-icon>
        <v-icon color="error" small @click="deleteItem(item)">delete</v-icon>
      </template>
    </v-data-table>
  </v-container>
</template>

<script>
import axios from "axios";
export default {
  data() {
    return {
      newSynonym: "",
      regions: [],
      search: "",
      dialog: false,
      headers: [
        {
          text: "Imagen",
          align: "left",
          value: "image",
        },
        {
          text: "Nombre",
          align: "left",
          value: "agency_name",
        },
        { text: "Región", value: "name" },
        { text: "Dirección", value: "address" },
        { text: "Referencia", value: "reference" },
        {
          text: "horario",
          value: "schedule",
        },
        { text: "Acciones", value: "action", sortable: false },
      ],
      agencies: [],
      editedIndex: -1,
      editedItem: {
        agency_id: 0,
        address: "",
        agency_name: "",
        reference: "",
        region: "",
        schedule: "",
        synonyms: [],
        url: "",
        image: "",
      },
      defaultItem: {
        agency_id: 0,
        address: "",
        agency_name: "",
        reference: "",
        region: "",
        schedule: "",
        synonyms: [],
        url: "",
        image: "",
      },
    };
  },
  beforeMount() {
    this.getInitialData();
  },
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "Nueva agencia" : "Editar agencia";
    },
  },
  methods: {
    addSynonym(synonym) {
      this.editedItem.synonyms.push(synonym);
      this.newSynonym = "";
    },
    getInitialData() {
      axios
        .get("/api/chatbot/agent/agencies/list")
        .then((res) => {
          if (res.data.ok) {
            // console.log(res.data.payload);
            this.agencies = res.data.payload;
            this.getRegions();
          }
        })
        .catch((err) => {
          // console.error(err);
        });
    },
    getRegions() {
      axios
        .get("/api/regions/list")
        .then((res) => {
          this.regions = res.data.payload;
        })
        .catch((err) => {
          // console.error(err);
        });
    },
    editItem(item) {
      this.editedIndex = this.agencies.indexOf(item);
      this.editedItem = Object.assign({}, item);
      if (this.editedItem.synonyms == "") {
        this.editedItem.synonyms = [];
      } else {
        if (this.editedItem.synonyms.includes(",")) {
          this.editedItem.synonyms = this.editedItem.synonyms.split(",");
        } else {
          this.editedItem.synonyms = [this.editedItem.synonyms];
        }
      }
      this.dialog = true;
    },

    deleteItem(item) {
      const index = this.agencies.indexOf(item);
      if (confirm("¿Seguro que deseas eliminar esta agencia?")) {
        axios
          .post("/api/chatbot/agent/agencies/delete", {
            id: item.agency_id,
          })
          .then((res) => {
            if (res.data.ok) {
              this.$store.dispatch("showSnackbar", {
                text: res.data.message,
                color: "success",
              });
              this.agencies.splice(index, 1);
            }
          })
          .catch((err) => {
            // console.error(err);
          });
      }
    },
    close() {
      this.dialog = false;
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      }, 300);
    },
    save() {
      if (this.editedIndex > -1) {
        if (this.editedItem.synonyms != "") {
          this.editedItem.synonyms = this.editedItem.synonyms;
        }
        axios
          .put("/api/agencies/update", {
            id: this.editedItem.agency_id,
            address: this.editedItem.address,
            agency_name: this.editedItem.agency_name,
            reference: this.editedItem.reference,
            region: this.editedItem.region,
            schedule: this.editedItem.schedule,
            image: this.editedItem.image,
            url: this.editedItem.url,
            synonyms: this.editedItem.synonyms,
          })
          .then((res) => {
            if (res.data.ok) {
              this.$store.dispatch("showSnackbar", {
                text: res.data.message,
                color: "success",
              });
              this.close();
              Object.assign(this.agencies[this.editedIndex], this.editedItem);
            }
          })
          .catch((err) => {
            console.error(err);
          });
      } else {
        axios
          .post("/api/agencies/create", {
            newAgency: {
              address: this.editedItem.address,
              agency_name: this.editedItem.agency_name,
              reference: this.editedItem.reference,
              region: this.editedItem.region,
              image: this.editedItem.image,
              url: this.editedItem.url,
              schedule: this.editedItem.schedule,
              status: 1,
              synonyms: this.editedItem.synonyms.join(","),
            },
          })
          .then((res) => {
            if (res.data.ok) {
              this.$store.dispatch("showSnackbar", {
                text: res.data.message,
                color: "success",
              });
              this.close();
              this.agencies.push(this.editedItem);
            }
          })
          .catch((err) => {
            // console.error(err);
          });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
</style>