<script setup>
import ChatMarkdown from "@/components/ChatMarkdown/ChatMarkdown.vue";
import ChatSourcesList from "@/components/ChatSourcesList/ChatSourcesList.vue";
import ChatThinkingBlock from "@/components/ChatThinkingBlock/ChatThinkingBlock.vue";
import ChatToolStatus from "@/components/ChatToolStatus/ChatToolStatus.vue";
import {
	getMessageReasoning,
	getMessageSources,
	getMessageText,
	getMessageTools,
} from "@utils/chatMessageParts.js";
import { computed } from "vue";

const props = defineProps({
	message: {
		type: Object,
		required: true,
	},
	streaming: {
		type: Boolean,
		default: false,
	},
});

const text = computed(() => getMessageText(props.message));
const reasoning = computed(() => getMessageReasoning(props.message));
const sources = computed(() => getMessageSources(props.message));
const tools = computed(() => getMessageTools(props.message));

const hasAnswerText = computed(() => text.value.trim().length > 0);
</script>

<template>
	<div class="flex w-full min-w-0 flex-col gap-3">
		<ChatThinkingBlock
			:text="reasoning.text"
			:state="reasoning.state"
			:auto-collapse="hasAnswerText"
		/>

		<ChatToolStatus :tools="tools" />

		<ChatSourcesList :sources="sources" />

		<ChatMarkdown
			v-if="hasAnswerText"
			:content="text"
			:streaming="streaming"
		/>
	</div>
</template>
