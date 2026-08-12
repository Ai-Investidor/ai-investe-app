<script setup>
import { cn } from "@lib/utils";
import { computed } from "vue";
import VueApexCharts from "vue3-apexcharts";

const props = defineProps({
	points: {
		type: Array,
		default: () => [],
	},
	currency: {
		type: String,
		default: "BRL",
	},
});

const chartSeries = computed(() => [
	{
		name: "Fechamento",
		data: props.points.map((point) => ({
			x: point.date,
			y: point.close,
		})),
	},
]);

const chartOptions = computed(() => ({
	chart: {
		type: "area",
		toolbar: { show: false },
		zoom: { enabled: false },
		fontFamily: "Inter, system-ui, sans-serif",
		background: "transparent",
		animations: {
			enabled: true,
			easing: "easeinout",
			speed: 500,
		},
	},
	theme: { mode: "dark" },
	colors: ["#e1ff06"],
	stroke: {
		curve: "smooth",
		width: 2,
	},
	fill: {
		type: "gradient",
		gradient: {
			shadeIntensity: 1,
			opacityFrom: 0.35,
			opacityTo: 0.02,
			stops: [0, 100],
		},
	},
	grid: {
		borderColor: "rgba(255,255,255,0.08)",
		strokeDashArray: 4,
		padding: { left: 8, right: 8 },
	},
	xaxis: {
		type: "datetime",
		labels: {
			style: {
				colors: "rgba(255,255,255,0.45)",
				fontSize: "11px",
			},
		},
		axisBorder: { show: false },
		axisTicks: { show: false },
	},
	yaxis: {
		labels: {
			style: {
				colors: "rgba(255,255,255,0.45)",
				fontSize: "11px",
			},
			formatter: (value) => formatPrice(value, props.currency),
		},
	},
	tooltip: {
		theme: "dark",
		x: { format: "dd MMM yyyy" },
		y: {
			formatter: (value) => formatPrice(value, props.currency),
		},
	},
	dataLabels: { enabled: false },
	markers: {
		size: 0,
		hover: { size: 4 },
	},
}));

function formatPrice(value, currency) {
	if (value == null || Number.isNaN(Number(value))) return "—";

	return new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: currency || "BRL",
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(Number(value));
}
</script>

<template>
	<div :class="cn('w-full min-w-0', $attrs.class)">
		<VueApexCharts
			type="area"
			height="260"
			width="100%"
			:options="chartOptions"
			:series="chartSeries"
		/>
	</div>
</template>
