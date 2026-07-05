import { supabase } from "@boot/modules/supabase.js";

export function authService() {
  async function signIn({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  }

  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });

    if (error) throw error;
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async function getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  }

  function onAuthStateChange(callback) {
    const { data } = supabase.auth.onAuthStateChange(callback);
    return data.subscription;
  }

  return {
    signIn,
    signInWithGoogle,
    signOut,
    getSession,
    onAuthStateChange,
  };
}
