// src/boot/modules/axios.js

import { useAuthStore } from "@stores/auth.js";
import axios from "axios";

export const baseURL = import.meta.env.VITE_BASE_URL_API?.replace(/\/$/, "");

if (!baseURL) {
	throw new Error("[axios] VITE_BASE_URL_API é obrigatório no .env");
}

/** Cliente HTTP singleton — importar via `@boot/modules/axios.js`. */
export const api = axios.create({
	baseURL,
	headers: {
		"Content-Type": "application/json",
	},
});

// `useAuthStore()` só é chamado aqui dentro (nunca no topo do módulo), pois só
// roda por requisição, depois que o boot do Pinia já ativou a store global.
export function getAuthHeaders() {
	const token = useAuthStore().session?.access_token;
	return token ? { Authorization: `Bearer ${token}` } : {};
}

api.interceptors.request.use((config) => {
	Object.assign(config.headers, getAuthHeaders());
	return config;
});

/**
 * @param {import('vue').App} app
 */
export default function bootAxios(app) {
	app.config.globalProperties.$api = api;
}
