<script setup>
import { renderMarkdown } from "@utils/renderMarkdown.js";
import { renderMermaidIn } from "@utils/mermaid.js";
import { useDebounceFn } from "@vueuse/core";
import { computed, nextTick, onMounted, ref, watch } from "vue";

const props = defineProps({
	content: {
		type: String,
		default: "",
	},
	/** Evita re-render a cada token durante streaming. */
	streaming: {
		type: Boolean,
		default: false,
	},
});

const root = ref(null);

const html = computed(() => renderMarkdown(props.content));

async function hydrateMermaid() {
	await nextTick();
	if (!root.value) return;
	await renderMermaidIn(root.value);
}

const debouncedHydrate = useDebounceFn(hydrateMermaid, 350);

watch(
	() => [props.content, props.streaming],
	() => {
		if (props.streaming) {
			debouncedHydrate();
			return;
		}

		debouncedHydrate.cancel?.();
		hydrateMermaid();
	},
);

onMounted(() => {
	hydrateMermaid();
});
</script>

<template>
	<div
		ref="root"
		class="chat-prose text-paragraph-10 text-white text-left min-w-0 max-w-full break-words"
		v-html="html"
	/>
</template>
