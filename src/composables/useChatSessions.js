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

const MOCK_ASSISTANT_REPLY =
  "A Apple está em um momento de transição significativa, conforme as notícias recentes. A saída de Tim Cook do cargo de CEO em setembro de 2026, após mais de uma década, e a ascensão de John Ternus, vice-presidente sênior de engenharia de hardware, são os principais destaques.\n\nDo ponto de vista fundamentalista, essa troca de comando é um evento crucial. Tim Cook liderou a Apple em um período de forte crescimento e diversificação para serviços e vestíveis. A vinda de Ternus, um engenheiro com profundo conhecimento dos produtos principais da empresa, sugere que a Apple pode estar buscando um renovado foco em inovação de hardware e integração de tecnologias.\n\nOutro ponto importante é a estratégia da Apple em relação à Inteligência Artificial (IA). Ternus já indicou que a empresa se concentrará em \"criar recursos úteis\", em vez de seguir tendências de mercado de forma genérica.";

function formatTime(date = new Date()) {
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function createMessage(role, content) {
  return { id: crypto.randomUUID(), role, content, time: formatTime() };
}

const sessions = ref(
  Array.from({ length: 5 }, () => titles)
    .flat()
    .map((title, index) => ({
      id: String(index + 1),
      title,
      pinned: false,
      messages: [
        createMessage("user", `Faça uma análise sobre: ${title}`),
        createMessage("assistant", MOCK_ASSISTANT_REPLY),
      ],
    })),
);

const activeSessionId = ref(null);

const sortedSessions = computed(() =>
  [...sessions.value].sort((a, b) => Number(b.pinned) - Number(a.pinned)),
);

const activeSession = computed(
  () => sessions.value.find((s) => s.id === activeSessionId.value) ?? null,
);

const hasActiveConversation = computed(
  () => (activeSession.value?.messages?.length ?? 0) > 0,
);

function selectSession(id) {
  activeSessionId.value = id;
}

function createSession() {
  const session = {
    id: crypto.randomUUID(),
    title: "Nova interação",
    pinned: false,
    messages: [],
  };
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

function addMessage(sessionId, { role, content }) {
  const session = sessions.value.find((s) => s.id === sessionId);
  if (!session) return;
  session.messages.push(createMessage(role, content));
}

function sendMessage(text) {
  const trimmed = text.trim();
  if (!trimmed) return;

  const session = activeSession.value ?? createSession();
  addMessage(session.id, { role: "user", content: trimmed });
  addMessage(session.id, { role: "assistant", content: MOCK_ASSISTANT_REPLY });
}

export function useChatSessions() {
  return {
    sessions,
    sortedSessions,
    activeSessionId,
    activeSession,
    hasActiveConversation,
    selectSession,
    createSession,
    togglePinSession,
    deleteSession,
    addMessage,
    sendMessage,
  };
}
