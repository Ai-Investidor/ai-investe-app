import { ref } from "vue";

/**
 * Centraliza o estado e a lógica de anexos do composer do chat (seleção via
 * file picker, acúmulo, remoção e limpeza), para que home e conversa
 * compartilhem o mesmo comportamento sem duplicar código.
 *
 * São dois pickers — documento e imagem — reproduzindo o menu de anexos da base
 * anterior, onde cada opção abre o seletor já filtrado pelo tipo de arquivo.
 */
export function useChatAttachments() {
	const docInputRef = ref(null);
	const imageInputRef = ref(null);
	const attachedFiles = ref([]);

	function openDocPicker() {
		docInputRef.value?.click();
	}

	function openImagePicker() {
		imageInputRef.value?.click();
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

		if (docInputRef.value) {
			docInputRef.value.value = "";
		}

		if (imageInputRef.value) {
			imageInputRef.value.value = "";
		}
	}

	return {
		docInputRef,
		imageInputRef,
		attachedFiles,
		openDocPicker,
		openImagePicker,
		handleFileChange,
		removeAttachedFile,
		clearAttachedFiles,
	};
}
