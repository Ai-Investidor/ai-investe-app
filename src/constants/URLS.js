/** Rotas da API (backend) e tabelas/RPCs do Supabase usados pelo módulo de chat. */
export const URLS = {
	// API backend
	CHAT_SEND: "/chat",

	// Tables
	TABLE_CHAT_SESSIONS: "chat_sessions",

	// RPC
	RPC_SEARCH_CHAT_SESSIONS: "search_chat_sessions",
	RPC_GET_SESSION_MESSAGES_PAGINATED: "get_session_messages_paginated",
	RPC_UPDATE_CHAT_SESSION_TITLE: "update_chat_session_title",
	RPC_UPDATE_CHAT_SESSION_PIN: "update_chat_session_pin",
	RPC_DELETE_SESSION: "delete_session",
};
