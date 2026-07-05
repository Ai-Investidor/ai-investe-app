<script setup>
import { ref } from "vue";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
} from "@components/input-group";
import { useChat } from "@composables/useChat";
import ChatCircleDots from "@/components/icons/ChatCircleDots.vue";
import FontStyle from "@/components/icons/FontStyle.vue";
import Loop from "@/components/icons/Loop.vue";
import MaskOn from "@/components/icons/MaskOn.vue";
import SuggestionCard from "@/components/SuggestionCard/SuggestionCard.vue";

const { sendMessage, isSending } = useChat();

const inputText = ref("");

function handleSubmit() {
	sendMessage(inputText.value);
	inputText.value = "";
}

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
  <section class="relative z-10 flex flex-col items-center justify-center my-auto gap-[25px] px-6 py-12 max-md:gap-4 max-md:py-8">
    <!-- Hero title -->
    <div class="text-center">
      <h1 class="text-headline-1 text-white whitespace-normal">
        Como posso te
        <span class="text-headline-1-strong text-primary [text-shadow:0_0_24px_var(--color-primary)]">ajudar</span>
        hoje?
      </h1>
    </div>

    <!-- Subtitle -->
    <p class="text-paragraph-1 text-white/75 text-center max-w-[clamp(541px,65%,720px)]">
      Sou seu assistente especializado em análise financeira e investimentos. Posso ajudar com análise de ativos, tendências de mercado e estratégias de investimento
    </p>

    <!-- Suggestion cards grid -->
    <div class="grid grid-cols-2 max-md:grid-cols-1 gap-5 w-[clamp(541px,65%,720px)] max-md:w-full">
      <SuggestionCard
        v-for="suggestion in suggestions"
        :key="suggestion.id"
        :icon="suggestion.icon"
        :title="suggestion.title"
        :description="suggestion.description"
        @click="sendMessage(suggestion.description)"
      />
    </div>

    <!-- Input with button -->
    <InputGroup
      class="gap-2 w-[clamp(541px,65%,720px)] max-md:w-full h-auto bg-app-bg border-input-border rounded-lg px-6 py-2 has-[[data-slot=input-group-control]:focus-visible]:ring-0 has-[[data-slot=input-group-control]:focus-visible]:border-input-border"
    >
      <InputGroupInput
        v-model="inputText"
        type="text"
        placeholder="Fale com nossa IA..."
        class="text-paragraph-3 text-white/55 placeholder:text-white/55"
        :disabled="isSending"
        @keydown.enter="handleSubmit"
      />
      <InputGroupAddon align="inline-end" class="pr-0">
        <InputGroupButton
          size="sm"
          class="bg-btn-light hover:bg-btn-light/90 hover:text-black text-black rounded-lg px-3 py-1.5 text-paragraph-4 h-auto"
          :disabled="isSending"
          @click="handleSubmit"
        >
          ?
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>

    <!-- Disclaimer -->
    <p class="text-paragraph-1 text-white/25 text-center text-nowrap tracking-ui">
      AI invest é uma IA e pode cometer erros pode cometer erros.
    </p>
  </section>
</template>
