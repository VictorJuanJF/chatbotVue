import Vue from "vue";
import Vuex from "vuex";
//plugins
import axios from "axios";
import localStorage from "localStorage";
Vue.prototype.$axios = axios;

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    status: "",
    token: localStorage.getItem("token") || "",
    user: JSON.parse(localStorage.getItem("user")) || {},
    intents: [],
    loggingIn: false,
    loginError: null,
    loginSuccessful: false,
    snackbar: {
      text: "",
      active: false,
      color: "success",
    },
    toolbar: {
      drawerIcon: null,
    },
    overlay: {
      active: false,
      text: "",
    },
  },
  mutations: {
    auth_request(state) {
      state.status = "loading";
    },
    setIntents(state, payload) {
      state.intents = payload;
    },
    logout(state) {
      state.status = "";
      state.token = "";
      state.loggingIn = false;
    },
    auth_success(state, { token, user }) {
      state.status = "success";
      state.token = token;
      state.user = user;
      state.loggingIn = true;
    },
    auth_error(state) {
      state.status = "error";
    },
    showSnackbar(state, { text, color }) {
      state.snackbar.text = text;
      state.snackbar.color = color;
      state.snackbar.active = true;
    },
    initialLoad(state) {
      state.loggingIn = true;
      state.loggingIn = true;
    },
    showOverlay(state, { active, text }) {
      state.overlay.active = active;
      state.overlay.text = text;
    },
  },
  actions: {
    showSnackbar({ commit }, { text, color }) {
      commit("showSnackbar", {
        text,
        color,
      });
    },
    showOverlay({ commit }, { active, text }) {
      commit("showOverlay", {
        active,
        text,
      });
    },
    register({ commit }, user) {
      return new Promise((resolve, reject) => {
        commit("auth_request");
        axios
          .post("/api/register", {
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            password: user.password,
          })
          .then((res) => {
            if (res.data.ok) {
              resolve(res.data.message);
            } else {
              // error msg
              reject(res.data);
            }
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    login({ commit }, user) {
      return new Promise((resolve, reject) => {
        commit("auth_request");
        axios
          .post("/api/login", {
            email: user.email,
            password: user.password,
          })
          .then((res) => {
            if (res.data.ok) {
              const token = res.data.token;
              const user = res.data.payload;
              localStorage.clear();
              localStorage.setItem("token", token);
              localStorage.setItem("user", JSON.stringify(user));
              axios.defaults.headers.common["Authorization"] = token;
              commit("auth_success", {
                token,
                user,
              });
              resolve(res.data.message);
            }
          })
          .catch((err) => {
            commit("auth_error");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            if (err.response) {
              // console.error(err.response.data);
              reject(err);
            }
          });
      });
    },
    setIntents({ commit }, payload) {
      commit("setIntents", payload);
    },
    logout({ commit }) {
      commit("logout");
      localStorage.removeItem("token");
      // delete axios.defaults.headers.common['Authorization'];
    },
    initialLoad({ commit }) {
      commit("initialLoad");
    },
  },
  getters: {
    isLoggedIn: (state) => !!state.token,
    authStatus: (state) => state.status,
  },
});
