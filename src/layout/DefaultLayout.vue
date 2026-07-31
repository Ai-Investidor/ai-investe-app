<script setup>
import { RouterView } from "vue-router";
import Sidebar from "@layout/Sidebar.vue";
import Header from "@layout/Header.vue";
</script>

<template>
    <div
        class="flex h-screen bg-linear-to-b from-app-bg from-100% to-surface overflow-hidden"
    >
        <Sidebar />
        <div class="flex flex-1 flex-col min-h-0">
            <Header />
            <main class="flex-1 min-h-0 min-w-0 overflow-hidden">
                <RouterView />
            </main>
        </div>
    </div>
</template>
