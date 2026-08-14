<script setup>
import {
	buildToolStatusItem,
	getToolStatus,
	hasToolOutput,
	parseToolOutput,
} from "@utils/chatMessageParts.js";
import { computed } from "vue";
import { resolveGenerativeToolComponent } from "@/components/ChatGenerative/chatGenerativeTools.js";
import ChatGenerativeToolSkeleton from "@/components/ChatGenerative/ChatGenerativeToolSkeleton.vue";
import ChatToolStatus from "@/components/ChatToolStatus/ChatToolStatus.vue";

const props = defineProps({
	part: {
		type: Object,
		required: true,
	},
	streaming: {
		type: Boolean,
		default: false,
	},
});

const status = computed(() => getToolStatus(props.part));
const toolComponent = computed(() =>
	resolveGenerativeToolComponent(props.part),
);
const toolStatusItem = computed(() => buildToolStatusItem(props.part));
const parsedOutput = computed(() => parseToolOutput(props.part.output));

const isRunning = computed(() => status.value === "running");
const isError = computed(() => status.value === "error");
const shouldRenderOutput = computed(() => hasToolOutput(props.part));
const isCircular = computed(() =>
	["pie", "donut"].includes(props.part.input?.type),
);
// Segura o gráfico até o streaming da mensagem inteira terminar — o output da
// tool costuma ficar pronto antes do texto acabar de chegar, e montar o
// ApexCharts nesse meio tempo causa um salto de layout no meio da digitação.
// Só entra em espera quem tem componente visual de fato — tool sem
// componente mapeado (ex. busca interna sem UI) nunca renderizou nada aqui,
// então não deve ganhar skeleton (senão ele "some" sem virar gráfico no final).
const isPendingReveal = computed(
	() => shouldRenderOutput.value && props.streaming && Boolean(toolComponent.value),
);
</script>

<template>
	<ChatToolStatus
		v-if="isRunning || isError"
		:tools="[toolStatusItem]"
	/>

	<ChatGenerativeToolSkeleton
		v-else-if="isPendingReveal"
		:circular="isCircular"
	/>

	<component
		:is="toolComponent"
		v-else-if="shouldRenderOutput && toolComponent"
		:part="part"
		:output="parsedOutput"
		:input="part.input"
	/>
</template>
