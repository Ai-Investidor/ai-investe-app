import { createRouter, createWebHistory } from "vue-router";
import DefaultLayout from "@layout/DefaultLayout.vue";
import { useAuth } from "@composables/useAuth.js";

const APP_NAME = "AI Invest";

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
          meta: { title: "Chat" },
        },
        {
          path: "alertas",
          name: "alerts",
          component: () => import("@pages/PageAlertas.vue"),
          meta: { title: "Notificações" },
        },
        {
          path: "carteiras",
          name: "cards",
          component: () => import("@pages/PageCarteiras.vue"),
          meta: { title: "Carteiras" },
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
          meta: { title: "Entrar" },
        },
        {
          path: "cadastro",
          name: "signup",
          component: () => import("@pages/PageSignup.vue"),
          meta: { title: "Criar Conta" },
        },
        {
          path: "recuperar-senha",
          name: "recover-password",
          component: () => import("@pages/PageRecover.vue"),
          meta: { title: "Recuperar Senha" },
        },
        {
          path: "nova-senha",
          name: "reset-password",
          component: () => import("@pages/PageResetPassword.vue"),
          meta: { title: "Nova Senha" },
        },
      ],
    },
    {
      path: "/onboarding",
      name: "onboarding",
      component: () => import("@pages/PageOnboarding.vue"),
      meta: { title: "Onboarding" },
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: () => import("@pages/PageNotFound.vue"),
      meta: { title: "Página Não Encontrada" },
    },
  ],
});

router.beforeEach(async (to) => {
  const { isAuthenticated, onboardingCompleted, ready } = useAuth();
  await ready;

  const isAuthRoute = to.path.startsWith("/auth");

  if (!isAuthenticated.value && !isAuthRoute) {
    return { name: "login" };
  }

  if (isAuthenticated.value && !isAuthRoute) {
    const isOnboardingRoute = to.name === "onboarding";

    if (!onboardingCompleted.value && !isOnboardingRoute) {
      return { name: "onboarding" };
    }

    if (onboardingCompleted.value && isOnboardingRoute) {
      return { name: "chat" };
    }
  }
});

// A troca do `code` do PKCE pela sessão acontece de forma assíncrona dentro
// do supabase-js. Na primeira navegação da SPA, o vue-router já captura a
// URL com `?code=` presente e reescreve isso na barra de endereço depois que
// o guard acima resolve — sobrescrevendo a limpeza que o supabase-js já fez.
// Isso garante que o `code` some da URL de vez, sem afetar a sessão.
router.afterEach((to) => {
  if (to.query.code) {
    const { code, ...rest } = to.query;
    router.replace({ path: to.path, query: rest });
  }
});

router.afterEach((to) => {
  document.title = to.meta.title ? `${APP_NAME} - ${to.meta.title}` : APP_NAME;
});

export default router;
