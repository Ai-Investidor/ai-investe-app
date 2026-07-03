import { ref } from "vue";

const sessions = ref([
	{ id: "1", title: "BYD, ativos e seu potencial de valorização" },
	{ id: "2", title: "Melhores opções de investimento para 2026" },
	{ id: "3", title: "A majore, esta é uma análise de mercado" },
	{ id: "4", title: "O médio ticket das operações recentes" },
	{ id: "5", title: "Petrobras fecha parceria estratégica" },
	{ id: "6", title: "Contrato milionário assinado essa semana" },
	{ id: "7", title: "Elon Musk foi destaque nas notícias" },
]);

const activeSessionId = ref(null);

function selectSession(id) {
	activeSessionId.value = id;
}

function createSession() {
	const session = { id: crypto.randomUUID(), title: "Nova interação" };
	sessions.value.unshift(session);
	activeSessionId.value = session.id;
	return session;
}

export function useChatSessions() {
	return { sessions, activeSessionId, selectSession, createSession };
}
