<template>
  <v-navigation-drawer v-model="drawer" app clipped>
    <v-list dense>
      <template v-for="(item, i) in items">
        <v-list-item :key="i" @click :to="item.to">
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>{{ item.text }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </template>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
export default {
  data() {
    return {
      items: [
        {
          icon: "lightbulb_outline",
          text: "Agencias",
          to: { name: "agencies" },
        },
        {
          icon: "lightbulb_outline",
          text: "Menú Persistente",
          to: { name: "persistantMenu" },
        },
        {
          icon: "lightbulb_outline",
          text: "Intenciones",
          to: { name: "intent" },
        },
        {
          icon: "mdi-account-edit",
          text: "Usuarios del sistema",
          to: { name: "auth_users" },
        },
        {
          icon: "mdi-account-edit",
          text: "Usuarios de Petro Bot",
          to: { name: "chatbotUsers" },
        },
      ],
    };
  },
  computed: {
    drawer: {
      get() {
        return this.$store.state.toolbar.drawerIcon;
      },
      set(newValue) {
        this.$store.state.toolbar.drawerIcon = newValue;
      },
    },
  },
};
</script>

<style lang="scss" scoped>
</style>