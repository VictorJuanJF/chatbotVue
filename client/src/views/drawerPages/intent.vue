<template>
  <v-container>
    <h1>Listado de intenciones de Petro Bot</h1>
    <v-row justify="center">
      <v-col cols="11">
        <v-text-field label="Buscar intención" v-model="intentToFind"></v-text-field>
      </v-col>
    </v-row>
    <div class="px-10">
      <v-simple-table>
        <thead>
          <tr>
            <th class="text-left">Nro</th>
            <th class="text-left">Intención</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(intent,i) in filteredIntents" :key="i">
            <td class="text-left body-1">{{i+1}}</td>
            <td class="text-left body-1">
              <router-link
                :to="{name:'updateIntent',params:{id:extractIntentId(intent.name)}}"
              >{{ intent.displayName }}</router-link>
            </td>
          </tr>
        </tbody>
      </v-simple-table>
    </div>
  </v-container>
</template>

<script>
import { extractIntentId } from "../../tools/extractIntentId";
export default {
  data() {
    return {
      intentToFind: "",
    };
  },
  computed: {
    intents() {
      return this.$store.state.intents.sort((a, b) => {
        var nameA = a.displayName.toUpperCase(); // ignore upper and lowercase
        var nameB = b.displayName.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        return 0;
      });
    },
    filteredIntents() {
      return this.intents.filter((intent) =>
        intent.displayName
          .toLowerCase()
          .includes(this.intentToFind.toLowerCase())
      );
    },
  },
  methods: {
    extractIntentId(intentId) {
      return extractIntentId(intentId);
    },
  },
};
</script>

<style lang="scss" scoped>
</style>