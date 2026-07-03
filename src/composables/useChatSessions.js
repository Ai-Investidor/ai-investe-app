import { computed, ref } from "vue";

const titles = [
  "BYD, ativos e seu potencial de valorização",
  "Melhores opções de investimento para 2026",
  "A majore, esta é uma análise de mercado",
  "O médio ticket das operações recentes",
  "Petrobras fecha parceria estratégica",
  "Contrato milionário assinado essa semana",
  "Elon Musk foi destaque nas notícias",
];

const sessions = ref(
  Array.from({ length: 5 }, () => titles).flat().map((title, index) => ({
    id: String(index + 1),
    title,
    pinned: false,
  })),
);

const activeSessionId = ref(null);

const sortedSessions = computed(() =>
  [...sessions.value].sort((a, b) => Number(b.pinned) - Number(a.pinned)),
);

function selectSession(id) {
  activeSessionId.value = id;
}

function createSession() {
  const session = { id: crypto.randomUUID(), title: "Nova interação", pinned: false };
  sessions.value.unshift(session);
  activeSessionId.value = session.id;
  return session;
}

function togglePinSession(id) {
  const session = sessions.value.find((s) => s.id === id);
  if (session) session.pinned = !session.pinned;
}

function deleteSession(id) {
  sessions.value = sessions.value.filter((s) => s.id !== id);
  if (activeSessionId.value === id) activeSessionId.value = null;
}

export function useChatSessions() {
  return {
    sessions,
    sortedSessions,
    activeSessionId,
    selectSession,
    createSession,
    togglePinSession,
    deleteSession,
  };
}
