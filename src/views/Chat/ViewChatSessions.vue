<script setup>
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@components/alert-dialog";
import { Button } from "@components/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@components/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@components/dropdown-menu";
import { Input } from "@components/input";
import { Label } from "@components/label";
import { ScrollArea } from "@components/scroll-area";
import { Sheet, SheetContent } from "@components/sheet";
import { useChat } from "@composables/useChat";
import { useChatSessionsPanel } from "@composables/useChatSessionsPanel";
import { useMobileChatSessions } from "@composables/useMobileChatSessions";
import { useMobileSidebar } from "@composables/useMobileSidebar";
import { prefersReducedMotion } from "@lib/gsap";
import { cn } from "@lib/utils";
import { computed, ref } from "vue";
import ArrowLeft from "@/components/icons/ArrowLeft.vue";
import ChatCircleDots from "@/components/icons/ChatCircleDots.vue";
import DrawingPin from "@/components/icons/DrawingPin.vue";
import MoreVertical from "@/components/icons/MoreVertical.vue";
import Pencil from "@/components/icons/Pencil.vue";
import Pin from "@/components/icons/Pin.vue";
import Trash from "@/components/icons/Trash.vue";
import Plus from "@/components/icons/Plus.vue";

defineOptions({ inheritAttrs: false });

const props = defineProps({
    class: {
        type: [Boolean, null, String, Object, Array],
        required: false,
        skipCheck: true,
    },
});

const {
    sortedSessions,
    activeSessionId,
    selectSession,
    resetActiveSession,
    togglePinSession,
    deleteSession,
    updateSessionTitle,
    loadMoreSessions,
    hasMoreSessions,
    isLoadingSessions,
    isLoadingMoreSessions,
    isSearching,
    isDeletingSession,
    isUpdatingSessionTitle,
} = useChat();

const { isOpen } = useChatSessionsPanel();

const { isOpen: isMobileOpen, close: closeMobile } = useMobileChatSessions();
const { open: openMobileSidebar } = useMobileSidebar();

const sessionToDelete = ref(null);
const isDeleteDialogOpen = ref(false);

const sessionToEdit = ref(null);
const editTitle = ref("");
const isEditDialogOpen = ref(false);

const canSaveEditTitle = computed(() => editTitle.value.trim().length > 0);

const isSessionsListLoading = computed(
    () =>
        isLoadingSessions.value ||
        isSearching.value ||
        isDeletingSession.value ||
        isUpdatingSessionTitle.value,
);

const sessionsLoadingLabel = computed(() => {
    if (isDeletingSession.value) return "Excluindo sessão";
    if (isUpdatingSessionTitle.value) return "Salvando título";
    return "Carregando sessões";
});

function requestEditSession(session) {
    sessionToEdit.value = session;
    editTitle.value = session.title;
    isEditDialogOpen.value = true;
}

function handleEditDialogOpenChange(open) {
    if (!open && !isUpdatingSessionTitle.value) {
        cancelEditSession();
    }
}

function cancelEditSession() {
    sessionToEdit.value = null;
    editTitle.value = "";
    isEditDialogOpen.value = false;
}

async function confirmEditSession() {
    if (!sessionToEdit.value || !canSaveEditTitle.value || isUpdatingSessionTitle.value) {
        return;
    }

    const updated = await updateSessionTitle(
        sessionToEdit.value.id,
        editTitle.value,
    );

    if (updated) cancelEditSession();
}

function requestDeleteSession(session) {
    sessionToDelete.value = session;
    isDeleteDialogOpen.value = true;
}

function handleDeleteDialogOpenChange(open) {
    if (!open && !isDeletingSession.value) {
        cancelDeleteSession();
    }
}

function cancelDeleteSession() {
    sessionToDelete.value = null;
    isDeleteDialogOpen.value = false;
}

async function confirmDeleteSession() {
    if (!sessionToDelete.value || isDeletingSession.value) return;

    const deleted = await deleteSession(sessionToDelete.value.id);
    if (deleted) cancelDeleteSession();
}

function handleLoadMore() {
    if (isLoadingMoreSessions.value || !hasMoreSessions.value) return;
    loadMoreSessions();
}

function selectSessionMobile(id) {
    selectSession(id);
    closeMobile();
}

function createSessionMobile() {
    resetActiveSession();
    closeMobile();
}

function backToSidebar() {
    closeMobile();
    openMobileSidebar();
}
</script>

<template>
    <nav
        id="chat-sessions-panel"
        aria-label="Histórico de conversas"
        :class="
            cn(
                'flex flex-col h-full shrink-0 overflow-hidden',
                !prefersReducedMotion &&
                    'transition-[width] duration-300 ease-in-out',
                isOpen ? 'w-[195px]' : 'w-0',
                props.class,
            )
        "
    >
        <!-- Registrar Interação -->
        <Button
            variant="gradient"
            class="h-8 gap-2 px-[15px] shrink-0"
            @click="resetActiveSession"
        >
            <Plus class="size-4 text-primary shrink-0" aria-hidden="true" />
            <span class="text-paragraph-9 text-white whitespace-nowrap"
                >Registrar Interação</span
            >
        </Button>

        <!-- Lista de sessões -->
        <ScrollArea class="relative flex-1 min-h-0" data-lenis-prevent>
            <div
                v-if="isSessionsListLoading"
                class="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-surface/80"
                role="status"
                aria-live="polite"
                :aria-label="sessionsLoadingLabel"
            >
                <div class="flex items-center gap-1.5" aria-hidden="true">
                    <span
                        class="size-2 rounded-full bg-white/55 animate-bounce [animation-delay:-0.3s]"
                    />
                    <span
                        class="size-2 rounded-full bg-white/55 animate-bounce [animation-delay:-0.15s]"
                    />
                    <span class="size-2 rounded-full bg-white/55 animate-bounce" />
                </div>
                <p class="text-paragraph-9 text-white/55">
                    {{ sessionsLoadingLabel }}...
                </p>
            </div>

            <ul
                class="relative flex flex-col pt-2"
                :class="
                    isSessionsListLoading && 'pointer-events-none opacity-50'
                "
            >
                <div
                    aria-hidden="true"
                    class="absolute left-[7px] top-2 bottom-2 border-l border-dashed border-white/15"
                />
                <li
                    v-for="session in sortedSessions"
                    :key="session.id"
                    class="relative z-10"
                >
                    <div class="group flex items-center gap-1">
                        <button
                            type="button"
                            :aria-current="
                                session.id === activeSessionId
                                    ? 'true'
                                    : undefined
                            "
                            :class="
                                cn(
                                    'group/item flex flex-1 min-w-0 items-center gap-2 h-9 text-left hover:cursor-pointer',
                                )
                            "
                            @click="selectSession(session.id)"
                        >
                            <component
                                :is="session.pinned ? DrawingPin : ChatCircleDots"
                                :class="
                                    cn(
                                        'size-4 shrink-0 transition-colors duration-200',
                                        session.id === activeSessionId
                                            ? 'text-primary'
                                            : 'text-white/40 group-hover/item:text-white/70',
                                    )
                                "
                                aria-hidden="true"
                            />
                            <span
                                :class="
                                    cn(
                                        'text-paragraph-5 truncate transition-colors duration-200',
                                        session.id === activeSessionId
                                            ? 'text-white'
                                            : 'text-white/70 group-hover/item:text-white',
                                    )
                                "
                            >
                                {{ session.title }}
                            </span>
                        </button>

                        <DropdownMenu>
                            <DropdownMenuTrigger as-child>
                                <button
                                    type="button"
                                    aria-label="Mais opções"
                                    class="shrink-0 flex items-center justify-center size-6 rounded opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto focus-visible:opacity-100 focus-visible:pointer-events-auto data-[state=open]:opacity-100 data-[state=open]:pointer-events-auto text-white/40 hover:text-white transition-opacity duration-200 hover:cursor-pointer"
                                >
                                <MoreVertical
                                    class="size-4"
                                    aria-hidden="true"
                                />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                class="hover:cursor-pointer"
                                @click="togglePinSession(session.id)"
                            >
                                <Pin class="size-4 shrink-0" aria-hidden="true" />
                                {{ session.pinned ? "Desafixar" : "Fixar" }}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                class="hover:cursor-pointer"
                                @click="requestEditSession(session)"
                            >
                                <Pencil class="size-4 shrink-0" aria-hidden="true" />
                                Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                variant="destructive"
                                class="hover:cursor-pointer"
                                @click="requestDeleteSession(session)"
                            >
                                <Trash class="size-4 shrink-0" aria-hidden="true" />
                                Deletar
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </li>
                <li
                    v-if="hasMoreSessions || isLoadingMoreSessions"
                    class="relative z-10 flex justify-center py-2"
                >
                    <Button
                        v-if="hasMoreSessions && !isLoadingMoreSessions"
                        variant="ghost"
                        size="sm"
                        class="h-7 text-paragraph-9 text-white/70 hover:text-white"
                        @click="handleLoadMore"
                    >
                        Ver mais
                    </Button>
                    <span
                        v-else-if="isLoadingMoreSessions"
                        class="flex items-center gap-2 text-paragraph-9 text-white/50"
                        role="status"
                        aria-live="polite"
                        aria-label="Carregando mais sessões"
                    >
                        <span class="flex items-center gap-1" aria-hidden="true">
                            <span
                                class="size-1.5 rounded-full bg-white/55 animate-bounce [animation-delay:-0.3s]"
                            />
                            <span
                                class="size-1.5 rounded-full bg-white/55 animate-bounce [animation-delay:-0.15s]"
                            />
                            <span
                                class="size-1.5 rounded-full bg-white/55 animate-bounce"
                            />
                        </span>
                        Carregando...
                    </span>
                </li>
            </ul>
        </ScrollArea>
    </nav>

    <!-- Mobile/tablet drawer -->
    <Sheet :open="isMobileOpen" @update:open="(value) => !value && closeMobile()">
        <SheetContent
            side="left"
            aria-label="Histórico de conversas"
            class="flex flex-col gap-4 bg-gradient-to-b from-surface-2 to-surface border-none pt-12 pb-6 px-3"
        >
            <!-- Voltar pro menu de navegação -->
            <button
                type="button"
                class="absolute top-4 left-4 flex items-center gap-1.5 text-muted-foreground hover:text-white transition-colors hover:cursor-pointer"
                @click="backToSidebar"
            >
                <ArrowLeft class="size-4 shrink-0" aria-hidden="true" />
                <span class="text-paragraph-9">Voltar</span>
            </button>

            <!-- Registrar Interação -->
            <Button
                variant="gradient"
                class="h-8 gap-2 px-[15px] shrink-0"
                @click="createSessionMobile"
            >
                <Plus class="size-4 text-primary shrink-0" aria-hidden="true" />
                <span class="text-paragraph-9 text-white whitespace-nowrap"
                    >Registrar Interação</span
                >
            </Button>

            <!-- Lista de sessões -->
            <ScrollArea class="relative flex-1 min-h-0" data-lenis-prevent>
                <div
                    v-if="isSessionsListLoading"
                    class="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-surface/80"
                    role="status"
                    aria-live="polite"
                    :aria-label="sessionsLoadingLabel"
                >
                    <div class="flex items-center gap-1.5" aria-hidden="true">
                        <span
                            class="size-2 rounded-full bg-white/55 animate-bounce [animation-delay:-0.3s]"
                        />
                        <span
                            class="size-2 rounded-full bg-white/55 animate-bounce [animation-delay:-0.15s]"
                        />
                        <span
                            class="size-2 rounded-full bg-white/55 animate-bounce"
                        />
                    </div>
                    <p class="text-paragraph-9 text-white/55">
                        {{ sessionsLoadingLabel }}...
                    </p>
                </div>

                <ul
                    class="relative flex flex-col pt-2"
                    :class="
                        isSessionsListLoading && 'pointer-events-none opacity-50'
                    "
                >
                    <div
                        aria-hidden="true"
                        class="absolute left-[7px] top-2 bottom-2 border-l border-dashed border-white/15"
                    />
                    <li
                        v-for="session in sortedSessions"
                        :key="session.id"
                        class="group/row relative z-10 flex items-center gap-0.5"
                    >
                        <button
                            type="button"
                            :aria-current="
                                session.id === activeSessionId ? 'true' : undefined
                            "
                            class="group flex flex-1 min-w-0 items-center gap-2 h-9 text-left hover:cursor-pointer"
                            @click="selectSessionMobile(session.id)"
                        >
                            <component
                                :is="session.pinned ? DrawingPin : ChatCircleDots"
                                :class="
                                    cn(
                                        'size-4 shrink-0 transition-colors duration-200',
                                        session.id === activeSessionId
                                            ? 'text-primary'
                                            : 'text-white/40 group-hover:text-white/70',
                                    )
                                "
                                aria-hidden="true"
                            />
                            <span
                                :class="
                                    cn(
                                        'text-paragraph-5 truncate transition-colors duration-200',
                                        session.id === activeSessionId
                                            ? 'text-white'
                                            : 'text-white/70 group-hover:text-white',
                                    )
                                "
                            >
                                {{ session.title }}
                            </span>
                        </button>

                        <DropdownMenu>
                            <DropdownMenuTrigger as-child>
                                <button
                                    type="button"
                                    aria-label="Mais opções"
                                    class="shrink-0 flex items-center justify-center size-6 rounded text-white/40 hover:text-white transition-colors duration-200 hover:cursor-pointer"
                                >
                                    <MoreVertical
                                        class="size-4"
                                        aria-hidden="true"
                                    />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                    class="hover:cursor-pointer"
                                    @click="togglePinSession(session.id)"
                                >
                                    <Pin class="size-4 shrink-0" aria-hidden="true" />
                                {{ session.pinned ? "Desafixar" : "Fixar" }}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    class="hover:cursor-pointer"
                                    @click="requestEditSession(session)"
                                >
                                    <Pencil class="size-4 shrink-0" aria-hidden="true" />
                                    Editar
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    variant="destructive"
                                    class="hover:cursor-pointer"
                                    @click="requestDeleteSession(session)"
                                >
                                    <Trash class="size-4 shrink-0" aria-hidden="true" />
                                    Deletar
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </li>
                    <li
                        v-if="hasMoreSessions || isLoadingMoreSessions"
                        class="relative z-10 flex justify-center py-2"
                    >
                        <Button
                            v-if="hasMoreSessions && !isLoadingMoreSessions"
                            variant="ghost"
                            size="sm"
                            class="h-7 text-paragraph-9 text-white/70 hover:text-white"
                            @click="handleLoadMore"
                        >
                            Ver mais
                        </Button>
                        <span
                            v-else-if="isLoadingMoreSessions"
                            class="flex items-center gap-2 text-paragraph-9 text-white/50"
                            role="status"
                            aria-live="polite"
                            aria-label="Carregando mais sessões"
                        >
                            <span class="flex items-center gap-1" aria-hidden="true">
                                <span
                                    class="size-1.5 rounded-full bg-white/55 animate-bounce [animation-delay:-0.3s]"
                                />
                                <span
                                    class="size-1.5 rounded-full bg-white/55 animate-bounce [animation-delay:-0.15s]"
                                />
                                <span
                                    class="size-1.5 rounded-full bg-white/55 animate-bounce"
                                />
                            </span>
                            Carregando...
                        </span>
                    </li>
                </ul>
            </ScrollArea>
        </SheetContent>
    </Sheet>

    <Dialog :open="isEditDialogOpen" @update:open="handleEditDialogOpenChange">
        <DialogContent class="bg-surface border-white/10">
            <DialogHeader>
                <DialogTitle class="text-white">
                    Editar título da sessão
                </DialogTitle>
            </DialogHeader>

            <form class="flex flex-col gap-4" @submit.prevent="confirmEditSession">
                <div class="flex flex-col gap-2">
                    <Label for="session-title" class="text-white/70">
                        Título
                    </Label>
                    <Input
                        id="session-title"
                        v-model="editTitle"
                        type="text"
                        placeholder="Digite o título da sessão"
                        autocomplete="off"
                        :disabled="isUpdatingSessionTitle"
                        class="border-white/15 bg-white/5 text-white placeholder:text-white/40"
                    />
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        :disabled="isUpdatingSessionTitle"
                        @click="cancelEditSession"
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        variant="gradient"
                        :disabled="!canSaveEditTitle || isUpdatingSessionTitle"
                    >
                        {{
                            isUpdatingSessionTitle ? "Salvando..." : "Salvar"
                        }}
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>

    <AlertDialog
        :open="isDeleteDialogOpen"
        @update:open="handleDeleteDialogOpenChange"
    >
        <AlertDialogContent class="bg-surface border-white/10">
            <AlertDialogHeader>
                <AlertDialogTitle class="text-white">
                    Excluir sessão?
                </AlertDialogTitle>
                <AlertDialogDescription class="text-white/70">
                    Tem certeza que deseja excluir
                    <span class="font-medium text-white">
                        "{{ sessionToDelete?.title }}"
                    </span>
                    ? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel :disabled="isDeletingSession">
                    Cancelar
                </AlertDialogCancel>
                <Button
                    variant="destructive"
                    :disabled="isDeletingSession"
                    @click="confirmDeleteSession"
                >
                    {{ isDeletingSession ? "Excluindo..." : "Excluir" }}
                </Button>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
</template>
