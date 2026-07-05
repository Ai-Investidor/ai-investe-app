import { computed, ref } from "vue";

import { chatService } from "@services/chatService.js";
import { useAsyncAction } from "@composables/useAsyncAction.js";

const service = chatService();
const { error, runAction, clearError } = useAsyncAction({ logLabel: "useChat" });

const sessions = ref([]);
const messagesBySessionId = ref({});
const activeSessionId = ref(null);
const pinnedSessionIds = ref(new Set());
const isLoadingSessions = ref(false);
const isLoadingMessages = ref(false);
const isSending = ref(false);
const isSearching = ref(false);

let initialized = false;

function formatTime(date = new Date()) {
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function createLocalMessage(role, content, source = {}) {
  return {
    id: source.id ?? crypto.randomUUID(),
    role,
    content,
    time: source.created_at
      ? formatTime(new Date(source.created_at))
      : formatTime(),
  };
}

function mapSession(row) {
  return {
    id: row.id,
    title: row.title ?? "Nova interação",
    pinned: pinnedSessionIds.value.has(row.id),
    updatedAt: row.updated_at ?? null,
  };
}

function mapMessages(rows = []) {
  return rows.map((row) =>
    createLocalMessage(row.role, row.content, row),
  );
}

function withMessages(session) {
  return {
    ...session,
    pinned: pinnedSessionIds.value.has(session.id),
    messages: messagesBySessionId.value[session.id] ?? [],
  };
}

function setSessionMessages(sessionId, messages) {
  messagesBySessionId.value = {
    ...messagesBySessionId.value,
    [sessionId]: messages,
  };
}

function appendMessage(sessionId, message) {
  const current = messagesBySessionId.value[sessionId] ?? [];
  setSessionMessages(sessionId, [...current, message]);
}

function upsertSession(session) {
  const index = sessions.value.findIndex((item) => item.id === session.id);

  if (index === -1) {
    sessions.value = [session, ...sessions.value];
    return;
  }

  const next = [...sessions.value];
  next[index] = { ...next[index], ...session };
  sessions.value = next;
}

const sortedSessions = computed(() =>
  [...sessions.value]
    .map(withMessages)
    .sort((a, b) => Number(b.pinned) - Number(a.pinned)),
);

const activeSession = computed(() => {
  const session = sessions.value.find(
    (item) => item.id === activeSessionId.value,
  );

  return session ? withMessages(session) : null;
});

const hasActiveConversation = computed(
  () => (activeSession.value?.messages?.length ?? 0) > 0,
);

const isLoading = computed(
  () =>
    isLoadingSessions.value ||
    isLoadingMessages.value ||
    isSending.value ||
    isSearching.value,
);

async function fetchSessions() {
  const data = await runAction(() => service.getSessions(), {
    loading: isLoadingSessions,
  });

  if (!data) return;

  sessions.value = data.map(mapSession);
}

async function loadSessionMessages(sessionId, params = {}) {
  const data = await runAction(
    () =>
      service.getMessagesPaginated({
        session_id: sessionId,
        page: 1,
        page_size: 50,
        ...params,
      }),
    { loading: isLoadingMessages },
  );

  if (!data) return;

  const rows = Array.isArray(data) ? data : (data.messages ?? data.items ?? []);
  setSessionMessages(sessionId, mapMessages(rows));
}

async function initialize() {
  if (initialized) return;
  initialized = true;
  await fetchSessions();
}

function selectSession(id) {
  activeSessionId.value = id;

  if (!messagesBySessionId.value[id]?.length) {
    loadSessionMessages(id);
  }
}

function createSession() {
  const session = {
    id: crypto.randomUUID(),
    title: "Nova interação",
    pinned: false,
    updatedAt: null,
  };

  upsertSession(session);
  activeSessionId.value = session.id;
  setSessionMessages(session.id, []);

  return withMessages(session);
}

function togglePinSession(id) {
  const next = new Set(pinnedSessionIds.value);

  if (next.has(id)) next.delete(id);
  else next.add(id);

  pinnedSessionIds.value = next;
}

function deleteSession(id) {
  sessions.value = sessions.value.filter((session) => session.id !== id);

  const { [id]: _, ...rest } = messagesBySessionId.value;
  messagesBySessionId.value = rest;

  if (activeSessionId.value === id) {
    activeSessionId.value = null;
  }
}

async function searchSessions(query) {
  const trimmed = query.trim();
  if (!trimmed) {
    await fetchSessions();
    return;
  }

  const data = await runAction(
    () => service.searchSessions({ query: trimmed }),
    { loading: isSearching },
  );

  if (!data) return;

  const rows = Array.isArray(data) ? data : (data.sessions ?? data.items ?? []);
  sessions.value = rows.map(mapSession);
}

async function updateSessionTitle(sessionId, title) {
  const trimmed = title.trim();
  if (!trimmed) return null;

  const data = await runAction(() =>
    service.updateTitle({
      session_id: sessionId,
      title: trimmed,
    }),
  );

  if (!data) return null;

  upsertSession({
    id: sessionId,
    title: data.title ?? trimmed,
  });

  return data;
}

async function sendMessage(text) {
  const trimmed = text.trim();
  if (!trimmed || isSending.value) return;

  const session = activeSession.value ?? createSession();
  appendMessage(session.id, createLocalMessage("user", trimmed));

  const response = await runAction(
    () =>
      service.sendMessage({
        message: trimmed,
        session_id: session.id,
      }),
    { loading: isSending },
  );

  if (!response) return;

  if (response.session_id && response.session_id !== session.id) {
    const messages = messagesBySessionId.value[session.id] ?? [];
    deleteSession(session.id);
    upsertSession({
      id: response.session_id,
      title: response.title ?? session.title,
    });
    setSessionMessages(response.session_id, messages);
    activeSessionId.value = response.session_id;
  }

  const sessionId = response.session_id ?? session.id;
  const assistantContent =
    response.reply ?? response.message ?? response.content;

  if (assistantContent) {
    appendMessage(sessionId, createLocalMessage("assistant", assistantContent));
  }

  if (response.title) {
    upsertSession({ id: sessionId, title: response.title });
  }
}

export function useChat() {
  initialize();

  return {
    sessions,
    sortedSessions,
    activeSessionId,
    activeSession,
    hasActiveConversation,
    error,
    isLoading,
    isLoadingSessions,
    isLoadingMessages,
    isSending,
    isSearching,
    clearError,
    fetchSessions,
    loadSessionMessages,
    selectSession,
    createSession,
    togglePinSession,
    deleteSession,
    searchSessions,
    updateSessionTitle,
    sendMessage,
  };
}
