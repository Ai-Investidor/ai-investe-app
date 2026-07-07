<script setup>
import { RouterLink } from "vue-router";
import { Button } from "@components/button";
import ConstellationBackground from "@/components/ConstellationBackground/ConstellationBackground.vue";
import Home from "@/components/icons/Home.vue";
import logo from "@assets/icons/Logo_completa.svg";
</script>

<template>
    <main
        class="relative flex min-h-screen w-full flex-col items-center justify-center gap-6 overflow-hidden bg-app-bg"
    >
        <div class="pointer-events-none absolute inset-0 z-0">
            <ConstellationBackground
                particle-color="rgba(255, 255, 255, 0.4)"
                line-rgb="255, 255, 255"
                :line-opacity="0.12"
            />
        </div>

        <div class="relative z-10 flex flex-col items-center gap-6">
            <img
                :src="logo"
                alt="Logo da aplicação AI Invest"
                class="h-auto w-72 max-md:w-56"
            />

            <div class="flex flex-col items-center gap-2 text-center">
                <h1 class="text-auth-hero-strong text-foreground">404</h1>
                <p class="text-auth-heading text-muted-foreground">
                    Página não encontrada.
                </p>
            </div>

            <Button :as="RouterLink" :to="{ name: 'chat' }" variant="default" size="lg" class="gap-2">
                <Home class="h-4 w-4" />
                Voltar para o início
            </Button>
        </div>
    </main>
</template>
