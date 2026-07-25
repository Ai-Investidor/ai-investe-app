/** Rotas da API (backend) e tabelas/RPCs do Supabase usados pelo módulo de chat. */
export const URLS = {
	// API backend
	CHAT_SEND: "/chat",
	CHAT_STREAM: "/chat/stream",

	// Tables
	TABLE_CHAT_SESSIONS: "chat_sessions",
	TABLE_MARITAL_STATUSES: "marital_statuses_static",
	TABLE_EMPLOYMENT_TYPES: "employment_types_static",
	TABLE_USER_DEPENDENTS: "user_dependents",
	TABLE_FINANCIAL_PROFILES: "financial_profiles",
	TABLE_MONTHLY_CASH_FLOWS: "monthly_cash_flows",
	TABLE_EMERGENCY_RESERVES: "emergency_reserves",
	TABLE_DEBTS: "debts",
	TABLE_PROFILE_NET_WORTH: "profile_net_worth",
	TABLE_PROFILE_INVESTMENTS: "profile_investments",
	TABLE_FINANCIAL_GOALS: "financial_goals",
	TABLE_RISK_TOLERANCE_PROFILE: "risk_tolerance_profile",
	TABLE_USER_KNOWLEDGE_PROFILE: "user_knowledge_profile",

	// RPC
	RPC_SEARCH_CHAT_SESSIONS: "search_chat_sessions",
	RPC_GET_SESSION_MESSAGES_PAGINATED: "get_session_messages_paginated",
	RPC_UPDATE_CHAT_SESSION_TITLE: "update_chat_session_title",
	RPC_UPDATE_CHAT_SESSION_PIN: "update_chat_session_pin",
	RPC_DELETE_SESSION: "delete_session",
	RPC_GET_MY_PROFILE: "get_my_profile",
	RPC_UPDATE_MY_PROFILE: "update_my_profile",
	RPC_GET_MY_FINANCIAL_PROFILE: "get_my_financial_profile",
	RPC_UPSERT_MY_FINANCIAL_PROFILE: "upsert_my_financial_profile",
};
