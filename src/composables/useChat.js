import { useAsyncAction } from "@composables/useAsyncAction.js";

import { chatService } from "@services/chatService.js";
import { computed, ref } from "vue";

const SESSIONS_INITIAL_LIMIT = 50;
const SESSIONS_PAGE_SIZE = 10;

const service = chatService();
const { error, runAction, clearError } = useAsyncAction({
  logLabel: "useChat",
});

const sessions = ref([]);
const messagesBySessionId = ref({});
const activeSessionId = ref(null);
const pinnedSessionIds = ref(new Set());
const isLoadingSessions = ref(false);
const isLoadingMoreSessions = ref(false);
const hasMoreSessions = ref(false);
const sessionsOffset = ref(0);
const isLoadingMessages = ref(false);
const isSending = ref(false);
const isSearching = ref(false);
const isDeletingSession = ref(false);
const isUpdatingSessionTitle = ref(false);
const remainingCredits = ref(null);

let initialized = false;

function formatTime(date = new Date()) {
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function createLocalMessage(role, content, source = {}, extra = {}) {
  return {
    id: source.id ?? crypto.randomUUID(),
    role,
    content,
    time: source.created_at
      ? formatTime(new Date(source.created_at))
      : formatTime(),
    ...extra,
  };
}

function mapSession(row) {
  const id = row.session_id ?? row.id;

  return {
    id,
    title: row.title ?? "Nova interação",
    pinned: pinnedSessionIds.value.has(id),
    updatedAt: row.updated_at ?? null,
    confirmed: true,
  };
}

function mapMessages(rows = []) {
  return rows.map((row) => createLocalMessage(row.role, row.content, row));
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

const hasActiveConversation = computed(() => {
  if (!activeSessionId.value) return false;

  const session = activeSession.value;
  if (!session) return false;

  return (
    session.confirmed ||
    (session.messages?.length ?? 0) > 0 ||
    isLoadingMessages.value
  );
});

const isLoading = computed(
  () =>
    isLoadingSessions.value ||
    isLoadingMessages.value ||
    isSending.value ||
    isSearching.value,
);

async function fetchSessions() {
  const data = await runAction(
    () =>
      service.getSessionsPaginated({
        limit: SESSIONS_INITIAL_LIMIT,
        offset: 0,
      }),
    { loading: isLoadingSessions },
  );

  if (!data) return;

  sessions.value = data.sessions.map(mapSession);
  sessionsOffset.value = data.sessions.length;
  hasMoreSessions.value = sessionsOffset.value < data.total;
}

async function loadMoreSessions() {
  if (
    !hasMoreSessions.value ||
    isLoadingMoreSessions.value ||
    isLoadingSessions.value
  ) {
    return;
  }

  const data = await runAction(
    () =>
      service.getSessionsPaginated({
        limit: SESSIONS_PAGE_SIZE,
        offset: sessionsOffset.value,
      }),
    { loading: isLoadingMoreSessions },
  );

  if (!data?.sessions?.length) {
    hasMoreSessions.value = false;
    return;
  }

  const existingIds = new Set(sessions.value.map((session) => session.id));
  const newSessions = data.sessions
    .map(mapSession)
    .filter((session) => !existingIds.has(session.id));

  sessions.value = [...sessions.value, ...newSessions];
  sessionsOffset.value += data.sessions.length;
  hasMoreSessions.value = sessionsOffset.value < data.total;
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

  const rows = Array.isArray(data)
    ? data
    : (data.data ?? data.messages ?? data.items ?? []);
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
    isLoadingMessages.value = true;
    loadSessionMessages(id);
  }
}

function createSession() {
  const session = {
    id: crypto.randomUUID(),
    title: "Nova interação",
    pinned: false,
    updatedAt: null,
    confirmed: false,
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

function removeSessionLocally(id) {
  sessions.value = sessions.value.filter((session) => session.id !== id);

  const { [id]: _, ...rest } = messagesBySessionId.value;
  messagesBySessionId.value = rest;

  if (pinnedSessionIds.value.has(id)) {
    const next = new Set(pinnedSessionIds.value);
    next.delete(id);
    pinnedSessionIds.value = next;
  }

  if (activeSessionId.value === id) {
    activeSessionId.value = null;
  }
}

async function deleteSession(id) {
  const session = sessions.value.find((item) => item.id === id);
  if (!session) return false;

  if (session.confirmed) {
    const deleted = await runAction(
      () => service.deleteSession({ session_id: id }),
      { loading: isDeletingSession },
    );

    if (!deleted) return false;
  }

  removeSessionLocally(id);
  return true;
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
  sessionsOffset.value = sessions.value.length;
  hasMoreSessions.value = false;
}

async function updateSessionTitle(sessionId, title) {
  const trimmed = title.trim();
  if (!trimmed) return false;

  const session = sessions.value.find((item) => item.id === sessionId);
  if (!session) return false;

  if (!session.confirmed) {
    upsertSession({ id: sessionId, title: trimmed });
    return true;
  }

  const data = await runAction(
    () =>
      service.updateTitle({
        session_id: sessionId,
        title: trimmed,
      }),
    { loading: isUpdatingSessionTitle },
  );

  if (!data) return false;

  upsertSession({
    id: sessionId,
    title: data.title ?? trimmed,
  });

  return true;
}

async function sendMessage(text, files = []) {
  const trimmed = text.trim();
  if ((!trimmed && files.length === 0) || isSending.value) return;

  const session = activeSession.value ?? createSession();
  const content =
    trimmed || files.map((file) => file.name).join(", ");

  appendMessage(session.id, createLocalMessage("user", content));

  const response = await runAction(
    () =>
      service.sendMessage({
        message: trimmed,
        session_id: session.confirmed ? session.id : null,
        files,
      }),
    { loading: isSending },
  );

  if (!response) return;

  if (response.session_id && response.session_id !== session.id) {
    const messages = messagesBySessionId.value[session.id] ?? [];
    removeSessionLocally(session.id);
    upsertSession({
      id: response.session_id,
      title: session.title,
      confirmed: true,
    });
    setSessionMessages(response.session_id, messages);
    activeSessionId.value = response.session_id;
  } else {
    upsertSession({ id: session.id, confirmed: true });
  }

  if (response.remaining_credits != null) {
    remainingCredits.value = response.remaining_credits;
  }

  const sessionId = response.session_id ?? session.id;

  if (response.response) {
    appendMessage(
      sessionId,
      createLocalMessage(
        "assistant",
        response.response,
        {},
        response.news ? { news: response.news } : {},
      ),
    );
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
    isLoadingMoreSessions,
    hasMoreSessions,
    isLoadingMessages,
    isSending,
    isSearching,
    isDeletingSession,
    isUpdatingSessionTitle,
    remainingCredits,
    clearError,
    fetchSessions,
    loadMoreSessions,
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
