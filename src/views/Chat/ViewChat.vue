<script setup>
import { useChat } from "@composables/useChat";
import { CHAT_COLUMN_CLASS } from "@constants/CHAT";
import { ref } from "vue";
import ChatComposer from "@/components/ChatComposer/ChatComposer.vue";
import ChatCircleDots from "@/components/icons/ChatCircleDots.vue";
import FontStyle from "@/components/icons/FontStyle.vue";
import Loop from "@/components/icons/Loop.vue";
import MaskOn from "@/components/icons/MaskOn.vue";
import SuggestionCard from "@/components/SuggestionCard/SuggestionCard.vue";

const { sendMessage, isSending } = useChat();

const inputText = ref("");

function handleSubmit(files) {
	sendMessage(inputText.value, files);
	inputText.value = "";
}

const suggestions = [
	{
		id: 1,
		icon: ChatCircleDots,
		title: "Análise Fundamentalista",
		description: "Faça análise fundamentalista da Apple baseada em notícias",
	},
	{
		id: 2,
		icon: MaskOn,
		title: "Comparação de ETFs",
		description:
			"Compare o desempenho de ETFs de tecnologia nos últimos 5 anos",
	},
	{
		id: 3,
		icon: Loop,
		title: "Diversificação de Portfólio",
		description: "Como posso diversificar um portfólio de R$ 100.000?",
	},
	{
		id: 4,
		icon: FontStyle,
		title: "Análise de Dividend Yield",
		description: "Melhores ações com dividend yield acima de 6%",
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
    <ChatComposer
      v-model="inputText"
      :disabled="isSending"
      :class="CHAT_COLUMN_CLASS"
      @submit="handleSubmit"
    />
  </section>
</template>
