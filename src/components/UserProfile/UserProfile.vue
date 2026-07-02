<script setup>
import { cn } from "@lib/utils";
import { Avatar, AvatarFallback } from "@components/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@components/dropdown-menu";

defineOptions({ inheritAttrs: false });

const props = defineProps({
    name: { type: String, required: true },
    plan: { type: String, required: true },
    initial: { type: String, required: true },
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
                Perfil
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
                variant="destructive"
                @click="$emit('logout')"
                class="hover:cursor-pointer"
            >
                Sair
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
</template>
