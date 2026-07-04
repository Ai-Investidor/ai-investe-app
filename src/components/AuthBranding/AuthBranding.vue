<script setup>
import MaskOn from "@/components/icons/MaskOn.vue";

const brandingItems = [
    { id: 1, label: "Análise de ativos" },
    { id: 2, label: "Carteiras personalizadas" },
    { id: 3, label: "Insights e alertas do mercado" },
];
</script>

<template>
    <section
        class="relative flex w-full items-center min-h-screen max-w-[var(--auth-content-width)] max-lg:hidden"
    >
        <div
            class="flex flex-col gap-layout-gap items-start justify-center pl-nav-offset py-10 w-full h-full max-w-[var(--auth-branding-content-max)] min-[1300px]:max-w-[650px]"
        >
            <h1 class="text-auth-hero text-white">
                Inteligência
                <span
                    class="text-auth-hero-strong text-primary [text-shadow:0_0_24px_var(--color-primary)]"
                    >artificial</span
                >
                para seus investimentos
            </h1>

            <p
                class="text-auth-subheading text-white/75 max-w-[var(--auth-branding-content-max)] min-[1300px]:max-w-[400px]"
            >
                Tome decisões mais inteligentes com análises em tempo real,
                carteiras personalizadas e insights do mercado global.
            </p>

            <div
                class="flex flex-wrap min-[1300px]:flex-nowrap gap-8 max-w-full"
            >
                <div
                    v-for="item in brandingItems"
                    :key="item.id"
                    class="flex gap-2 items-center"
                >
                    <MaskOn
                        class="w-4 h-4 text-primary flex-shrink-0"
                        aria-hidden="true"
                    />
                    <span v-if="item.label" class="text-paragraph-2 text-white">
                        {{ item.label }}
                    </span>
                </div>
            </div>
        </div>
    </section>
</template>
