let mermaidModule = null;
let initialized = false;

async function getMermaid() {
	if (!mermaidModule) {
		mermaidModule = await import("mermaid");
	}
	return mermaidModule.default;
}

/** Inicializa Mermaid uma vez (tema escuro alinhado ao app). */
export async function initMermaid() {
	if (initialized) return;

	const mermaid = await getMermaid();
	mermaid.initialize({
		startOnLoad: false,
		theme: "dark",
		securityLevel: "strict",
		suppressErrorRendering: true,
		useMaxWidth: true,
		flowchart: { useMaxWidth: true },
		sequence: { useMaxWidth: true },
		gantt: { useMaxWidth: true },
		journey: { useMaxWidth: true },
		timeline: { useMaxWidth: true },
		xyChart: { useMaxWidth: true },
	});

	initialized = true;
}

/** Renderiza blocos `.mermaid` dentro de um container (ex.: balão de chat). */
export async function renderMermaidIn(container) {
	if (!container) return;

	const nodes = container.querySelectorAll(".mermaid:not([data-processed])");
	if (!nodes.length) return;

	await initMermaid();
	const mermaid = await getMermaid();

	try {
		await mermaid.run({ nodes, suppressErrors: true });
	} catch {
		// suppressErrors cobre a maioria dos casos (bloco incompleto durante stream)
	}
}
