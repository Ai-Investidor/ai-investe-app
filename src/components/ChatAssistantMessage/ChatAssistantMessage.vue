<script setup>
import ChatGenerativeToolPart from "@/components/ChatGenerative/ChatGenerativeToolPart.vue";
import ChatMarkdown from "@/components/ChatMarkdown/ChatMarkdown.vue";
import ChatSourcesList from "@/components/ChatSourcesList/ChatSourcesList.vue";
import ChatThinkingBlock from "@/components/ChatThinkingBlock/ChatThinkingBlock.vue";
import {
	getMessageSources,
	getMessageText,
	isLastTextPart,
	isToolPart,
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

// O AI SDK muta as parts NO LUGAR durante o stream
// (`process-ui-message-stream.ts` → `part.state = options.state`), mantendo a
// mesma identidade de objeto. Passar essas parts direto faz o Vue comparar por
// referência, concluir que nada mudou e não atualizar o filho — a tool trava em
// "input-available" e o spinner nunca termina. A cópia rasa dá uma identidade
// nova a cada render do pai, então os filhos reavaliam seus computed.
const messageParts = computed(() =>
	(props.message?.parts ?? []).map((part) => ({ ...part })),
);
const hasAnswerText = computed(() => getMessageText(props.message).trim().length > 0);

const legacySources = computed(() => {
	const hasSourceUrlParts = messageParts.value.some(
		(part) => part.type === "source-url",
	);

	if (hasSourceUrlParts) return [];

	return getMessageSources(props.message);
});

function partKey(part, index) {
	return `${props.message.id}-${part.type}-${part.toolCallId ?? index}-${index}`;
}

function shouldStreamTextPart(index) {
	if (!props.streaming) return false;

	return isLastTextPart(messageParts.value, index);
}
</script>

<template>
	<div class="flex w-full min-w-0 flex-col gap-3">
		<template
			v-for="(part, index) in messageParts"
			:key="partKey(part, index)"
		>
			<ChatThinkingBlock
				v-if="part.type === 'reasoning'"
				:text="part.text ?? ''"
				:state="part.state"
				:auto-collapse="hasAnswerText"
			/>

			<ChatGenerativeToolPart
				v-else-if="isToolPart(part)"
				:part="part"
			/>

			<ChatMarkdown
				v-else-if="part.type === 'text' && part.text?.trim()"
				:content="part.text"
				:streaming="shouldStreamTextPart(index)"
			/>

			<ChatSourcesList
				v-else-if="part.type === 'source-url'"
				:sources="[
					{
						id: part.sourceId,
						url: part.url,
						title: part.title ?? part.url,
					},
				]"
			/>
		</template>

		<ChatSourcesList
			v-if="legacySources.length"
			:sources="legacySources"
		/>
	</div>
</template>
