<script setup>
import { computed } from "vue";
import ChatGenerativeToolShell from "@/components/ChatGenerative/ChatGenerativeToolShell.vue";
import ChatGenericChart from "@/components/ChatGenerative/charts/ChatGenericChart.vue";

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

const SUPPORTED_TYPES = ["line", "area", "bar", "pie", "donut"];

const payload = computed(() => normalizeGraphicOutput(props.output));

const title = computed(() => payload.value?.title ?? "Gráfico");

// O erro é exibido no corpo do card; não repetir na descrição do cabeçalho.
const description = computed(() =>
	payload.value?.error ? "" : (payload.value?.subtitle ?? ""),
);

/**
 * Normaliza o output de `render_xy_graphic`/`render_pizza_graphic`
 * (`{ series, options, value_format, currency, source, disclaimer }`, já no
 * formato nativo do ApexCharts). Descarta payloads sem série/labels
 * plotáveis — a UI cai no aviso em vez de renderizar um gráfico vazio.
 */
function normalizeGraphicOutput(output) {
	if (!output || typeof output !== "object" || Array.isArray(output)) {
		return null;
	}

	if (output.error) {
		return { error: String(output.error) };
	}

	const options = output.options;
	const rawType = options?.chart?.type;
	const type = SUPPORTED_TYPES.includes(rawType) ? rawType : "bar";
	const isCircular = ["pie", "donut"].includes(type);

	const rawLabels = isCircular ? options?.labels : options?.xaxis?.categories;
	const labels = Array.isArray(rawLabels) ? rawLabels.map(String) : [];
	const series = Array.isArray(output.series) ? output.series : [];

	if (!labels.length || !series.length) return null;

	return {
		type,
		title: options?.title?.text ?? "Gráfico",
		subtitle: options?.subtitle?.text ?? "",
		labels,
		series,
		xType: options?.xaxis?.type === "datetime" ? "datetime" : "category",
		valueFormat: output.value_format ?? "number",
		currency: output.currency ?? "BRL",
		disclaimer: output.source === "model" ? (output.disclaimer ?? "") : "",
	};
}
</script>

<template>
	<ChatGenerativeToolShell :title="title" :description="description">
		<div
			v-if="payload && !payload.error"
			class="mt-3 flex w-full min-w-0 flex-col gap-2"
		>
			<ChatGenericChart
				:type="payload.type"
				:labels="payload.labels"
				:series="payload.series"
				:x-type="payload.xType"
				:value-format="payload.valueFormat"
				:currency="payload.currency"
			/>

			<p v-if="payload.disclaimer" class="text-paragraph-1 text-white/45">
				{{ payload.disclaimer }}
			</p>
		</div>

		<p
			v-else-if="payload?.error"
			class="mt-2 text-paragraph-3 text-destructive"
		>
			{{ payload.error }}
		</p>

		<p v-else class="mt-2 text-paragraph-3 text-white/55">
			Não foi possível exibir o gráfico.
		</p>
	</ChatGenerativeToolShell>
</template>
