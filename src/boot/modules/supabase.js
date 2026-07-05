// src/boot/modules/supabase.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, "");
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "[supabase] VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY são obrigatórios no .env",
  );
}

/** Cliente Supabase singleton — importar via `@boot/modules/supabase.js`. */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { flowType: "pkce" },
});

/**
 * @param {import('vue').App} app
 */
export default function bootSupabase(app) {
  app.config.globalProperties.$supabase = supabase;
}
