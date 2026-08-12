<script setup>
import { cn } from "@lib/utils";
import { computed } from "vue";
import ChatGenerativeToolShell from "@/components/ChatGenerative/ChatGenerativeToolShell.vue";
import ChatPriceHistoryChart from "@/components/ChatGenerative/charts/ChatPriceHistoryChart.vue";

const props = defineProps({
	part: {
		type: Object,
		required: true,
	},
	output: {
		type: [Object, Array, String, Number, Boolean],
		default: null,
	},
	input: {
		type: Object,
		default: null,
	},
});

const PERIOD_LABELS = {
	"1mo": "1 mês",
	"3mo": "3 meses",
	"6mo": "6 meses",
	"1y": "1 ano",
	"2y": "2 anos",
	"5y": "5 anos",
};

const payload = computed(() => normalizePriceHistoryOutput(props.output));

const title = computed(() => {
	if (!payload.value || payload.value.error) {
		return "Histórico de preços";
	}

	const ticker = payload.value.ticker ?? "Ativo";
	const period =
		PERIOD_LABELS[payload.value.period] ?? payload.value.period ?? "";

	return period ? `${ticker} · ${period}` : ticker;
});

const description = computed(() => {
	if (payload.value?.error) return payload.value.error;
	if (payload.value?.mock) return "Dados de demonstração";
	return "";
});

const summary = computed(() => payload.value?.summary ?? null);

const changeLabel = computed(() => {
	const change = summary.value?.change_pct;
	if (change == null || Number.isNaN(Number(change))) return null;

	const value = Number(change);
	const prefix = value > 0 ? "+" : "";
	return `${prefix}${value.toLocaleString("pt-BR", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	})}%`;
});

const isPositiveChange = computed(() => {
	const change = summary.value?.change_pct;
	return change != null && Number(change) >= 0;
});

function normalizePriceHistoryOutput(output) {
	if (!output || typeof output !== "object" || Array.isArray(output)) {
		return null;
	}

	if (output.error) {
		return { error: String(output.error) };
	}

	const points = Array.isArray(output.points)
		? output.points
				.filter(
					(point) =>
						point &&
						typeof point === "object" &&
						point.date &&
						point.close != null &&
						!Number.isNaN(Number(point.close)),
				)
				.map((point) => ({
					date: point.date,
					close: Number(point.close),
				}))
		: [];

	if (!points.length) return null;

	return {
		ticker: output.ticker ?? props.input?.ticker ?? null,
		period: output.period ?? props.input?.period ?? null,
		currency: output.currency ?? "BRL",
		mock: Boolean(output.mock),
		points,
		summary: output.summary ?? null,
	};
}

function formatPrice(value, currency = "BRL") {
	if (value == null || Number.isNaN(Number(value))) return "—";

	return new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency,
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(Number(value));
}
</script>

<template>
	<ChatGenerativeToolShell :title="title" :description="description">
		<div
			v-if="payload && !payload.error"
			class="mt-3 flex w-full min-w-0 flex-col gap-3"
		>
			<dl
				v-if="summary"
				class="grid grid-cols-3 gap-2 rounded-md border border-card-border bg-black/35 p-3"
			>
				<div class="min-w-0">
					<dt class="text-paragraph-1 text-white/45">Início</dt>
					<dd class="text-paragraph-3 text-white/80">
						{{ formatPrice(summary.start_close, payload.currency) }}
					</dd>
				</div>
				<div class="min-w-0">
					<dt class="text-paragraph-1 text-white/45">Atual</dt>
					<dd class="text-paragraph-3 text-white/80">
						{{ formatPrice(summary.end_close, payload.currency) }}
					</dd>
				</div>
				<div class="min-w-0">
					<dt class="text-paragraph-1 text-white/45">Variação</dt>
					<dd
						:class="
							cn(
								'text-paragraph-3',
								isPositiveChange
									? 'text-primary'
									: 'text-destructive',
							)
						"
					>
						{{ changeLabel ?? "—" }}
					</dd>
				</div>
			</dl>

			<ChatPriceHistoryChart
				:points="payload.points"
				:currency="payload.currency"
			/>
		</div>

		<p
			v-else-if="payload?.error"
			class="mt-2 text-paragraph-3 text-destructive"
		>
			{{ payload.error }}
		</p>

		<p v-else class="mt-2 text-paragraph-3 text-white/55">
			Não foi possível exibir o histórico de preços.
		</p>
	</ChatGenerativeToolShell>
</template>
