import { api } from "@boot/modules/axios.js";
import { supabase } from "@boot/modules/supabase.js";
import { URLS } from "@constants/URLS.js";

export function chatService() {
  async function sendMessage(payload) {
    const { data } = await api.post(URLS.EDGE_CHAT_ADVISOR, payload);
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

  async function searchSessions(params) {
    const { data, error } = await supabase.rpc(
      URLS.RPC_SEARCH_CHAT_SESSIONS,
      params,
    );

    if (error) throw error;
    return data;
  }

  async function updateTitle(params) {
    const { data, error } = await supabase.rpc(
      URLS.RPC_UPDATE_CHAT_SESSION_TITLE,
      params,
    );

    if (error) throw error;
    return data;
  }

  async function getMessagesPaginated(params) {
    const { data, error } = await supabase.rpc(
      URLS.RPC_GET_SESSION_MESSAGES_PAGINATED,
      params,
    );

    if (error) throw error;
    return data;
  }

  return {
    sendMessage,
    getSessions,
    searchSessions,
    updateTitle,
    getMessagesPaginated,
  };
}
