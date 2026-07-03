<script setup>
import chatBg from "@assets/images/chat/chat-bg.webp";
import ViewChat from "@views/Chat/ViewChat.vue";
import ViewChatSessions from "@views/Chat/ViewChatSessions.vue";
</script>

<template>
    <div class="flex-1 page-container">
        <div class="p-3 size-full flex flex-row items-stretch gap-3">
            <ViewChatSessions class="max-lg:hidden" />

            <div
                class="relative flex-1 flex flex-col items-center justify-center gap-[25px] rounded-lg size-full overflow-hidden bg-gradient-to-br from-black to-surface-2"
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
                    class="relative z-10 flex-1 flex flex-col items-center justify-center gap-[25px] overflow-y-auto"
                >
                    <ViewChat />
                </div>
            </div>
        </div>
    </div>
</template>
