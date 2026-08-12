/**
 * Tema compartilhado dos gráficos da UI generativa do chat.
 *
 * Duas famílias de cor, com trabalhos diferentes:
 *
 * - `SERIES_COLOR` (lime da marca) — usado quando o gráfico tem UMA série
 *   (line, area, bar). Aqui a cor não separa identidades, só marca a leitura
 *   como "nossa"; o único gate que importa é contraste, e ela dá ~17:1 sobre
 *   a superfície quase preta do chat.
 * - `CATEGORICAL_COLORS` — usado em pie/donut, onde cada fatia é uma
 *   identidade distinta e a cor precisa separar. É a paleta de referência
 *   validada (banda de luminosidade, piso de croma, separação para daltonismo
 *   e contraste, todos aprovados sobre a superfície #0a0a0a). O lime fica de
 *   fora dela de propósito: L≈0.95 estoura a banda e uma fatia gritaria sobre
 *   as outras.
 *
 * A ordem dos slots é o mecanismo de segurança para daltonismo — atribuir
 * sempre em ordem fixa, nunca ciclar. Acima de 8 categorias o backend já
 * recusa (limite de 12 fatias com agregação em "Outros").
 */

export const SERIES_COLOR = "#e1ff06"; // = var(--primary) em src/assets/base.css

export const CATEGORICAL_COLORS = [
	"#3987e5", // azul
	"#d95926", // laranja
	"#199e70", // água
	"#c98500", // amarelo
	"#d55181", // magenta
	"#008300", // verde
	"#9085e9", // violeta
	"#e66767", // vermelho
];

/** Superfície do card do gráfico — usada nos vãos de 2px entre marcas. */
export const CHART_SURFACE = "#0a0a0a";

export const AXIS_LABEL_STYLE = {
	colors: "rgba(255,255,255,0.45)",
	fontSize: "11px",
};

export const GRID_COLOR = "rgba(255,255,255,0.08)";

const FONT_FAMILY = "Inter, system-ui, sans-serif";

/** Opções comuns a todos os tipos — o que não muda entre line/bar/pie. */
export function baseChartOptions() {
	return {
		chart: {
			toolbar: { show: false },
			zoom: { enabled: false },
			fontFamily: FONT_FAMILY,
			background: "transparent",
			animations: { enabled: true, easing: "easeinout", speed: 500 },
		},
		theme: { mode: "dark" },
		tooltip: { theme: "dark" },
		legend: {
			labels: { colors: "rgba(255,255,255,0.65)" },
			fontSize: "12px",
			markers: { width: 10, height: 10, radius: 3 },
		},
	};
}

/**
 * Formata um valor conforme o `value_format` vindo do backend.
 * Mantém pt-BR em todos os casos.
 */
export function formatValue(value, valueFormat, currency = "BRL") {
	if (value == null || Number.isNaN(Number(value))) return "—";

	const number = Number(value);

	if (valueFormat === "percent") {
		return `${number.toLocaleString("pt-BR", {
			minimumFractionDigits: 0,
			maximumFractionDigits: 2,
		})}%`;
	}

	if (valueFormat === "currency") {
		return new Intl.NumberFormat("pt-BR", {
			style: "currency",
			currency: currency || "BRL",
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(number);
	}

	return number.toLocaleString("pt-BR", {
		minimumFractionDigits: 0,
		maximumFractionDigits: 2,
	});
}
