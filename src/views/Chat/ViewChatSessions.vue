<script setup>
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
        :class="cn('flex flex-col gap-6 w-[195px] h-full shrink-0', props.class)"
    >
        <!-- Registrar Interação -->
        <button
            type="button"
            :class="
                cn(
                    'flex items-center gap-2 h-7 px-3 rounded-md shrink-0',
                    'border border-card-border bg-gradient-to-r from-black to-surface-2 shadow-[0px_2px_0px_0px_black]',
                    'hover:border-primary hover:shadow-lg hover:cursor-pointer transition-colors duration-200',
                    'focus-visible:outline-2 focus-visible:outline-ring focus-visible:-outline-offset-2',
                )
            "
            @click="createSession"
        >
            <Plus class="size-4 text-white shrink-0" aria-hidden="true" />
            <span class="text-paragraph-9 text-white whitespace-nowrap">Registrar Interação</span>
        </button>

        <!-- Lista de sessões -->
        <ScrollArea class="flex-1 min-h-0">
            <ul class="relative flex flex-col">
                <div
                    aria-hidden="true"
                    class="absolute left-[7px] top-2 bottom-2 border-l border-dashed border-white/15"
                />
                <li v-for="session in sessions" :key="session.id">
                    <button
                        type="button"
                        :aria-current="session.id === activeSessionId ? 'true' : undefined"
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
