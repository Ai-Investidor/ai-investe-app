import { ref } from "vue";

/**
 * Centraliza o estado e a lógica de anexos do composer do chat (seleção via
 * file picker, acúmulo, remoção e limpeza), para que home e conversa
 * compartilhem o mesmo comportamento sem duplicar código.
 */
export function useChatAttachments() {
	const fileInputRef = ref(null);
	const attachedFiles = ref([]);

	function openFilePicker() {
		fileInputRef.value?.click();
	}

	function handleFileChange(event) {
		const files = Array.from(event.target.files ?? []);
		if (!files.length) return;

		attachedFiles.value = [...attachedFiles.value, ...files];
		event.target.value = "";
	}

	function removeAttachedFile(index) {
		attachedFiles.value = attachedFiles.value.filter((_, i) => i !== index);
	}

	function clearAttachedFiles() {
		attachedFiles.value = [];

		if (fileInputRef.value) {
			fileInputRef.value.value = "";
		}
	}

	return {
		fileInputRef,
		attachedFiles,
		openFilePicker,
		handleFileChange,
		removeAttachedFile,
		clearAttachedFiles,
	};
}
