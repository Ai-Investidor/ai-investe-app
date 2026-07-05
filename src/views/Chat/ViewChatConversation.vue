<script setup>
import { Avatar, AvatarFallback } from "@components/avatar";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
} from "@components/input-group";
import { ScrollArea } from "@components/scroll-area";
import { useChat } from "@composables/useChat";
import { renderMarkdown } from "@utils/renderMarkdown.js";
import { useDebounceFn } from "@vueuse/core";
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import ArrowDown from "@/components/icons/ArrowDown.vue";
import Clock from "@/components/icons/Clock.vue";
import FilePlus from "@/components/icons/FilePlus.vue";

const { activeSession, sendMessage, isSending, isLoadingMessages } = useChat();

const inputText = ref("");
const scrollAreaRef = ref(null);
const viewportEl = ref(null);
const isAtBottom = ref(true);
const isScrolling = ref(false);

const SCROLL_THRESHOLD = 48;

const showScrollToBottom = computed(
	() => !isAtBottom.value && !isScrolling.value,
);

function getViewport() {
	return (
		scrollAreaRef.value?.$el?.querySelector(
			"[data-slot=scroll-area-viewport]",
		) ?? null
	);
}

function checkIsAtBottom(el) {
	return el.scrollHeight - el.scrollTop - el.clientHeight <= SCROLL_THRESHOLD;
}

function updateScrollState() {
	const el = viewportEl.value;
	if (!el) return;

	isAtBottom.value = checkIsAtBottom(el);
}

const onScrollEnd = useDebounceFn(() => {
	isScrolling.value = false;
	updateScrollState();
}, 150);

function onScroll() {
	isScrolling.value = true;
	updateScrollState();
	onScrollEnd();
}

function bindViewport() {
	viewportEl.value?.removeEventListener("scroll", onScroll);
	viewportEl.value = getViewport();

	if (!viewportEl.value) return;

	viewportEl.value.addEventListener("scroll", onScroll, { passive: true });
	updateScrollState();
}

function scrollToBottom() {
	const el = viewportEl.value;
	if (!el) return;

	el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
}

function handleSubmit() {
	sendMessage(inputText.value);
	inputText.value = "";
}

onMounted(() => {
	nextTick(bindViewport);
});

onUnmounted(() => {
	viewportEl.value?.removeEventListener("scroll", onScroll);
});

watch(
	() => [
		activeSession.value?.id,
		activeSession.value?.messages?.length,
		isSending.value,
		isLoadingMessages.value,
	],
	() => {
		nextTick(updateScrollState);
	},
);
</script>

<template>
    <section
        class="relative z-10 flex flex-col h-full w-full min-h-0 gap-[25px] px-6 py-6 max-md:px-4 max-md:py-4"
    >
        <h1 class="sr-only">Conversa com a IA</h1>

        <div class="relative flex-1 min-h-0">
            <ScrollArea
                ref="scrollAreaRef"
                class="h-full"
                data-lenis-prevent
            >
            <div
                v-if="isLoadingMessages"
                class="flex flex-1 flex-col items-center justify-center gap-3 min-h-[200px] py-12"
                role="status"
                aria-live="polite"
                aria-label="Carregando mensagens"
            >
                <div class="flex items-center gap-1.5" aria-hidden="true">
                    <span
                        class="size-2 rounded-full bg-white/55 animate-bounce [animation-delay:-0.3s]"
                    />
                    <span
                        class="size-2 rounded-full bg-white/55 animate-bounce [animation-delay:-0.15s]"
                    />
                    <span
                        class="size-2 rounded-full bg-white/55 animate-bounce"
                    />
                </div>
                <p class="text-paragraph-3 text-white/55">
                    Carregando mensagens...
                </p>
            </div>

            <ul
                v-else
                class="flex flex-col gap-5 w-[clamp(541px,65%,720px)] max-md:w-full mx-auto py-4"
            >
                <li
                    v-for="message in activeSession?.messages ?? []"
                    :key="message.id"
                    :class="[
                        'flex gap-3 items-start',
                        message.role === 'user'
                            ? 'flex-row-reverse self-end'
                            : 'self-start',
                    ]"
                >
                    <Avatar class="size-8 shrink-0">
                        <AvatarFallback
                            v-if="message.role === 'assistant'"
                            class="bg-primary text-black text-sm font-medium"
                        >
                            AI
                        </AvatarFallback>
                        <AvatarFallback
                            v-else
                            class="bg-secondary text-white text-sm font-medium"
                        >
                            F
                        </AvatarFallback>
                    </Avatar>

                    <div
                        :class="[
                            'flex flex-col gap-3 max-w-[70%] max-md:max-w-[85%] border border-card-border bg-gradient-to-r from-black to-surface-2 shadow-[0px_2px_0px_0px_black] rounded-md px-[15px] py-[15px]',
                            message.role === 'user'
                                ? 'items-end'
                                : 'items-start',
                        ]"
                    >
                        <p
                            v-if="message.role === 'user'"
                            class="text-paragraph-10 text-white whitespace-pre-wrap text-right"
                        >
                            {{ message.content }}
                        </p>
                        <div
                            v-else
                            class="text-paragraph-10 text-white text-left [&_p]:whitespace-pre-wrap"
                            v-html="renderMarkdown(message.content)"
                        />
                        <p
                            v-if="message.news"
                            class="text-paragraph-3 text-white/55 text-left border-t border-card-border pt-3 w-full"
                        >
                            Notícias relacionadas: {{ message.news }}
                        </p>
                        <div class="flex items-center gap-3">
                            <Clock
                                class="size-4 text-white/55"
                                aria-hidden="true"
                            />
                            <time
                                class="text-paragraph-3 text-white/55"
                                :datetime="message.time"
                            >
                                {{ message.time }}
                            </time>
                        </div>
                    </div>
                </li>

                <li
                    v-if="isSending"
                    class="flex gap-3 items-start self-start"
                    role="status"
                    aria-label="A IA está digitando"
                >
                    <Avatar class="size-8 shrink-0">
                        <AvatarFallback
                            class="bg-primary text-black text-sm font-medium"
                        >
                            AI
                        </AvatarFallback>
                    </Avatar>

                    <div
                        class="flex items-center gap-1.5 border border-card-border bg-gradient-to-r from-black to-surface-2 shadow-[0px_2px_0px_0px_black] rounded-md px-[15px] py-[18px]"
                        aria-hidden="true"
                    >
                        <span
                            class="size-2 rounded-full bg-white/55 animate-bounce [animation-delay:-0.3s]"
                        />
                        <span
                            class="size-2 rounded-full bg-white/55 animate-bounce [animation-delay:-0.15s]"
                        />
                        <span
                            class="size-2 rounded-full bg-white/55 animate-bounce"
                        />
                    </div>
                </li>
            </ul>
            </ScrollArea>

            <Transition
                enter-active-class="transition-opacity duration-200"
                leave-active-class="transition-opacity duration-200"
                enter-from-class="opacity-0"
                leave-to-class="opacity-0"
            >
                <button
                    v-if="showScrollToBottom"
                    type="button"
                    class="absolute bottom-4 left-1/2 z-20 flex size-10 -translate-x-1/2 items-center justify-center rounded-full border border-card-border bg-gradient-to-r from-black to-surface-2 shadow-[0px_2px_0px_0px_black] text-white/55 hover:text-white"
                    aria-label="Ir para o final da conversa"
                    @click="scrollToBottom"
                >
                    <ArrowDown class="size-4" aria-hidden="true" />
                </button>
            </Transition>
        </div>

        <!-- Input with button -->
        <InputGroup
            class="gap-2 w-[clamp(541px,65%,720px)] max-md:w-full mx-auto h-auto bg-app-bg border-input-border rounded-lg px-6 py-2 shrink-0 has-[[data-slot=input-group-control]:focus-visible]:ring-0 has-[[data-slot=input-group-control]:focus-visible]:border-input-border"
        >
            <InputGroupAddon align="inline-start">
                <FilePlus class="size-4 text-white/55" aria-hidden="true" />
            </InputGroupAddon>
            <InputGroupInput
                v-model="inputText"
                type="text"
                placeholder="Fale com nossa IA..."
                class="text-paragraph-3 text-white/55 placeholder:text-white/55"
                :disabled="isSending || isLoadingMessages"
                @keydown.enter="handleSubmit"
            />
            <InputGroupAddon align="inline-end" class="pr-0">
                <InputGroupButton
                    size="sm"
                    class="bg-btn-light hover:bg-btn-light/90 hover:text-black text-black rounded-lg px-3 py-1.5 text-paragraph-4 h-auto"
                    :disabled="isSending || isLoadingMessages"
                    @click="handleSubmit"
                >
                    ?
                </InputGroupButton>
            </InputGroupAddon>
        </InputGroup>

        <!-- Disclaimer -->
        <p
            class="text-paragraph-1 text-white/25 text-center text-nowrap tracking-ui shrink-0 mx-auto"
        >
            AI invest é uma IA e pode cometer erros pode cometer erros.
        </p>
    </section>
</template>
