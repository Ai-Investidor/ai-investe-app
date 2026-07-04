<script setup>
import { RouterLink, useRoute } from "vue-router";
import { Button } from "@components/button";
import { Separator } from "@components/separator";
import { Sheet, SheetContent } from "@components/sheet";
import { useMobileChatSessions } from "@composables/useMobileChatSessions";
import { useMobileSidebar } from "@composables/useMobileSidebar";
import MenuFold from "@/components/icons/MenuFold.vue";
import ChatCircleDots from "@/components/icons/ChatCircleDots.vue";
import Alerta from "@/components/icons/Alerta.vue";
import CardStackMinus from "@/components/icons/CardStackMinus.vue";
import DrawingPin from "@/components/icons/DrawingPin.vue";
import logo from "@assets/icons/layout/logo-investe_clean.svg";

const route = useRoute();

const sidebarItems = [
    { id: "chat", icon: ChatCircleDots, label: "Chat" },
    { id: "alerts", icon: Alerta, label: "Notificações" },
    { id: "cards", icon: CardStackMinus, label: "Carteiras" },
];

const isActive = (id) => route.name === id;

const { isOpen, close } = useMobileSidebar();
const { open: openMobileChatSessions } = useMobileChatSessions();

function showConversations() {
    close();
    openMobileChatSessions();
}
</script>

<template>
    <!-- Desktop rail -->
    <aside
        class="max-lg:hidden flex w-spacing-nav-offset flex-col items-center gap-8 bg-surface pt-3 pb-6 px-3"
    >
        <!-- Logo -->
        <RouterLink
            to="/"
            class="transition-opacity duration-200 hover:opacity-80"
        >
            <img
                :src="logo"
                alt="Logo da aplicação AI Invest"
                class="h-auto w-10"
                loading="eager"
            />
        </RouterLink>

        <!-- Navigation Items -->
        <nav class="flex flex-col gap-4">
            <Button
                v-for="item in sidebarItems"
                :key="item.id"
                :as="RouterLink"
                :to="{ name: item.id }"
                variant="gradient"
                size="icon-lg"
                :aria-label="item.label"
                :aria-current="isActive(item.id) ? 'page' : undefined"
                class="rounded-lg bg-gradient-to-br from-surface to-surface-2"
                :class="isActive(item.id) && 'border-primary shadow-lg'"
            >
                <component
                    :is="item.icon"
                    class="h-4 w-4"
                    :class="isActive(item.id) ? 'text-primary' : 'text-muted-foreground'"
                />
            </Button>
        </nav>

        <!-- Spacer -->
        <div class="flex-1" />

        <!-- Toggle Menu Button -->
        <Button
            variant="gradient"
            size="icon-lg"
            aria-label="Alternar menu de navegação"
            class="rounded-lg bg-gradient-to-br from-surface to-surface-2"
        >
            <MenuFold class="h-4 w-4 text-primary" />
        </Button>
    </aside>

    <!-- Mobile/tablet drawer -->
    <Sheet :open="isOpen" @update:open="(value) => !value && close()">
        <SheetContent
            side="left"
            class="flex flex-col gap-8 bg-gradient-to-b from-surface-2 to-surface border-none pt-3 pb-6 px-3"
        >
            <!-- Logo -->
            <RouterLink
                to="/"
                class="transition-opacity duration-200 hover:opacity-80"
                @click="close"
            >
                <img
                    :src="logo"
                    alt="Logo da aplicação AI Invest"
                    class="h-auto w-10"
                    loading="eager"
                />
            </RouterLink>

            <!-- Navigation Items -->
            <nav class="flex flex-col gap-2">
                <Button
                    v-for="item in sidebarItems"
                    :key="item.id"
                    :as="RouterLink"
                    :to="{ name: item.id }"
                    variant="gradient"
                    :aria-current="isActive(item.id) ? 'page' : undefined"
                    class="w-full justify-start gap-3 h-10 px-3 rounded-lg bg-gradient-to-r from-surface to-surface-2"
                    :class="isActive(item.id) && 'border-primary shadow-lg'"
                    @click="close"
                >
                    <component
                        :is="item.icon"
                        class="h-4 w-4 shrink-0"
                        :class="isActive(item.id) ? 'text-primary' : 'text-muted-foreground'"
                    />
                    <span
                        class="text-paragraph-9"
                        :class="isActive(item.id) ? 'text-white' : 'text-muted-foreground'"
                        >{{ item.label }}</span
                    >
                </Button>

                <template v-if="route.name === 'chat'">
                    <Separator class="my-2" />

                    <Button
                        variant="gradient"
                        class="w-full justify-start gap-3 h-10 px-3 rounded-lg bg-gradient-to-r from-surface to-surface-2"
                        @click="showConversations"
                    >
                        <DrawingPin
                            class="h-4 w-4 shrink-0 text-muted-foreground"
                        />
                        <span class="text-paragraph-9 text-muted-foreground"
                            >Mostrar conversas</span
                        >
                    </Button>
                </template>
            </nav>
        </SheetContent>
    </Sheet>
</template>
