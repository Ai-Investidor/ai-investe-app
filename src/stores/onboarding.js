import { ref } from "vue";
import { defineStore } from "pinia";

export const useOnboardingStore = defineStore("onboarding", () => {
  const activeIndex = ref(0);
  const formData = ref({});

  function setActiveIndex(index) {
    activeIndex.value = index;
  }

  function mergeFormData(partial) {
    formData.value = { ...formData.value, ...partial };
  }

  return { activeIndex, formData, setActiveIndex, mergeFormData };
});
