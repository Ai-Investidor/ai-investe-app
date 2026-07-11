<script setup>
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@lib/utils";
import { ChevronDown, Sparkles } from "@lucide/vue";
import { computed, ref, watch } from "vue";

const props = defineProps({
	text: {
		type: String,
		default: "",
	},
	state: {
		type: String,
		default: undefined,
	},
	autoCollapse: {
		type: Boolean,
		default: false,
	},
});

const isOpen = ref(true);
const userToggled = ref(false);

const isStreaming = computed(() => props.state === "streaming");
const hasText = computed(() => props.text.trim().length > 0);

const summaryLabel = computed(() => {
	if (isStreaming.value) return "Pensando...";
	if (hasText.value) return "Raciocínio";
	return "Pensando...";
});

watch(
	() => [props.state, props.autoCollapse],
	([state, autoCollapse]) => {
		if (userToggled.value) return;

		if (state === "streaming") {
			isOpen.value = true;
			return;
		}

		if (autoCollapse || state === "done") {
			isOpen.value = false;
		}
	},
	{ immediate: true },
);

function onOpenChange(open) {
	isOpen.value = open;
	userToggled.value = true;
}
</script>

<template>
	<Collapsible
		v-if="hasText || isStreaming"
		:open="isOpen"
		class="w-full rounded-md border border-card-border bg-black/35"
		@update:open="onOpenChange"
	>
		<CollapsibleTrigger
			class="flex w-full items-center gap-2 px-3 py-2 text-left transition-colors duration-200 hover:bg-white/5"
		>
			<Sparkles
				:class="
					cn(
						'size-4 shrink-0 text-primary',
						isStreaming && 'animate-pulse',
					)
				"
				aria-hidden="true"
			/>
			<span class="min-w-0 flex-1 text-paragraph-3 text-white/70">
				{{ summaryLabel }}
			</span>
			<ChevronDown
				:class="
					cn(
						'size-4 shrink-0 text-white/55 transition-transform duration-200',
						isOpen && 'rotate-180',
					)
				"
				aria-hidden="true"
			/>
		</CollapsibleTrigger>

		<CollapsibleContent class="border-t border-card-border px-3 py-3">
			<p
				v-if="hasText"
				class="text-paragraph-3 text-white/55 whitespace-pre-wrap break-words"
			>
				{{ text }}
			</p>
			<div
				v-else
				class="flex items-center gap-1.5"
				role="status"
				aria-label="A IA está pensando"
			>
				<span
					class="size-1.5 rounded-full bg-white/55 animate-bounce [animation-delay:-0.3s]"
				/>
				<span
					class="size-1.5 rounded-full bg-white/55 animate-bounce [animation-delay:-0.15s]"
				/>
				<span class="size-1.5 rounded-full bg-white/55 animate-bounce" />
			</div>
		</CollapsibleContent>
	</Collapsible>
</template>
