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
          component: () => import("@pages/Chat.vue"),
        },
      ],
    },
  ],
});

export default router;
