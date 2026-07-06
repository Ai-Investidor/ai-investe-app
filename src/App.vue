<script setup>
import { RouterView } from "vue-router";
import { Toaster } from "@/components/ui/sonner";
</script>

<template>
    <RouterView />
    <Toaster richColors closeButton position="top-right" />
</template>

<style scoped></style>
