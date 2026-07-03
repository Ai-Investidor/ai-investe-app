import { ref } from "vue";

const isOpen = ref(true);

function togglePanel() {
  isOpen.value = !isOpen.value;
}

export function useChatSessionsPanel() {
  return { isOpen, togglePanel };
}
