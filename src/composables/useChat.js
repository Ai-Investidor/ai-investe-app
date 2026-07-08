import { useAsyncAction, toUserMessage } from "@composables/useAsyncAction.js";

import { chatService } from "@services/chatService.js";
import { useChat as useAiChat } from "@ai-sdk/vue";
import { computed, ref } from "vue";
import { toast } from "vue-sonner";

const SESSIONS_INITIAL_LIMIT = 50;
const SESSIONS_PAGE_SIZE = 10;

const service = chatService();
const { error, runAction, clearError } = useAsyncAction({
  logLabel: "useChat",
});

const sessions = ref([]);
// Cache de mensagens já persistidas (Supabase), usada só como seed inicial da
// instância de chat da SDK ao trocar de sessão. É um objeto simples (NÃO um
// `ref`) de propósito: o getter do `useChat` da SDK recria a instância
// inteira sempre que uma dependência reativa lida ali dentro muda de valor.
// Se isso fosse um `ref`, gravar o histórico de QUALQUER sessão (ex.: apagar
// uma sessão antiga, ou reconciliar o id de uma sessão nova) reatribuiria
// `.value` e recriaria a instância ativa no meio de um streaming em
// andamento, apagando a resposta que está chegando.
const sessionHistory = {};
const activeSessionId = ref(null);
// Identidade estável da instância de chat da SDK. Só muda em navegação
// explícita (selectSession/resetActiveSession/criação de sessão) — nunca
// durante a reconciliação de session_id (ver `reconcileSessionId`), porque
// o `useChat` da SDK recria toda a instância (perdendo o texto em streaming)
// sempre que uma dependência reativa lida no seu init getter muda de valor.
const chatInstanceId = ref(crypto.randomUUID());
const isLoadingSessions = ref(false);
const isLoadingMoreSessions = ref(false);
const hasMoreSessions = ref(false);
const sessionsOffset = ref(0);
const isLoadingMessages = ref(false);
const isSendingAttachment = ref(false);
const isSearching = ref(false);
const isDeletingSession = ref(false);
const isUpdatingSessionTitle = ref(false);
const isTogglingPinSession = ref(false);
const remainingCredits = ref(null);
const sortPinnedFirst = ref(true);

let initialized = false;

function formatTime(date = new Date()) {
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function createUiMessage(role, text, metadata = {}) {
  return {
    id: crypto.randomUUID(),
    role,
    parts: [{ type: "text", text }],
    metadata: { time: formatTime(), ...metadata },
  };
}

function mapHistoryMessages(rows = []) {
  return rows.map((row) => ({
    id: row.id ?? crypto.randomUUID(),
    role: row.role,
    parts: [{ type: "text", text: row.content }],
    metadata: {
      time: row.created_at
        ? formatTime(new Date(row.created_at))
        : formatTime(),
    },
  }));
}

function setSessionHistory(sessionId, messages) {
  sessionHistory[sessionId] = messages;
}

function mapSession(row) {
  const id = row.session_id ?? row.id;

  return {
    id,
    title: row.title ?? "Nova interação",
    pinned: row.pinned ?? false,
    updatedAt: row.updated_at ?? null,
    confirmed: true,
  };
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
  sortPinnedFirst.value
    ? [...sessions.value].sort((a, b) => Number(b.pinned) - Number(a.pinned))
    : sessions.value,
);

const activeSession = computed(
  () => sessions.value.find((item) => item.id === activeSessionId.value) ?? null,
);

function resolveStreamBody() {
  const session = activeSession.value;
  return { session_id: session?.confirmed ? session.id : undefined };
}

function extractSessionId(dataPart) {
  const payload = dataPart.data;
  return typeof payload === "string" ? payload : payload?.session_id;
}

function reconcileSessionId(tempId, realId) {
  if (!realId || realId === tempId) {
    if (tempId) upsertSession({ id: tempId, confirmed: true });
    return;
  }

  const session = sessions.value.find((item) => item.id === tempId);
  if (!session) return;

  removeSessionLocally(tempId);
  upsertSession({
    id: realId,
    title: session.title,
    pinned: session.pinned,
    confirmed: true,
  });

  // Linka o array de mensagens ao vivo da SDK sob o id real — se o usuário
  // navegar pra outra sessão e voltar pra esta (agora pelo id real), o seed
  // já reflete a conversa completa em vez de recarregar do zero via Supabase.
  if (chatInstanceId.value === tempId) {
    sessionHistory[realId] = sdkChat.messages.value;
  }

  if (activeSessionId.value === tempId) {
    activeSessionId.value = realId;
  }

  if (session.pinned) {
    runAction(() => service.updatePin({ session_id: realId, pinned: true }));
  }
}

function handleStreamDataPart(dataPart) {
  if (dataPart.type !== "data-session") return;

  const realId = extractSessionId(dataPart);
  if (!realId) return;

  reconcileSessionId(chatInstanceId.value, realId);
}

function handleStreamError(err) {
  console.error("[useChat:stream]", err);
  toast.error(toUserMessage(err));
}

function getMessageText(message) {
  return (
    message?.parts
      ?.filter((part) => part.type === "text")
      .map((part) => part.text)
      .join("") ?? ""
  );
}

function applySessionMessages(sessionId, mapped) {
  setSessionHistory(sessionId, mapped);
  if (activeSessionId.value === sessionId) {
    sdkChat.messages.value = mapped;
  }
}

async function reconcileMessagesFromServer(sessionId) {
  const data = await runAction(() =>
    service.getMessagesPaginated({
      session_id: sessionId,
      page: 1,
      page_size: 50,
    }),
  );

  if (!data) return;

  const rows = Array.isArray(data)
    ? data
    : (data.data ?? data.messages ?? data.items ?? []);
  applySessionMessages(sessionId, mapHistoryMessages(rows));
}

async function handleStreamFinish({ message, isError }) {
  const metadata = message?.metadata;
  if (metadata?.remaining_credits != null) {
    remainingCredits.value = metadata.remaining_credits;
  }

  const sessionId = activeSessionId.value;
  if (!sessionId || isError || message?.role !== "assistant") return;

  if (!getMessageText(message).trim()) {
    await reconcileMessagesFromServer(sessionId);
  }
}

const transport = service.createStreamTransport(resolveStreamBody);

const sdkChat = useAiChat(() => ({
  id: chatInstanceId.value,
  messages: sessionHistory[chatInstanceId.value] ?? [],
  transport,
  onData: handleStreamDataPart,
  onError: handleStreamError,
  onFinish: handleStreamFinish,
}));

const isSending = computed(
  () =>
    sdkChat.status.value === "submitted" ||
    sdkChat.status.value === "streaming" ||
    isSendingAttachment.value,
);

const hasActiveConversation = computed(() => {
  if (!activeSessionId.value) return false;

  const session = activeSession.value;
  if (!session) return false;

  return (
    session.confirmed ||
    sdkChat.messages.value.length > 0 ||
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

async function fetchSessions({ sortPinnedFirst: sortPinned = true } = {}) {
  sortPinnedFirst.value = sortPinned;

  const data = await runAction(
    () =>
      service.getSessionsPaginated({
        limit: SESSIONS_INITIAL_LIMIT,
        offset: 0,
        sortPinnedFirst: sortPinned,
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
        sortPinnedFirst: sortPinnedFirst.value,
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
  applySessionMessages(sessionId, mapHistoryMessages(rows));
}

async function initialize() {
  if (initialized) return;
  initialized = true;
  await fetchSessions();
}

function selectSession(id) {
  if (chatInstanceId.value !== id) sdkChat.stop();

  activeSessionId.value = id;
  chatInstanceId.value = id;

  if (!sessionHistory[id]?.length) {
    isLoadingMessages.value = true;
    loadSessionMessages(id);
  }
}

function createSession() {
  const session = {
    id: chatInstanceId.value,
    title: "Nova interação",
    pinned: false,
    updatedAt: null,
    confirmed: false,
  };

  upsertSession(session);
  activeSessionId.value = session.id;

  return session;
}

function resetActiveSession() {
  sdkChat.stop();
  activeSessionId.value = null;
  chatInstanceId.value = crypto.randomUUID();
}

async function togglePinSession(id) {
  const session = sessions.value.find((item) => item.id === id);
  if (!session) return false;

  const nextPinned = !session.pinned;

  if (!session.confirmed) {
    upsertSession({ id, pinned: nextPinned });
    return true;
  }

  const data = await runAction(
    () => service.updatePin({ session_id: id, pinned: nextPinned }),
    { loading: isTogglingPinSession },
  );

  if (!data) return false;

  upsertSession({ id, pinned: data.pinned ?? nextPinned });
  return true;
}

function removeSessionLocally(id) {
  sessions.value = sessions.value.filter((session) => session.id !== id);

  delete sessionHistory[id];

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

  // A sessão apagada era a instância de chat ativa da SDK — precisa de um
  // rascunho novo, senão a próxima mensagem reviveria a sessão apagada.
  if (chatInstanceId.value === id) {
    sdkChat.stop();
    chatInstanceId.value = crypto.randomUUID();
  }

  return true;
}

async function searchSessions(query, { sortPinnedFirst: sortPinned = true } = {}) {
  const trimmed = query.trim();
  sortPinnedFirst.value = sortPinned;

  if (!trimmed) {
    await fetchSessions({ sortPinnedFirst: sortPinned });
    return;
  }

  const data = await runAction(
    () => service.searchSessions({ query: trimmed, sortPinnedFirst: sortPinned }),
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

async function sendMessageWithFiles(trimmed, files) {
  const session = activeSession.value;
  const content = trimmed || files.map((file) => file.name).join(", ");

  sdkChat.messages.value = [
    ...sdkChat.messages.value,
    createUiMessage("user", content),
  ];

  const response = await runAction(
    () =>
      service.sendMessage({
        message: trimmed,
        session_id: session.confirmed ? session.id : null,
        files,
      }),
    { loading: isSendingAttachment },
  );

  if (!response) return;

  reconcileSessionId(session.id, response.session_id ?? session.id);

  if (response.remaining_credits != null) {
    remainingCredits.value = response.remaining_credits;
  }

  if (response.response) {
    sdkChat.messages.value = [
      ...sdkChat.messages.value,
      createUiMessage(
        "assistant",
        response.response,
        response.news ? { news: response.news } : {},
      ),
    ];
  }
}

async function sendMessage(text, files = []) {
  const trimmed = text.trim();
  if ((!trimmed && files.length === 0) || isSending.value) return;

  if (!activeSessionId.value) createSession();

  if (files.length > 0) {
    await sendMessageWithFiles(trimmed, files);
    return;
  }

  sdkChat.sendMessage({ text: trimmed });
}

export function useChat() {
  initialize();

  return {
    sessions,
    sortedSessions,
    activeSessionId,
    activeSession,
    hasActiveConversation,
    messages: sdkChat.messages,
    status: sdkChat.status,
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
    isTogglingPinSession,
    remainingCredits,
    sortPinnedFirst,
    formatTime,
    clearError,
    fetchSessions,
    loadMoreSessions,
    loadSessionMessages,
    selectSession,
    createSession,
    resetActiveSession,
    togglePinSession,
    deleteSession,
    searchSessions,
    updateSessionTitle,
    sendMessage,
  };
}
