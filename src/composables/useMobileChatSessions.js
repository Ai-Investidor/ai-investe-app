import { ref } from "vue";

const isOpen = ref(false);

function open() {
    isOpen.value = true;
}

function close() {
    isOpen.value = false;
}

export function useMobileChatSessions() {
    return { isOpen, open, close };
}
