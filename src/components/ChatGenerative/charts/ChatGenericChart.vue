<script setup>
import { cn } from "@lib/utils";
import { computed } from "vue";
import VueApexCharts from "vue3-apexcharts";
import {
	AXIS_LABEL_STYLE,
	baseChartOptions,
	CATEGORICAL_COLORS,
	CHART_SURFACE,
	formatValue,
	GRID_COLOR,
	SERIES_COLOR,
} from "@/components/ChatGenerative/charts/chartTheme.js";

defineOptions({ inheritAttrs: false });

const props = defineProps({
	type: {
		type: String,
		default: "bar",
	},
	labels: {
		type: Array,
		default: () => [],
	},
	series: {
		type: Array,
		default: () => [],
	},
	xType: {
		type: String,
		default: "category",
	},
	valueFormat: {
		type: String,
		default: "number",
	},
	currency: {
		type: String,
		default: "BRL",
	},
	class: {
		type: String,
		default: "",
	},
});

// Em pie/donut cada fatia é uma identidade e o Apex espera um array plano.
const isCircular = computed(() => ["pie", "donut"].includes(props.type));

const isDatetime = computed(
	() => props.xType === "datetime" && !isCircular.value,
);

const format = (value) => formatValue(value, props.valueFormat, props.currency);

// O backend já manda series prontas (nºs crus pra pizza, [{name,data}] pra xy)
// alinhadas por índice com `labels` — não há mais transformação a fazer aqui.
const chartSeries = computed(() => props.series);

const chartOptions = computed(() => {
	const base = baseChartOptions();
	base.chart.type = props.type;

	if (isCircular.value) {
		return {
			...base,
			labels: props.labels,
			colors: CATEGORICAL_COLORS.slice(0, props.labels.length),
			// Vão de 2px na cor da superfície separa as fatias — encoding
			// secundário exigido pela margem apertada de daltonismo.
			stroke: { width: 2, colors: [CHART_SURFACE] },
			legend: { ...base.legend, position: "bottom" },
			dataLabels: {
				enabled: true,
				style: { fontSize: "11px", fontWeight: 500 },
				dropShadow: { enabled: false },
			},
			tooltip: { ...base.tooltip, y: { formatter: format } },
			plotOptions: {
				pie: {
					donut: { size: props.type === "donut" ? "62%" : "0%" },
					expandOnClick: false,
				},
			},
		};
	}

	const isBar = props.type === "bar";

	// O Apex não tolera chaves presentes com valor `undefined` (chama .slice()
	// em xaxis.categories e quebra o render inteiro) — só montamos o que vale.
	const xaxis = {
		type: isDatetime.value ? "datetime" : "category",
		categories: props.labels,
		labels: {
			style: AXIS_LABEL_STYLE,
			trim: true,
			hideOverlappingLabels: true,
		},
		axisBorder: { show: false },
		axisTicks: { show: false },
		tooltip: { enabled: false },
	};
	if (isDatetime.value && props.labels.length <= 12) {
		// Sem isso o Apex escolhe ticks arbitrários no intervalo (ex.: "08 Jan",
		// "22 Jan") que não correspondem a nenhum ponto medido.
		xaxis.tickAmount = props.labels.length - 1;
	}

	const tooltip = { ...base.tooltip, y: { formatter: format } };
	if (isDatetime.value) tooltip.x = { format: "dd MMM yyyy" };

	return {
		...base,
		colors: [SERIES_COLOR],
		// Série única: o título já nomeia o que está plotado.
		legend: { ...base.legend, show: false },
		stroke: isBar
			? { width: 0 }
			: {
					// Curva suave inventa forma entre pontos: só com serie densa.
					curve: props.labels.length > 24 ? "smooth" : "straight",
					width: 2,
					lineCap: "round",
					colors: [SERIES_COLOR],
				},
		fill:
			props.type === "area"
				? {
						// Lavagem leve, nunca bloco saturado.
						type: "gradient",
						gradient: {
							shadeIntensity: 1,
							opacityFrom: 0.22,
							opacityTo: 0.02,
							stops: [0, 100],
						},
					}
				: { type: "solid", opacity: 1 },
		plotOptions: {
			bar: {
				borderRadius: 4,
				borderRadiusApplication: "end",
				// Numero sem "%" = largura absoluta em px (Helpers.js:151).
				// Barra fina: o resto da faixa fica de ar.
				columnWidth: 24,
				dataLabels: { position: "top" },
			},
		},
		// Rótulo direto só quando cabe; nunca um número em cada ponto de linha.
		dataLabels: {
			enabled: isBar && props.labels.length <= 8,
			formatter: format,
			offsetY: -18,
			style: { fontSize: "11px", colors: ["rgba(255,255,255,0.65)"] },
		},
		grid: {
			borderColor: GRID_COLOR,
			// Linha de grade sólida e recessiva — tracejado compete com o dado.
			strokeDashArray: 0,
			padding: { left: 8, right: 8, top: isBar ? 16 : 0 },
		},
		xaxis,
		yaxis: {
			labels: { style: AXIS_LABEL_STYLE, formatter: format },
		},
		// Ponto visível marca onde existe dado de verdade; sem ele, a linha
		// sugere valores intermediários que não foram medidos. Anel de 2px na
		// cor da superfície mantém o ponto legível sobre a linha.
		markers: {
			size: props.labels.length <= 24 ? 4 : 0,
			strokeWidth: 2,
			strokeColors: CHART_SURFACE,
			hover: { size: 6 },
		},
		tooltip,
	};
});
</script>

<template>
	<div :class="cn('w-full min-w-0', props.class)">
		<VueApexCharts
			:type="type"
			:height="isCircular ? 300 : 260"
			width="100%"
			:options="chartOptions"
			:series="chartSeries"
		/>
	</div>
</template>
