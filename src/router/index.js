import { createRouter, createWebHistory } from "vue-router";
import DefaultLayout from "@layout/DefaultLayout.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      component: DefaultLayout,
      children: [
        {
          path: "",
          name: "chat",
          component: () => import("@pages/PageChat.vue"),
        },
        {
          path: "alertas",
          name: "alerts",
          component: () => import("@pages/PageAlertas.vue"),
        },
        {
          path: "carteiras",
          name: "cards",
          component: () => import("@pages/PageCarteiras.vue"),
        },
      ],
    },
    {
      path: "/auth",
      name: "auth",
      component: () => import("@layout/AuthLayout.vue"),
      children: [
        {
          path: "login",
          name: "login",
          component: () => import("@pages/PageLogin.vue"),
        },
      ],
    },
  ],
});

export default router;
