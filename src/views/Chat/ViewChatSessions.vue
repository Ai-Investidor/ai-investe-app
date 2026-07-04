<script setup>
import { Button } from "@components/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@components/dropdown-menu";
import { ScrollArea } from "@components/scroll-area";
import { useChatSessions } from "@composables/useChatSessions";
import { useChatSessionsPanel } from "@composables/useChatSessionsPanel";
import { prefersReducedMotion } from "@lib/gsap";
import { cn } from "@lib/utils";
import DrawingPin from "@/components/icons/DrawingPin.vue";
import MoreVertical from "@/components/icons/MoreVertical.vue";
import Plus from "@/components/icons/Plus.vue";

defineOptions({ inheritAttrs: false });

const props = defineProps({
    class: {
        type: [Boolean, null, String, Object, Array],
        required: false,
        skipCheck: true,
    },
});

const {
    sortedSessions,
    activeSessionId,
    selectSession,
    createSession,
    togglePinSession,
    deleteSession,
} = useChatSessions();

const { isOpen } = useChatSessionsPanel();
</script>

<template>
    <nav
        id="chat-sessions-panel"
        aria-label="Histórico de conversas"
        :class="
            cn(
                'flex flex-col h-full shrink-0 overflow-hidden',
                !prefersReducedMotion &&
                    'transition-[width] duration-300 ease-in-out',
                isOpen ? 'w-[195px]' : 'w-0',
                props.class,
            )
        "
    >
        <!-- Registrar Interação -->
        <Button
            variant="gradient"
            class="h-8 gap-2 px-[15px] shrink-0"
            @click="createSession"
        >
            <Plus class="size-4 text-primary shrink-0" aria-hidden="true" />
            <span class="text-paragraph-9 text-white whitespace-nowrap"
                >Registrar Interação</span
            >
        </Button>

        <!-- Lista de sessões -->
        <ScrollArea class="flex-1 min-h-0" data-lenis-prevent>
            <ul class="relative flex flex-col pt-2">
                <div
                    aria-hidden="true"
                    class="absolute left-[7px] top-2 bottom-2 border-l border-dashed border-white/15"
                />
                <li
                    v-for="session in sortedSessions"
                    :key="session.id"
                    class="group/row relative z-10 flex items-center gap-1"
                >
                    <button
                        type="button"
                        :aria-current="
                            session.id === activeSessionId ? 'true' : undefined
                        "
                        :class="
                            cn(
                                'group flex flex-1 min-w-0 items-center gap-2 h-9 text-left hover:cursor-pointer',
                            )
                        "
                        @click="selectSession(session.id)"
                    >
                        <DrawingPin
                            :class="
                                cn(
                                    'size-4 shrink-0 transition-colors duration-200',
                                    session.id === activeSessionId
                                        ? 'text-primary'
                                        : 'text-white/40 group-hover:text-white/70',
                                )
                            "
                            aria-hidden="true"
                        />
                        <span
                            :class="
                                cn(
                                    'text-paragraph-5 truncate transition-colors duration-200',
                                    session.id === activeSessionId
                                        ? 'text-white'
                                        : 'text-white/70 group-hover:text-white',
                                )
                            "
                        >
                            {{ session.title }}
                        </span>
                    </button>

                    <DropdownMenu>
                        <DropdownMenuTrigger as-child>
                            <button
                                type="button"
                                aria-label="Mais opções"
                                class="shrink-0 flex items-center justify-center size-6 rounded opacity-0 group-hover/row:opacity-100 focus-visible:opacity-100 text-white/40 hover:text-white transition-opacity duration-200 hover:cursor-pointer"
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
                                @click="togglePinSession(session.id)"
                            >
                                {{ session.pinned ? "Desafixar" : "Fixar" }}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                class="hover:cursor-pointer"
                                @click="togglePinSession(session.id)"
                            >
                                Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                variant="destructive"
                                class="hover:cursor-pointer"
                                @click="deleteSession(session.id)"
                            >
                                Deletar
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </li>
            </ul>
        </ScrollArea>
    </nav>
</template>
