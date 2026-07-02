<script setup>
import Home from "@/components/icons/Home.vue";
import { Input } from "@components/input";
import { Button } from "@components/button";
import { Avatar, AvatarFallback } from "@components/avatar";
</script>

<template>
    <header class="h-[60px] bg-app-bg px-3 py-0">
        <div class="flex h-full items-center justify-between gap-6">
            <!-- Breadcrumb -->
            <nav class="flex items-center gap-2 shrink-0">
                <button
                    type="button"
                    aria-label="Ir para Home"
                    class="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-white transition-colors"
                >
                    <Home class="h-4 w-4" aria-hidden="true" />
                </button>
                <span class="text-paragraph-6 text-muted-foreground">/</span>
                <span class="text-paragraph-5 text-white">Home Chat</span>
            </nav>

            <!-- Search Input + Button -->
            <div class="flex w-[386px] gap-2">
                <Input
                    type="search"
                    placeholder="Pesquisar histórico"
                    class="flex-1 h-9 bg-app-bg text-paragraph-3 placeholder:text-muted-foreground border-input-border"
                />
                <Button
                    type="button"
                    class="h-9 px-3 bg-btn-light text-black text-paragraph-4 hover:bg-opacity-90 rounded-lg shrink-0"
                >
                    Buscar
                </Button>
            </div>

            <!-- Profile Section -->
            <div
                class="flex items-center w-[183px] gap-[17px] px-[15px] py-[10px] shrink-0"
            >
                <div class="flex flex-col items-end">
                    <p class="text-paragraph-7 text-white leading-tight">
                        Frederico
                    </p>
                    <p
                        class="text-paragraph-8 text-muted-foreground leading-tight"
                    >
                        Plano X
                    </p>
                </div>
                <Avatar class="h-8 w-8">
                    <AvatarFallback
                        class="bg-primary text-black text-sm font-medium"
                    >
                        F
                    </AvatarFallback>
                </Avatar>
            </div>
        </div>
    </header>
</template>
