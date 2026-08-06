<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import Hamburger from "@/components/icons/Hamburger.vue";
import Home from "@/components/icons/Home.vue";
import MenuFold from "@/components/icons/MenuFold.vue";
import Search from "@/components/icons/Search.vue";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
} from "@components/dialog";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
} from "@components/input-group";
import UserProfile from "@/components/UserProfile/UserProfile.vue";
import { useAuth } from "@composables/useAuth.js";
import { useChat } from "@composables/useChat";
import { useChatSessionsPanel } from "@composables/useChatSessionsPanel";
import { useMobileSidebar } from "@composables/useMobileSidebar";

const { isOpen, togglePanel } = useChatSessionsPanel();
const { toggle: toggleMobileSidebar } = useMobileSidebar();
const { searchSessions, isSearching, resetActiveSession } = useChat();

const router = useRouter();
const { signOut, isAuthenticated, userAvatarUrl, userDisplayName, userInitial } =
    useAuth();

const searchQuery = ref("");

/** Busca no mobile: o input nao cabe no header, entao vive num dialog. */
const isMobileSearchOpen = ref(false);

async function handleSearch() {
    if (!isOpen.value) togglePanel();
    await searchSessions(searchQuery.value);
}

async function handleMobileSearch() {
    await handleSearch();
    isMobileSearchOpen.value = false;
}

/** Volta pra home do chat: rota do chat + conversa ativa zerada. */
function goToChatHome() {
    resetActiveSession();
    if (router.currentRoute.value.name !== "chat") {
        router.push({ name: "chat" });
    }
}

const handleLogout = async () => {
    await signOut();
    if (!isAuthenticated.value) {
        router.push({ name: "login" });
    }
};
</script>

<template>
    <header class="h-[60px] px-3 py-0">
        <div class="flex h-full items-center justify-between gap-6 max-lg:gap-3">
            <div class="flex items-center gap-x-10 max-lg:gap-x-3">
                <!-- Desktop: toggle do painel de sessões do chat -->
                <button
                    type="button"
                    :aria-label="isOpen ? 'Fechar menu' : 'Abrir menu'"
                    :aria-expanded="isOpen"
                    aria-controls="chat-sessions-panel"
                    :class="[
                        'max-lg:hidden flex h-8 w-8 items-center justify-start hover:cursor-pointer rounded-lg transition-colors',
                        isOpen
                            ? 'text-white/40 hover:text-white'
                            : 'text-white hover:text-white/40',
                    ]"
                    @click="togglePanel"
                >
                    <MenuFold class="w-[13px] h-[11px]" aria-hidden="true" />
                </button>

                <!-- Mobile/tablet: abre o menu lateral principal -->
                <button
                    type="button"
                    aria-label="Abrir menu de navegação"
                    aria-controls="mobile-sidebar-panel"
                    class="lg:hidden flex h-8 w-8 shrink-0 items-center justify-center hover:cursor-pointer rounded-lg text-muted-foreground hover:text-white transition-colors"
                    @click="toggleMobileSidebar"
                >
                    <Hamburger class="size-[22px]" aria-hidden="true" />
                </button>

                <!-- Breadcrumb -->
                <nav class="flex items-center gap-2 shrink-0">
                    <button
                        type="button"
                        aria-label="Ir para a home do chat"
                        class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg hover:cursor-pointer text-muted-foreground hover:text-white transition-colors"
                        @click="goToChatHome"
                    >
                        <Home class="h-4 w-4" aria-hidden="true" />
                    </button>
                    <span class="text-paragraph-6 text-muted-foreground"
                        >/</span
                    >
                    <span class="text-paragraph-5 text-white">Home Chat</span>
                </nav>
            </div>

            <!-- Search Input + Button -->
            <InputGroup
                class="max-md:hidden w-[386px] max-lg:w-full max-lg:max-w-xs bg-app-bg border-input-border"
            >
                <InputGroupInput
                    v-model="searchQuery"
                    type="search"
                    placeholder="Pesquisar histórico"
                    class="text-paragraph-3 placeholder:text-muted-foreground"
                    :disabled="isSearching"
                    @keydown.enter="handleSearch"
                />
                <InputGroupAddon align="inline-end">
                    <InputGroupButton
                        type="button"
                        size="sm"
                        class="bg-btn-light text-black text-paragraph-4 hover:bg-opacity-90 rounded-lg"
                        :disabled="isSearching"
                        @click="handleSearch"
                    >
                        Buscar
                    </InputGroupButton>
                </InputGroupAddon>
            </InputGroup>

            <!-- Bloco da direita: lupa e perfil andam juntos, colados na borda -->
            <div class="flex items-center gap-4 shrink-0">
                <!-- Mobile/tablet: busca vive num dialog, o input nao cabe no header -->
                <Dialog v-model:open="isMobileSearchOpen">
                <DialogTrigger as-child>
                    <button
                        type="button"
                        aria-label="Pesquisar histórico"
                        class="md:hidden flex h-8 w-8 shrink-0 items-center justify-center hover:cursor-pointer rounded-lg bg-surface-2 border border-card-border text-muted-foreground hover:text-white transition-colors"
                    >
                        <Search class="size-4" aria-hidden="true" />
                    </button>
                </DialogTrigger>
                <DialogContent
                    class="bg-surface border-white/10 top-4 translate-y-0 pr-12 [&_[data-slot=dialog-close]]:top-1/2 [&_[data-slot=dialog-close]]:-translate-y-1/2"
                >
                    <DialogTitle class="sr-only">
                        Pesquisar histórico
                    </DialogTitle>

                    <form @submit.prevent="handleMobileSearch">
                        <InputGroup class="bg-app-bg border-input-border">
                            <InputGroupAddon>
                                <Search
                                    class="size-4 text-muted-foreground"
                                    aria-hidden="true"
                                />
                            </InputGroupAddon>
                            <InputGroupInput
                                v-model="searchQuery"
                                type="search"
                                placeholder="Pesquisar histórico"
                                class="text-paragraph-3 placeholder:text-muted-foreground"
                                :disabled="isSearching"
                            />
                        </InputGroup>
                    </form>
                </DialogContent>
                </Dialog>

                <!-- Profile Section -->
                <UserProfile
                    :name="userDisplayName"
                    plan="Plano X"
                    :initial="userInitial"
                    :avatar-url="userAvatarUrl"
                    @logout="handleLogout"
                />
            </div>
        </div>
    </header>
</template>
