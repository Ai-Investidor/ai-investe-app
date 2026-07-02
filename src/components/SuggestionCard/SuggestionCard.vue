<script setup>
import { cn } from "@lib/utils";

const props = defineProps({
    icon: { type: [Object, Function], required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    class: {
        type: [Boolean, null, String, Object, Array],
        required: false,
        skipCheck: true,
    },
});
</script>

<template>
    <button
        type="button"
        data-slot="suggestion-card"
        :class="
            cn(
                'group flex flex-col gap-2 items-start p-[15px] rounded-md border border-card-border bg-gradient-to-r from-black to-surface-2 shadow-sm hover:shadow-md transition-shadow cursor-pointer text-left',
                props.class,
            )
        "
    >
        <!-- Icon -->
        <component
            :is="icon"
            class="w-4 h-4 text-white flex-shrink-0"
            aria-hidden="true"
        />

        <!-- Card content -->
        <div class="flex flex-col gap-2 flex-1">
            <h3 class="text-paragraph-2 text-white">
                {{ title }}
            </h3>
            <p class="text-paragraph-1 text-white/75">
                {{ description }}
            </p>
        </div>
    </button>
</template>
