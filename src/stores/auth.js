import { computed, ref } from "vue";
import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", () => {
  const session = ref(null);
  const onboardingCompleted = ref(false);
  const onboardingCurrentStep = ref(1);

  const user = computed(() => session.value?.user ?? null);
  const isAuthenticated = computed(() => Boolean(session.value));

  function setSession(nextSession) {
    session.value = nextSession;
  }

  function setOnboardingStatus({ completed, currentStep }) {
    onboardingCompleted.value = completed;
    onboardingCurrentStep.value = currentStep;
  }

  return {
    session,
    onboardingCompleted,
    onboardingCurrentStep,
    user,
    isAuthenticated,
    setSession,
    setOnboardingStatus,
  };
});
