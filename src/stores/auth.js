import { computed, ref } from "vue";
import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", () => {
  const session = ref(null);

  const user = computed(() => session.value?.user ?? null);
  const isAuthenticated = computed(() => Boolean(session.value));

  function setSession(nextSession) {
    session.value = nextSession;
  }

  return { session, user, isAuthenticated, setSession };
});
