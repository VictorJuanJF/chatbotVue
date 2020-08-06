import Vue from "vue";
import Router from "vue-router";
import localStorage from "localStorage";
Vue.use(Router);

let routes = [
  {
    path: "/dashboard",
    component: require("./views/dashboard.vue").default,
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        path: "",
        name: "dashboard",
        redirect: {
          name: "intent",
        },
      },
      {
        path: "intenciones",
        name: "intent",
        component: require("./views/drawerPages/intent.vue").default,
      },
      {
        path: "intenciones/:id",
        name: "updateIntent",
        component: require("./views/drawerPages/updateIntent.vue").default,
      },
      {
        path: "menu-persistente",
        name: "persistantMenu",
        component: require("./views/drawerPages/persistantMenu.vue").default,
      },
      {
        path: "agencias",
        name: "agencies",
        component: require("./views/drawerPages/agencies.vue").default,
      },
      {
        path: "usuarios-del-sistema",
        name: "auth_users",
        component: require("./views/drawerPages/authUsers.vue").default,
      },
      {
        path: "usuarios-de-petr-bot",
        name: "chatbotUsers",
        component: require("./views/drawerPages/chatbotUsers.vue").default,
      },
    ],
  },
  {
    path: "/",
    component: require("./views/auth/home.vue").default,
    meta: {
      guest: true,
    },
    children: [
      {
        path: "",
        redirect: "/login",
      },
      {
        path: "/login",
        name: "login",
        component: require("./views/auth/login.vue").default,
      },
      {
        path: "registro",
        name: "register",
        component: require("./views/auth/register.vue").default,
      },
    ],
  },
  {
    path: "/webview",
    component: require("./views/webview/servicios.vue").default,
  },
  {
    path: "*",
    component: require("./views/errorPage/errorPage.vue").default,
  },
];

const router = new Router({
  routes,
  mode: "history",
});

router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (localStorage.getItem("token") == null) {
      next({
        name: "login",
        params: {
          nextUrl: to.fullPath,
        },
      });
    } else {
      let user = JSON.parse(localStorage.getItem("user"));
      if (to.matched.some((record) => record.meta.requiresAuth)) {
        if (user.role == 1 || user.role == 2) {
          next();
        } else {
          next({
            name: "dashboard",
          });
        }
      } else {
        next();
      }
    }
  } else if (to.matched.some((record) => record.meta.guest)) {
    if (localStorage.getItem("token") == null) {
      next();
    } else {
      next({
        name: "dashboard",
      });
    }
  } else {
    next();
  }
});

export default router;
