// src/boot/modules/axios.js
import axios from "axios";

const baseURL = import.meta.env.VITE_BASE_URL_API?.replace(/\/$/, "");

if (!baseURL) {
  throw new Error("[axios] VITE_BASE_URL_API é obrigatório no .env");
}

/** Cliente HTTP singleton — importar via `@boot` ou `@boot/modules/axios`. */
export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * @param {import('vue').App} app
 */
export default function bootAxios(app) {
  app.config.globalProperties.$api = api;
}
