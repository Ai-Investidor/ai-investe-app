<script setup>
import { RouterLink, useRoute } from "vue-router";
import { Button } from "@components/button";
import { Separator } from "@components/separator";
import { Sheet, SheetContent } from "@components/sheet";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@components/tooltip";
import { useChat } from "@composables/useChat";
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
    { id: "alerts", icon: Alerta, label: "Notificações", badge: true },
    { id: "cards", icon: CardStackMinus, label: "Carteiras" },
];

const isActive = (id) => route.name === id;

/**
 * O tooltip do kit vem claro (bg-foreground/text-background). Aqui ele segue os
 * tons escuros do projeto, como na base anterior — a seta inclusa, que herda
 * fill-foreground e ficaria branca.
 */
const TOOLTIP_CLASS =
    "bg-surface-2 text-white border border-card-border [&_svg]:bg-surface-2 [&_svg]:fill-surface-2";

const { isOpen, close } = useMobileSidebar();
const { open: openMobileChatSessions } = useMobileChatSessions();
const { resetActiveSession } = useChat();

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
            @click="resetActiveSession"
        >
            <img
                :src="logo"
                alt="Logo da aplicação AI Invest"
                class="h-auto w-10"
                loading="eager"
            />
        </RouterLink>

        <!-- Navigation Items -->
        <TooltipProvider :delay-duration="200">
            <nav class="flex flex-col gap-4">
                <Tooltip v-for="item in sidebarItems" :key="item.id">
                    <TooltipTrigger as-child>
                        <Button
                            :as="RouterLink"
                            :to="{ name: item.id }"
                            variant="gradient"
                            size="icon-lg"
                            :aria-label="item.label"
                            :aria-current="
                                isActive(item.id) ? 'page' : undefined
                            "
                            class="rounded-lg bg-gradient-to-br from-surface to-surface-2"
                            :class="isActive(item.id) && 'border-primary shadow-lg'"
                        >
                            <span class="relative flex">
                                <component
                                    :is="item.icon"
                                    class="h-4 w-4"
                                    :class="isActive(item.id) ? 'text-primary' : 'text-muted-foreground'"
                                />
                                <span
                                    v-if="item.badge"
                                    class="absolute -top-1 -right-1 size-2 rounded-full bg-primary"
                                    aria-hidden="true"
                                />
                            </span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" :side-offset="12" :class="TOOLTIP_CLASS">
                        {{ item.label }}
                    </TooltipContent>
                </Tooltip>
            </nav>

            <!-- Spacer -->
            <div class="flex-1" />

            <!-- Toggle Menu Button -->
            <Tooltip>
                <TooltipTrigger as-child>
                    <Button
                        variant="gradient"
                        size="icon-lg"
                        aria-label="Alternar menu de navegação"
                        class="rounded-lg bg-gradient-to-br from-surface to-surface-2"
                    >
                        <MenuFold class="h-4 w-4 text-primary" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="right" :side-offset="12" :class="TOOLTIP_CLASS">
                    Alternar menu de navegação
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    </aside>

    <!-- Mobile/tablet drawer -->
    <Sheet :open="isOpen" @update:open="(value) => !value && close()">
        <SheetContent
            side="left"
            class="flex flex-col gap-8 bg-surface border-none pt-3 pb-6 px-3"
        >
            <!-- Logo -->
            <RouterLink
                to="/"
                class="transition-opacity duration-200 hover:opacity-80"
                @click="
                    () => {
                        resetActiveSession();
                        close();
                    }
                "
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
                    <span class="relative flex shrink-0">
                        <component
                            :is="item.icon"
                            class="h-4 w-4 shrink-0"
                            :class="isActive(item.id) ? 'text-primary' : 'text-muted-foreground'"
                        />
                        <span
                            v-if="item.badge"
                            class="absolute -top-1 -right-1 size-2 rounded-full bg-primary"
                            aria-hidden="true"
                        />
                    </span>
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
