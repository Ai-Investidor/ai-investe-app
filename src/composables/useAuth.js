import { computed, ref } from "vue";
import { storeToRefs } from "pinia";

import { authService } from "@services/authService.js";
import { useAsyncAction } from "@composables/useAsyncAction.js";
import { useAuthStore } from "@stores/auth.js";

const service = authService();
const { error, runAction, clearError } = useAsyncAction({ logLabel: "useAuth" });

const isSigningIn = ref(false);
const isSigningUp = ref(false);
const isSigningOut = ref(false);
const isLoadingSession = ref(false);

let initialized = false;
let readyPromise = null;

const isLoading = computed(
  () =>
    isSigningIn.value ||
    isSigningUp.value ||
    isSigningOut.value ||
    isLoadingSession.value,
);

// `useAuthStore()` só pode ser chamado depois que o boot do Pinia rodar,
// por isso nunca é acessado no topo do módulo — só dentro das funções abaixo,
// que só executam em tempo de navegação/interação (após o app montar).
function initialize(authStore) {
  if (initialized) return readyPromise;
  initialized = true;

  readyPromise = (async () => {
    const current = await runAction(() => service.getSession(), {
      loading: isLoadingSession,
    });
    authStore.setSession(current);

    service.onAuthStateChange((_event, nextSession) => {
      authStore.setSession(nextSession);
    });
  })();

  return readyPromise;
}

async function signIn({ email, password }) {
  const authStore = useAuthStore();

  const data = await runAction(() => service.signIn({ email, password }), {
    loading: isSigningIn,
  });

  if (!data) return null;

  authStore.setSession(data.session);
  return data;
}

async function signUp({ email, password, fullName, phone }) {
  const authStore = useAuthStore();

  const data = await runAction(
    () => service.signUp({ email, password, fullName, phone }),
    { loading: isSigningUp },
  );

  if (!data) return null;

  authStore.setSession(data.session);
  return data;
}

async function signInWithGoogle() {
  await runAction(() => service.signInWithGoogle(), { loading: isSigningIn });
}

async function signOut() {
  const authStore = useAuthStore();

  await runAction(() => service.signOut(), { loading: isSigningOut });

  if (error.value) return;

  authStore.setSession(null);
}

export function useAuth() {
  const authStore = useAuthStore();
  const { session, user, isAuthenticated } = storeToRefs(authStore);
  const ready = initialize(authStore);

  return {
    user,
    session,
    isAuthenticated,
    error,
    isLoading,
    isSigningIn,
    isSigningUp,
    isSigningOut,
    isLoadingSession,
    ready,
    clearError,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  };
}
