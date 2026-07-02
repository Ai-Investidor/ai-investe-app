<script setup>
import { Button } from "@components/button";
import { Input } from "@components/input";
import ChatCircleDots from "@/components/icons/ChatCircleDots.vue";
import FontStyle from "@/components/icons/FontStyle.vue";
import Loop from "@/components/icons/Loop.vue";
import MaskOn from "@/components/icons/MaskOn.vue";

const suggestions = [
	{
		id: 1,
		icon: ChatCircleDots,
		title: "Análise Fundamentalista",
		description: "faça análise fundamentalista da apple baseada em noticias",
	},
	{
		id: 2,
		icon: MaskOn,
		title: "Análise Fundamentalista",
		description: "faça análise fundamentalista da apple baseada em noticias",
	},
	{
		id: 3,
		icon: Loop,
		title: "Análise Fundamentalista",
		description: "faça análise fundamentalista da apple baseada em noticias",
	},
	{
		id: 4,
		icon: FontStyle,
		title: "Análise Fundamentalista",
		description: "faça análise fundamentalista da apple baseada em noticias",
	},
];
</script>

<template>
  <section class="relative z-10 flex flex-col items-center justify-center gap-[25px] px-6 py-12">
    <!-- Hero title -->
    <div class="text-center">
      <h1 class="text-headline-1 text-white whitespace-normal">
        Como posso te
        <span class="text-headline-1-strong text-primary">ajudar</span>
        hoje?
      </h1>
    </div>

    <!-- Subtitle -->
    <p class="text-paragraph-1 text-white/75 text-center max-w-[541px]">
      Sou seu assistente especializado em análise financeira e investimentos. Posso ajudar com análise de ativos, tendências de mercado e estratégias de investimento
    </p>

    <!-- Suggestion cards grid -->
    <div class="grid grid-cols-2 max-md:grid-cols-1 gap-5 w-[541px] max-md:w-full">
      <button
        v-for="suggestion in suggestions"
        :key="suggestion.id"
        class="group flex flex-col gap-2 items-start p-[15px] rounded-md border border-card-border bg-gradient-to-r from-black to-surface-2 shadow-sm hover:shadow-md transition-shadow cursor-pointer text-left"
      >
        <!-- Icon -->
        <component
          :is="suggestion.icon"
          class="w-4 h-4 text-white flex-shrink-0"
          aria-hidden="true"
        />

        <!-- Card content -->
        <div class="flex flex-col gap-2 flex-1">
          <h3 class="text-paragraph-2 text-white">
            {{ suggestion.title }}
          </h3>
          <p class="text-paragraph-1 text-white/75">
            {{ suggestion.description }}
          </p>
        </div>
      </button>
    </div>

    <!-- Input with button -->
    <div class="flex items-center gap-2 w-[541px] max-md:w-full bg-app-bg border border-input-border rounded-lg px-6 py-2 shadow-xs">
      <Input
        type="text"
        placeholder="Fale com nossa IA..."
        class="flex-1 bg-transparent border-0 text-paragraph-3 text-white/55 placeholder:text-white/55 focus:outline-none focus:ring-0 shadow-none"
      />
      <Button
        class="bg-btn-light hover:bg-btn-light/90 text-black rounded-lg px-3 py-1.5 text-paragraph-4 min-h-auto h-auto"
      >
        ?
      </Button>
    </div>

    <!-- Disclaimer -->
    <p class="text-paragraph-1 text-white/25 text-center text-nowrap tracking-ui">
      AI invest é uma IA e pode cometer erros pode cometer erros.
    </p>
  </section>
</template>
