import { ref } from "vue";
import { toast } from "vue-sonner";

const DEFAULT_ERROR_MESSAGE =
  "Não foi possível completar a operação. Tente novamente.";

function toUserMessage(err, fallback) {
  const apiMessage =
    err?.response?.data?.message ??
    err?.response?.data?.error ??
    err?.message;

  return apiMessage ? String(apiMessage) : fallback;
}

export function useAsyncAction({
  logLabel,
  defaultErrorMessage = DEFAULT_ERROR_MESSAGE,
} = {}) {
  const error = ref(null);

  async function runAction(action, { loading } = {}) {
    error.value = null;

    if (loading) loading.value = true;

    try {
      return await action();
    } catch (err) {
      console.error(`[${logLabel}]`, err);
      error.value = toUserMessage(err, defaultErrorMessage);
      toast.error(error.value);
      return null;
    } finally {
      if (loading) loading.value = false;
    }
  }

  function clearError() {
    error.value = null;
  }

  return { error, runAction, clearError };
}
