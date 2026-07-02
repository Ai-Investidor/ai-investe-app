<script setup>
import chatBg from "@assets/images/chat/chat-bg.webp";
import Chat from "@views/Chat/Chat.vue";
</script>

<template>
  <div
    class="relative flex flex-col items-center justify-center gap-[25px] w-full rounded-lg size-full overflow-hidden bg-gradient-to-br from-black to-surface-2"
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

    <Chat />
  </div>
</template>
