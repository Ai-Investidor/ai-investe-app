<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import Home from "@/components/icons/Home.vue";
import MenuFold from "@/components/icons/MenuFold.vue";
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
const { searchSessions, isSearching } = useChat();

const router = useRouter();
const { signOut, isAuthenticated, userAvatarUrl, userDisplayName, userInitial } =
    useAuth();

const searchQuery = ref("");

async function handleSearch() {
    if (!isOpen.value) togglePanel();
    await searchSessions(searchQuery.value);
}

const handleLogout = async () => {
    await signOut();
    if (!isAuthenticated.value) {
        router.push({ name: "login" });
    }
};
</script>

<template>
    <header class="h-[60px] bg-linear-135 from-app-bg to-surface px-3 py-0">
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
                    class="lg:hidden flex h-8 w-8 items-center justify-center hover:cursor-pointer rounded-lg text-muted-foreground hover:text-white transition-colors"
                    @click="toggleMobileSidebar"
                >
                    <MenuFold class="w-[13px] h-[11px]" aria-hidden="true" />
                </button>

                <!-- Breadcrumb -->
                <nav class="flex items-center gap-2 shrink-0">
                    <button
                        type="button"
                        aria-label="Ir para Home"
                        class="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-white transition-colors"
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

            <!-- Profile Section -->
            <UserProfile
                :name="userDisplayName"
                plan="Plano X"
                :initial="userInitial"
                :avatar-url="userAvatarUrl"
                @logout="handleLogout"
            />
        </div>
    </header>
</template>
