<script setup>
import { Button } from "@components/button";
import { ScrollArea } from "@components/scroll-area";
import { useChatSessions } from "@composables/useChatSessions";
import { cn } from "@lib/utils";
import DrawingPin from "@/components/icons/DrawingPin.vue";
import Plus from "@/components/icons/Plus.vue";

defineOptions({ inheritAttrs: false });

const props = defineProps({
    class: {
        type: [Boolean, null, String, Object, Array],
        required: false,
        skipCheck: true,
    },
});

const { sessions, activeSessionId, selectSession, createSession } =
    useChatSessions();
</script>

<template>
    <nav
        aria-label="Histórico de conversas"
        :class="cn('flex flex-col w-[195px] h-full shrink-0', props.class)"
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
                <li v-for="session in sessions" :key="session.id">
                    <button
                        type="button"
                        :aria-current="
                            session.id === activeSessionId ? 'true' : undefined
                        "
                        :class="
                            cn(
                                'group relative z-10 flex items-center gap-2 w-full h-9 text-left hover:cursor-pointer',
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
                </li>
            </ul>
        </ScrollArea>
    </nav>
</template>
