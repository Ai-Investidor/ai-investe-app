<script setup>
import MaskOn from "@/components/icons/MaskOn.vue";

// Items da lista com ícone — estrutura inline na seção, conforme R4b-extract
const brandingItems = [
    { id: 1, label: "Análise de ativos" },
    { id: 2, label: "Carteiras personalizadas" }, // item vazio, conforme manifesto (texto = espaço em branco no Figma)
    { id: 3, label: "Insights e alertas do mercado" },
];
</script>

<template>
    <!-- Split full-bleed: painel escuro à esquerda com conteúdo + retângulo primary à direita (absolute) -->
    <section
        class="relative flex items-center w-full min-h-screen max-w-[var(--auth-content-width)] max-md:max-w-none"
    >
        <!-- Painel esquerdo com conteúdo -->
        <div
            class="flex flex-col gap-layout-gap items-start justify-center pl-nav-offset py-10 w-full h-full max-w-[650px] max-lg:max-w-none max-lg:pr-6"
        >
            <!-- Headline: "Inteligência artificial para seus investimentos" com "artificial" em primary -->
            <h1 class="text-auth-hero text-white">
                Inteligência
                <span
                    class="text-auth-hero-strong text-primary [text-shadow:0_0_24px_var(--color-primary)]"
                    >artificial</span
                >
                para seus investimentos
            </h1>

            <!-- Subtexto -->
            <p class="text-auth-subheading text-white/75 max-w-[400px]">
                Tome decisões mais inteligentes com análises em tempo real,
                carteiras personalizadas e insights do mercado global.
            </p>

            <!-- Lista de 3 itens com ícone mask-on (v-for inline) -->
            <div class="flex flex-wrap gap-8 max-w-[43rem] max-lg:max-w-full">
                <div
                    v-for="item in brandingItems"
                    :key="item.id"
                    class="flex gap-2 items-center"
                >
                    <!-- Ícone MaskOn reutilizável (src/components/icons/MaskOn.vue) -->
                    <MaskOn
                        class="w-4 h-4 text-primary flex-shrink-0"
                        aria-hidden="true"
                    />
                    <!-- Label: vazio no 2º item, label real nos outros -->
                    <span v-if="item.label" class="text-paragraph-2 text-white">
                        {{ item.label }}
                    </span>
                </div>
            </div>
        </div>
    </section>
</template>
