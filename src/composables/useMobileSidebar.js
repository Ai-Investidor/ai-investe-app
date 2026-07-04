import { ref } from "vue";

const isOpen = ref(false);

function open() {
    isOpen.value = true;
}

function toggle() {
    isOpen.value = !isOpen.value;
}

function close() {
    isOpen.value = false;
}

export function useMobileSidebar() {
    return { isOpen, open, toggle, close };
}
