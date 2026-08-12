import { computed, ref } from "vue";
import { storeToRefs } from "pinia";

import { authService } from "@services/authService.js";
import { onboardingService } from "@services/onboardingService.js";
import { useAsyncAction } from "@composables/useAsyncAction.js";
import { useAuthStore } from "@stores/auth.js";

const service = authService();
const onboardingApi = onboardingService();
const { error, runAction, clearError } = useAsyncAction({ logLabel: "useAuth" });

const isSigningIn = ref(false);
const isSigningUp = ref(false);
const isSigningOut = ref(false);
const isLoadingSession = ref(false);
const isResettingPassword = ref(false);
const isUpdatingPassword = ref(false);

let initialized = false;
let readyPromise = null;

const isLoading = computed(
  () =>
    isSigningIn.value ||
    isSigningUp.value ||
    isSigningOut.value ||
    isLoadingSession.value,
);

async function refreshOnboardingStatus(authStore) {
  if (!authStore.session) {
    authStore.setOnboardingStatus({ completed: false, currentStep: 1 });
    return;
  }

  const profile = await runAction(() => onboardingApi.getMyProfile());
  if (profile) {
    authStore.setOnboardingStatus({
      completed: profile.onboarding_completed,
      currentStep: profile.onboarding_current_step,
    });
  }
}

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
    await refreshOnboardingStatus(authStore);

    service.onAuthStateChange(async (_event, nextSession) => {
      authStore.setSession(nextSession);
      await refreshOnboardingStatus(authStore);
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

async function resetPassword({ email }) {
  return runAction(() => service.resetPasswordForEmail(email), {
    loading: isResettingPassword,
  });
}

async function updatePassword({ password }) {
  return runAction(() => service.updateUser({ password }), {
    loading: isUpdatingPassword,
  });
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
  const { session, user, isAuthenticated, onboardingCompleted, onboardingCurrentStep } =
    storeToRefs(authStore);
  const ready = initialize(authStore);

  const userAvatarUrl = computed(
    () =>
      user.value?.user_metadata?.avatar_url ||
      user.value?.user_metadata?.picture ||
      null,
  );

  const userDisplayName = computed(
    () =>
      user.value?.user_metadata?.full_name ||
      user.value?.user_metadata?.name ||
      user.value?.email ||
      "Usuário",
  );

  const userInitial = computed(() =>
    userDisplayName.value.charAt(0).toUpperCase(),
  );

  return {
    user,
    session,
    isAuthenticated,
    onboardingCompleted,
    onboardingCurrentStep,
    userAvatarUrl,
    userDisplayName,
    userInitial,
    error,
    isLoading,
    isSigningIn,
    isSigningUp,
    isSigningOut,
    isLoadingSession,
    isResettingPassword,
    isUpdatingPassword,
    ready,
    clearError,
    signIn,
    signUp,
    resetPassword,
    updatePassword,
    signInWithGoogle,
    signOut,
  };
}
