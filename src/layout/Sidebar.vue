<script setup>
import { cn } from "@lib/utils";
import MenuFold from "@/components/icons/MenuFold.vue";
import ChatCircleDots from "@/components/icons/ChatCircleDots.vue";
import Alerta from "@/components/icons/Alerta.vue";
import CardStackMinus from "@/components/icons/CardStackMinus.vue";
import logo from "@assets/icons/layout/logo-investe_clean.svg";

const sidebarItems = [
    { id: "chat", icon: ChatCircleDots, label: "Chat" },
    { id: "alerts", icon: Alerta, label: "Notificações" },
    { id: "cards", icon: CardStackMinus, label: "Carteiras" },
];
</script>

<template>
    <aside
        class="flex w-spacing-nav-offset flex-col items-center gap-8 bg-surface pt-3 pb-6 px-3"
    >
        <!-- Logo -->
        <img
            :src="logo"
            alt="Logo da aplicação AI Invest"
            class="h-auto w-10"
            loading="eager"
        />

        <!-- Navigation Items -->
        <nav class="flex flex-col gap-4">
            <button
                v-for="item in sidebarItems"
                :key="item.id"
                type="button"
                :aria-label="item.label"
                :class="
                    cn(
                        'flex h-10 w-10 items-center justify-center rounded-lg',
                        'border border-card-border',
                        'bg-gradient-to-br from-surface to-surface-2',
                        'hover:border-primary hover:shadow-lg',
                        'transition-colors duration-200',
                        'focus-visible:outline-2 focus-visible:outline-ring focus-visible:-outline-offset-2',
                    )
                "
            >
                <component :is="item.icon" class="h-4 w-4 text-primary" />
            </button>
        </nav>

        <!-- Spacer -->
        <div class="flex-1" />

        <!-- Toggle Menu Button -->
        <button
            type="button"
            aria-label="Alternar menu de navegação"
            :class="
                cn(
                    'flex h-10 w-10 items-center justify-center rounded-lg',
                    'border border-card-border',
                    'bg-gradient-to-br from-surface to-surface-2',
                    'hover:border-primary hover:shadow-lg',
                    'transition-colors duration-200',
                    'focus-visible:outline-2 focus-visible:outline-ring focus-visible:-outline-offset-2',
                )
            "
        >
            <MenuFold class="h-4 w-4 text-primary" />
        </button>
    </aside>
</template>
