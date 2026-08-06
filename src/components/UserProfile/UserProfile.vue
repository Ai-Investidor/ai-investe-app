<script setup>
import { cn } from "@lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@components/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@components/dropdown-menu";
import Exit from "@/components/icons/Exit.vue";
import Person from "@/components/icons/Person.vue";

defineOptions({ inheritAttrs: false });

const props = defineProps({
    name: { type: String, required: true },
    plan: { type: String, required: true },
    initial: { type: String, required: true },
    avatarUrl: { type: String, default: null },
    class: { type: String, default: "" },
});

defineEmits(["profile", "logout"]);
</script>

<template>
    <DropdownMenu>
        <DropdownMenuTrigger as-child>
            <button
                type="button"
                aria-label="Abrir menu do perfil"
                :class="
                    cn(
                        'flex items-center justify-end hover:cursor-pointer w-[183px] gap-[17px] py-[10px] shrink-0',
                        props.class,
                    )
                "
            >
                <div class="flex flex-col items-end">
                    <p class="text-paragraph-7 text-white leading-tight">
                        {{ name }}
                    </p>
                    <p
                        class="text-paragraph-8 text-muted-foreground leading-tight"
                    >
                        {{ plan }}
                    </p>
                </div>
                <Avatar class="h-8 w-8">
                    <AvatarImage
                        v-if="avatarUrl"
                        :src="avatarUrl"
                        alt="Foto de perfil"
                    />
                    <AvatarFallback
                        class="bg-primary text-black text-sm font-medium"
                    >
                        {{ initial }}
                    </AvatarFallback>
                </Avatar>
            </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
            <DropdownMenuItem
                @click="$emit('profile')"
                class="hover:cursor-pointer"
            >
                <Person class="size-4 shrink-0" aria-hidden="true" />
                Perfil
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
                variant="destructive"
                @click="$emit('logout')"
                class="hover:cursor-pointer"
            >
                <Exit class="size-4 shrink-0" aria-hidden="true" />
                Sair
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
</template>
