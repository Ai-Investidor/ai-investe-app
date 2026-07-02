<script setup>
import { RouterView } from "vue-router";
import Sidebar from "@layout/Sidebar.vue";
import Header from "@layout/Header.vue";
</script>

<template>
    <div class="flex min-h-screen bg-app-bg">
        <Sidebar />
        <div class="flex flex-1 flex-col">
            <Header />
            <main class="flex-1">
                <RouterView />
            </main>
        </div>
    </div>
</template>
