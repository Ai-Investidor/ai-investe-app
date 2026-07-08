<script setup>
import { Avatar, AvatarFallback, AvatarImage } from "@components/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@components/dropdown-menu";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
} from "@components/input-group";
import { ScrollArea } from "@components/scroll-area";
import { useAuth } from "@composables/useAuth.js";
import { useChat } from "@composables/useChat";
import { renderMarkdown } from "@utils/renderMarkdown.js";
import { useDebounceFn } from "@vueuse/core";
import { A11y, FreeMode } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/vue";
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { toast } from "vue-sonner";
import ArrowDown from "@/components/icons/ArrowDown.vue";
import Clock from "@/components/icons/Clock.vue";
import Copy from "@/components/icons/Copy.vue";
import FilePlus from "@/components/icons/FilePlus.vue";
import MoreVertical from "@/components/icons/MoreVertical.vue";
import "swiper/css";

const attachedFilesSwiperModules = [A11y, FreeMode];

const attachedFilesFreeMode = {
    enabled: true,
    momentum: true,
    momentumRatio: 1.25,
    momentumVelocityRatio: 1.25,
    momentumBounce: false,
    sticky: false,
    minimumVelocity: 0.02,
};

const chatColumnClass =
    "w-full min-w-0 max-w-full mx-auto md:w-[clamp(541px,65%,720px)]";

const attachedFilesSwiper = ref(null);

function refreshAttachedFilesSwiper() {
    if (attachedFiles.value.length === 0) return;

    const swiper = attachedFilesSwiper.value;
    if (!swiper || swiper.destroyed) return;

    requestAnimationFrame(() => {
        const instance = attachedFilesSwiper.value;
        if (
            !instance ||
            instance.destroyed ||
            attachedFiles.value.length === 0
        ) {
            return;
        }

        instance.update();
        instance.updateSize();
        instance.updateSlides();
        instance.updateProgress();
    });
}

function onAttachedFilesSwiper(swiper) {
    attachedFilesSwiper.value = swiper;
    nextTick(refreshAttachedFilesSwiper);
}

function onAttachedFilesSwiperDestroy() {
    attachedFilesSwiper.value = null;
}

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
const fileInputRef = ref(null);
const attachedFiles = ref([]);
const scrollAreaRef = ref(null);
const viewportEl = ref(null);
const isAtBottom = ref(true);
const isScrolling = ref(false);

const SCROLL_THRESHOLD = 48;

const showScrollToBottom = computed(
    () => !isAtBottom.value && !isScrolling.value,
);

const canSubmit = computed(
    () =>
        (inputText.value.trim().length > 0 || attachedFiles.value.length > 0) &&
        !isSending.value &&
        !isLoadingMessages.value,
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
    if (!canSubmit.value) return;

    sendMessage(inputText.value, [...attachedFiles.value]);
    inputText.value = "";
    attachedFiles.value = [];

    if (fileInputRef.value) {
        fileInputRef.value.value = "";
    }
}

function openFilePicker() {
    fileInputRef.value?.click();
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

function messageText(message) {
    return (
        message.parts
            ?.filter((part) => part.type === "text")
            .map((part) => part.text)
            .join("") ?? ""
    );
}

function messageTime(message) {
    if (message.metadata?.time) return message.metadata.time;
    if (!displayTimes[message.id]) displayTimes[message.id] = formatTime();
    return displayTimes[message.id];
}

const lastMessage = computed(() => messages.value[messages.value.length - 1]);

const visibleMessages = computed(() =>
    messages.value.filter(
        (message) => message.role === "user" || messageText(message).length > 0,
    ),
);

const showTypingIndicator = computed(() => {
    if (status.value === "submitted") return true;
    if (status.value === "streaming") {
        return (
            lastMessage.value?.role !== "assistant" ||
            messageText(lastMessage.value).length === 0
        );
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
    () => [
        activeSession.value?.id,
        messages.value,
        isSending.value,
        isLoadingMessages.value,
    ],
    () => {
        nextTick(updateScrollState);
    },
);

watch(
    attachedFiles,
    (files) => {
        if (!files.length) {
            attachedFilesSwiper.value = null;
            return;
        }

        nextTick(refreshAttachedFilesSwiper);
    },
    { deep: true },
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
                    :class="['flex flex-col gap-5 py-4', chatColumnClass]"
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
                        <Avatar class="size-8 shrink-0">
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
                                {{ messageText(message) }}
                            </p>
                            <div
                                v-else
                                class="chat-prose text-paragraph-10 text-white text-left min-w-0 max-w-full break-words"
                                v-html="renderMarkdown(messageText(message))"
                            />
                            <p
                                v-if="message.metadata?.news"
                                class="text-paragraph-3 text-white/55 text-left border-t border-card-border pt-3 w-full"
                            >
                                Notícias relacionadas: {{ message.metadata.news }}
                            </p>
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
                                                    messageText(message),
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
        <input
            id="chat-file-upload"
            ref="fileInputRef"
            type="file"
            multiple
            class="sr-only"
            :disabled="isSending || isLoadingMessages"
            @change="handleFileChange"
        />

        <div
            v-if="attachedFiles.length"
            data-lenis-prevent
            :class="[
                'shrink-0 overflow-hidden [contain:inline-size]',
                chatColumnClass,
            ]"
            aria-label="Arquivos anexados"
        >
            <Swiper
                :modules="attachedFilesSwiperModules"
                slides-per-view="auto"
                :space-between="8"
                :free-mode="attachedFilesFreeMode"
                :watch-overflow="false"
                :threshold="5"
                :touch-angle="30"
                touch-release-on-edges
                grab-cursor
                :observer="true"
                :observe-slide-children="true"
                no-swiping-selector="button"
                class="w-full max-w-full overflow-hidden"
                @swiper="onAttachedFilesSwiper"
                @destroy="onAttachedFilesSwiperDestroy"
            >
                <SwiperSlide
                    v-for="(file, index) in attachedFiles"
                    :key="`${file.name}-${file.lastModified}-${index}`"
                    class="!box-border !w-36 max-md:!w-28"
                >
                    <div
                        class="flex w-full min-w-0 items-center gap-2 rounded-md border border-card-border bg-gradient-to-r from-black to-surface-2 px-3 py-1.5"
                    >
                        <span
                            class="min-w-0 flex-1 truncate text-paragraph-3 text-white/70"
                        >
                            {{ file.name }}
                        </span>
                        <button
                            type="button"
                            class="text-paragraph-3 text-white/55 hover:text-white shrink-0"
                            :aria-label="`Remover ${file.name}`"
                            @click="removeAttachedFile(index)"
                        >
                            ×
                        </button>
                    </div>
                </SwiperSlide>
            </Swiper>
        </div>

        <InputGroup
            :class="[
                'gap-2 h-auto shrink-0 bg-app-bg border-input-border rounded-lg px-6 max-md:px-4 py-2 has-[[data-slot=input-group-control]:focus-visible]:ring-0 has-[[data-slot=input-group-control]:focus-visible]:border-input-border',
                chatColumnClass,
            ]"
        >
            <InputGroupAddon align="inline-start">
                <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                        <button
                            type="button"
                            aria-label="Anexar"
                            class="flex items-center justify-center text-white/55 hover:text-white disabled:pointer-events-none disabled:opacity-50"
                            :disabled="isSending || isLoadingMessages"
                        >
                            <FilePlus class="size-4" aria-hidden="true" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        <DropdownMenuItem
                            as-child
                            :disabled="isSending || isLoadingMessages"
                        >
                            <label
                                for="chat-file-upload"
                                class="w-full hover:cursor-pointer"
                                @pointerdown.prevent.stop="openFilePicker"
                            >
                                Arquivos
                            </label>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </InputGroupAddon>
            <InputGroupInput
                v-model="inputText"
                type="text"
                placeholder="Fale com nossa IA..."
                class="text-paragraph-10 text-white/55 placeholder:text-white/55"
                :disabled="isSending || isLoadingMessages"
                @keydown.enter="handleSubmit"
            />
            <InputGroupAddon align="inline-end" class="pr-0">
                <InputGroupButton
                    size="sm"
                    class="bg-btn-light hover:bg-btn-light/90 hover:text-black text-black rounded-lg px-3 py-1.5 text-paragraph-4 h-auto"
                    :disabled="!canSubmit"
                    @click="handleSubmit"
                >
                    ?
                </InputGroupButton>
            </InputGroupAddon>
        </InputGroup>

        <!-- Disclaimer -->
        <p
            :class="[
                'text-paragraph-1 text-white/25 text-center tracking-ui shrink-0 w-full min-w-0 px-2 max-md:text-wrap',
                chatColumnClass,
            ]"
        >
            AI invest é uma IA e pode cometer erros pode cometer erros.
        </p>
    </section>
</template>
