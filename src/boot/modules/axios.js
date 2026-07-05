// src/boot/modules/axios.js

import { useAuthStore } from "@stores/auth.js";
import axios from "axios";

const baseURL = import.meta.env.VITE_BASE_URL_API?.replace(/\/$/, "");

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
api.interceptors.request.use((config) => {
	const token = useAuthStore().session?.access_token;

	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}

	return config;
});

/**
 * @param {import('vue').App} app
 */
export default function bootAxios(app) {
	app.config.globalProperties.$api = api;
}
