<script setup>
import {
	buildToolStatusItem,
	getToolStatus,
	hasToolOutput,
	parseToolOutput,
} from "@utils/chatMessageParts.js";
import { computed } from "vue";
import { resolveGenerativeToolComponent } from "@/components/ChatGenerative/chatGenerativeTools.js";
import ChatToolStatus from "@/components/ChatToolStatus/ChatToolStatus.vue";

const props = defineProps({
	part: {
		type: Object,
		required: true,
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
</script>

<template>
	<ChatToolStatus
		v-if="isRunning || isError"
		:tools="[toolStatusItem]"
	/>

	<component
		:is="toolComponent"
		v-else-if="shouldRenderOutput && toolComponent"
		:part="part"
		:output="parsedOutput"
		:input="part.input"
	/>
</template>
