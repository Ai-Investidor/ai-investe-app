<script setup>
import { renderMarkdown } from "@utils/renderMarkdown.js";
import { renderMermaidIn } from "@utils/mermaid.js";
import { useDebounceFn } from "@vueuse/core";
import {
	computed,
	nextTick,
	onBeforeUnmount,
	onMounted,
	ref,
	watch,
} from "vue";

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

/** Atraso máx. entre o texto real e o exibido — revela em ritmo suave em vez de saltar em blocos a cada chunk. */
const STREAM_REVEAL_LAG_MS = 500;
const FRAME_MS = 16;

const displayedContent = ref(props.streaming ? "" : props.content);
let revealFrame = null;

function stopReveal() {
	if (revealFrame !== null) {
		cancelAnimationFrame(revealFrame);
		revealFrame = null;
	}
}

function revealTick() {
	const target = props.content;
	const current = displayedContent.value;

	if (current.length >= target.length) {
		revealFrame = null;
		return;
	}

	const backlog = target.length - current.length;
	const framesToClear = STREAM_REVEAL_LAG_MS / FRAME_MS;
	const step = Math.max(1, Math.ceil(backlog / framesToClear));

	displayedContent.value = target.slice(0, current.length + step);
	revealFrame = requestAnimationFrame(revealTick);
}

watch(
	() => props.content,
	(next) => {
		if (!props.streaming) {
			stopReveal();
			displayedContent.value = next;
			return;
		}

		if (revealFrame === null) revealFrame = requestAnimationFrame(revealTick);
	},
	{ immediate: true },
);

onBeforeUnmount(stopReveal);

const html = computed(() => renderMarkdown(displayedContent.value));

async function hydrateMermaid() {
	await nextTick();
	if (!root.value) return;
	await renderMermaidIn(root.value);
}

const debouncedHydrate = useDebounceFn(hydrateMermaid, 350);

watch(
	() => [displayedContent.value, props.streaming],
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
