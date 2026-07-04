<script setup>
import { RouterView } from "vue-router";
import ConstellationBackground from "@/components/ConstellationBackground/ConstellationBackground.vue";
</script>

<template>
    <main
        class="relative min-h-screen w-full bg-app-bg lg:h-screen lg:overflow-hidden max-lg:overflow-y-auto"
    >
        <div
            class="pointer-events-none absolute inset-y-0 left-0 right-[var(--auth-panel-width)] z-0 max-lg:inset-0 max-lg:right-0"
        >
            <ConstellationBackground
                particle-color="rgba(255, 255, 255, 0.4)"
                line-rgb="255, 255, 255"
                :line-opacity="0.12"
            />
        </div>

        <div
            class="absolute right-0 top-0 h-full w-[var(--auth-panel-width)] bg-primary max-lg:hidden"
        ></div>

        <div class="relative z-10 w-full lg:h-full">
            <RouterView />
        </div>
    </main>
</template>

<style lang="sass" scoped></style>
