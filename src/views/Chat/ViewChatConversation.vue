<script setup>
import { Avatar, AvatarFallback, AvatarImage } from "@components/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@components/dropdown-menu";
import { ScrollArea } from "@components/scroll-area";
import { useAuth } from "@composables/useAuth.js";
import { useChat } from "@composables/useChat";
import { CHAT_COLUMN_CLASS } from "@constants/CHAT";
import {
    getMessageText,
    hasAssistantVisibleContent,
} from "@utils/chatMessageParts.js";
import { useDebounceFn } from "@vueuse/core";
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { toast } from "vue-sonner";
import ChatAssistantMessage from "@/components/ChatAssistantMessage/ChatAssistantMessage.vue";
import ChatComposer from "@/components/ChatComposer/ChatComposer.vue";
import ArrowDown from "@/components/icons/ArrowDown.vue";
import Clock from "@/components/icons/Clock.vue";
import Copy from "@/components/icons/Copy.vue";
import MoreVertical from "@/components/icons/MoreVertical.vue";

const {
    activeSession,
    sendMessage,
    isSending,
    isLoadingMessages,
    messages,
    status,
    formatTime,
} = useChat();
const { userAvatarUrl } = useAuth();

const inputText = ref("");
const scrollAreaRef = ref(null);
const viewportEl = ref(null);
const isAtBottom = ref(true);
const isScrolling = ref(false);
/** Mantém o scroll no fim enquanto o usuário não rolar pra cima manualmente. */
const stickToBottom = ref(true);

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
    stickToBottom.value = isAtBottom.value;
    onScrollEnd();
}

function bindViewport() {
    viewportEl.value?.removeEventListener("scroll", onScroll);
    viewportEl.value = getViewport();

    if (!viewportEl.value) return;

    viewportEl.value.addEventListener("scroll", onScroll, { passive: true });
    updateScrollState();
}

function scrollToBottom(behavior = "smooth") {
    const el = viewportEl.value ?? getViewport();
    if (!el) return;

    const scrollBehavior =
        behavior === "auto" || behavior === "smooth" ? behavior : "smooth";

    el.scrollTo({ top: el.scrollHeight, behavior: scrollBehavior });
    isAtBottom.value = true;
    stickToBottom.value = true;
}

function scrollToBottomAfterUpdate(behavior = "auto") {
    nextTick(() => {
        requestAnimationFrame(() => scrollToBottom(behavior));
    });
}

function handleSubmit(files) {
    stickToBottom.value = true;
    sendMessage(inputText.value, files);
    inputText.value = "";

    scrollToBottomAfterUpdate();
}

async function copyMessageContent(content) {
    try {
        await navigator.clipboard.writeText(content);
        toast.success("Mensagem copiada");
    } catch {
        toast.error("Não foi possível copiar a mensagem");
    }
}

// Cache local (não-reativo) de horários de mensagens que chegam via streaming
// puro, sem `metadata.time` do backend — evita recalcular a cada render.
const displayTimes = {};

function messageTime(message) {
    if (message.metadata?.time) return message.metadata.time;
    if (!displayTimes[message.id]) displayTimes[message.id] = formatTime();
    return displayTimes[message.id];
}

const lastMessage = computed(() => messages.value[messages.value.length - 1]);

const visibleMessages = computed(() =>
    messages.value.filter((message) => {
        if (message.role === "user") {
            return getMessageText(message).trim().length > 0;
        }

        return hasAssistantVisibleContent(message);
    }),
);

const showTypingIndicator = computed(() => {
    if (status.value === "submitted") return true;

    if (status.value === "streaming") {
        const last = lastMessage.value;
        if (last?.role === "assistant" && hasAssistantVisibleContent(last)) {
            return false;
        }

        return true;
    }

    // Fallback multipart (anexos): sem streaming, mostra "digitando" até a
    // resposta completa chegar.
    return isSending.value;
});

onMounted(() => {
    nextTick(bindViewport);
});

onUnmounted(() => {
    viewportEl.value?.removeEventListener("scroll", onScroll);
});

watch(
    () => activeSession.value?.id,
    () => {
        stickToBottom.value = true;
        nextTick(() => {
            bindViewport();
            scrollToBottomAfterUpdate();
        });
    },
);

watch(isLoadingMessages, (loading) => {
    if (loading) return;

    stickToBottom.value = true;
    nextTick(() => {
        bindViewport();
        scrollToBottomAfterUpdate();
    });
});

watch(
    () => [
        messages.value,
        isSending.value,
        status.value,
        showTypingIndicator.value,
    ],
    () => {
        if (!stickToBottom.value) {
            nextTick(updateScrollState);
            return;
        }

        scrollToBottomAfterUpdate();
    },
);
</script>

<template>
    <section
        class="relative z-10 flex flex-col h-full w-full min-h-0 min-w-0 overflow-x-clip gap-[25px] px-6 py-6 max-md:px-4 max-md:py-4"
    >
        <h1 class="sr-only">Conversa com a IA</h1>

        <div class="relative flex-1 min-h-0 min-w-0 overflow-hidden">
            <ScrollArea
                ref="scrollAreaRef"
                class="h-full min-w-0"
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
                    :class="['flex flex-col gap-5 py-4', CHAT_COLUMN_CLASS]"
                >
                    <li
                        v-for="message in visibleMessages"
                        :key="message.id"
                        :class="[
                            'flex w-full min-w-0 max-w-full gap-3 items-start',
                            message.role === 'user'
                                ? 'flex-row-reverse self-end'
                                : 'self-start',
                        ]"
                    >
                        <Avatar
                            :class="[
                                'size-8 shrink-0',
                                message.role === 'user'
                                    ? '-mr-11 max-md:mr-0'
                                    : '-ml-11 max-md:ml-0',
                            ]"
                        >
                            <AvatarFallback
                                v-if="message.role === 'assistant'"
                                class="bg-primary text-black text-sm font-medium"
                            >
                                AI
                            </AvatarFallback>
                            <template v-else>
                                <AvatarImage
                                    v-if="userAvatarUrl"
                                    :src="userAvatarUrl"
                                    alt="Foto de perfil"
                                />
                                <AvatarFallback
                                    class="bg-secondary text-white text-sm font-medium"
                                >
                                    F
                                </AvatarFallback>
                            </template>
                        </Avatar>

                        <div
                            :class="[
                                'flex min-w-0 flex-col gap-3 max-w-[85%] md:max-w-[70%] border border-card-border bg-gradient-to-r from-black to-surface-2 shadow-[0px_2px_0px_0px_black] rounded-md px-[15px] py-[15px]',
                                message.role === 'user'
                                    ? 'items-end'
                                    : 'items-start',
                            ]"
                        >
                            <p
                                v-if="message.role === 'user'"
                                class="text-paragraph-10 text-white whitespace-pre-wrap break-words text-right"
                            >
                                {{ getMessageText(message) }}
                            </p>
                            <ChatAssistantMessage
                                v-else
                                :message="message"
                                :streaming="
                                    status === 'streaming' &&
                                    message.id === lastMessage?.id
                                "
                            />
                            <div
                                :class="[
                                    'flex items-center gap-3',
                                    message.role === 'assistant' && 'w-full',
                                ]"
                            >
                                <Clock
                                    class="size-4 text-white/55"
                                    aria-hidden="true"
                                />
                                <time
                                    class="text-paragraph-3 text-white/55"
                                    :datetime="messageTime(message)"
                                >
                                    {{ messageTime(message) }}
                                </time>

                                <DropdownMenu
                                    v-if="message.role === 'assistant'"
                                >
                                    <DropdownMenuTrigger as-child>
                                        <button
                                            type="button"
                                            aria-label="Mais opções da mensagem"
                                            class="ml-auto flex items-center justify-center size-6 shrink-0 rounded text-white/55 hover:text-white transition-colors duration-200 hover:cursor-pointer"
                                        >
                                            <MoreVertical
                                                class="size-4"
                                                aria-hidden="true"
                                            />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                            class="hover:cursor-pointer"
                                            @click="
                                                copyMessageContent(
                                                    getMessageText(message),
                                                )
                                            "
                                        >
                                            <Copy aria-hidden="true" />
                                            Copiar
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </li>

                    <li
                        v-if="showTypingIndicator"
                        class="flex gap-3 items-start self-start"
                        role="status"
                        aria-label="A IA está digitando"
                    >
                        <Avatar class="size-8 shrink-0 -ml-11 max-md:ml-0">
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
                    @click="() => scrollToBottom('smooth')"
                >
                    <ArrowDown class="size-4" aria-hidden="true" />
                </button>
            </Transition>
        </div>

        <!-- Input with button -->
        <ChatComposer
            v-model="inputText"
            :disabled="isSending || isLoadingMessages"
            :class="CHAT_COLUMN_CLASS"
            @submit="handleSubmit"
        />
    </section>
</template>
