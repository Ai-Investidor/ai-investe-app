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
import { ref } from "vue";
import Clock from "@/components/icons/Clock.vue";
import FilePlus from "@/components/icons/FilePlus.vue";

const { activeSession, sendMessage, isSending } = useChat();

const inputText = ref("");

function handleSubmit() {
	sendMessage(inputText.value);
	inputText.value = "";
}
</script>

<template>
    <section
        class="relative z-10 flex flex-col h-full w-full min-h-0 gap-[25px] px-6 py-6 max-md:px-4 max-md:py-4"
    >
        <h1 class="sr-only">Conversa com a IA</h1>

        <ScrollArea class="flex-1 min-h-0" data-lenis-prevent>
            <ul
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
                :disabled="isSending"
                @keydown.enter="handleSubmit"
            />
            <InputGroupAddon align="inline-end" class="pr-0">
                <InputGroupButton
                    size="sm"
                    class="bg-btn-light hover:bg-btn-light/90 hover:text-black text-black rounded-lg px-3 py-1.5 text-paragraph-4 h-auto"
                    :disabled="isSending"
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
