<script setup>
import chatBg from "@assets/images/chat/chat-bg.webp";
import { useChat } from "@composables/useChat";
import ViewChat from "@views/Chat/ViewChat.vue";
import ViewChatConversation from "@views/Chat/ViewChatConversation.vue";
import ViewChatSessions from "@views/Chat/ViewChatSessions.vue";

const { hasActiveConversation } = useChat();
</script>

<template>
    <div class="flex-1 page-container min-w-0">
        <div
            class="p-3 max-md:p-2 size-full flex flex-row items-stretch gap-3 min-w-0 overflow-hidden"
        >
            <ViewChatSessions class="max-lg:hidden" />

            <div
                :class="[
                    'relative flex-1 flex flex-col gap-[25px] rounded-lg size-full min-w-0 overflow-hidden bg-gradient-to-br from-black to-surface-2',
                    hasActiveConversation
                        ? 'items-stretch justify-start'
                        : 'items-center justify-center',
                ]"
            >
                <!-- Background image -->
                <div
                    class="absolute inset-0 pointer-events-none rounded-lg"
                    aria-hidden="true"
                >
                    <img
                        :src="chatBg"
                        alt=""
                        class="absolute inset-0 w-full h-full object-cover mix-blend-soft-light rounded-lg"
                        loading="eager"
                        fetchpriority="high"
                    />
                </div>

                <div
                    :class="[
                        'relative z-10 flex-1 flex flex-col gap-[25px] min-w-0',
                        hasActiveConversation
                            ? 'items-stretch overflow-hidden'
                            : 'items-center overflow-y-auto',
                    ]"
                >
                    <ViewChatConversation v-if="hasActiveConversation" />
                    <ViewChat v-else />
                </div>
            </div>
        </div>
    </div>
</template>
