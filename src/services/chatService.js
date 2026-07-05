import { api } from "@boot/modules/axios.js";
import { supabase } from "@boot/modules/supabase.js";
import { URLS } from "@constants/URLS.js";

export function chatService() {
	async function sendMessage({ message, session_id, files = [] }) {
		const formData = new FormData();
		formData.append("message", message);
		if (session_id) formData.append("session_id", session_id);
		files.forEach((file) => {
			formData.append("files", file);
		});

		const { data } = await api.post(URLS.CHAT_SEND, formData, {
			headers: { "Content-Type": false },
		});
		return data;
	}

	async function getSessions() {
		const { data, error } = await supabase
			.from(URLS.TABLE_CHAT_SESSIONS)
			.select("*")
			.order("updated_at", { ascending: false });

		if (error) throw error;
		return data;
	}

	async function getSessionsPaginated({ limit, offset }) {
		const from = offset;
		const to = offset + limit - 1;

		const { data, error, count } = await supabase
			.from(URLS.TABLE_CHAT_SESSIONS)
			.select("*", { count: "exact" })
			.order("updated_at", { ascending: false })
			.order("session_id", { ascending: false })
			.range(from, to);

		if (error) throw error;
		return { sessions: data ?? [], total: count ?? 0 };
	}

	async function searchSessions(params) {
		const { data, error } = await supabase.rpc(
			URLS.RPC_SEARCH_CHAT_SESSIONS,
			params,
		);

		if (error) throw error;
		return data;
	}

	async function updateTitle({ session_id, title }) {
		const { data, error } = await supabase.rpc(
			URLS.RPC_UPDATE_CHAT_SESSION_TITLE,
			{
				p_session_id: session_id,
				p_title: title,
			},
		);

		if (error) throw error;
		return data;
	}

	async function deleteSession({ session_id }) {
		const { data, error } = await supabase.rpc(URLS.RPC_DELETE_SESSION, {
			p_session_id: session_id,
		});

		if (error) throw error;
		return data;
	}

	async function getMessagesPaginated({
		session_id,
		page = 1,
		page_size = 50,
		order = "ASC",
	} = {}) {
		const { data, error } = await supabase.rpc(
			URLS.RPC_GET_SESSION_MESSAGES_PAGINATED,
			{
				p_session_id: session_id,
				p_page: page,
				p_page_size: page_size,
				p_order: order,
			},
		);

		if (error) throw error;
		return data;
	}

	return {
		sendMessage,
		getSessions,
		getSessionsPaginated,
		searchSessions,
		updateTitle,
		deleteSession,
		getMessagesPaginated,
	};
}
