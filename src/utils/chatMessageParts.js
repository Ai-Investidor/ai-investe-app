const TOOL_LABELS = {
	fetch_price_history: "Consultando histórico de preços",
	render_xy_graphic: "Montando gráfico",
	render_pizza_graphic: "Montando gráfico",
};

export function isToolPart(part) {
	if (!part?.type) return false;
	return part.type === "dynamic-tool" || part.type.startsWith("tool-");
}

export function getToolName(part) {
	if (part.type === "dynamic-tool") return part.toolName;
	if (part.type?.startsWith("tool-")) return part.type.slice(5);
	return "ferramenta";
}

export function getToolLabel(part) {
	const name = getToolName(part);
	return TOOL_LABELS[name] ?? formatToolName(name);
}

function formatToolName(name) {
	return name
		.replaceAll("_", " ")
		.replace(/\b\w/g, (char) => char.toUpperCase());
}

export function getToolStatus(part) {
	if (part.state === "output-available") return "done";
	if (part.state === "output-error" || part.errorText) return "error";
	if (
		part.state === "input-streaming" ||
		part.state === "input-available" ||
		part.state === "approval-requested"
	) {
		return "running";
	}
	return "done";
}

export function getMessageText(message) {
	return (
		message?.parts
			?.filter((part) => part.type === "text")
			.map((part) => part.text)
			.join("") ?? ""
	);
}

export function getMessageReasoning(message) {
	const parts =
		message?.parts?.filter((part) => part.type === "reasoning") ?? [];

	if (!parts.length) {
		return { text: "", state: undefined };
	}

	return {
		text: parts.map((part) => part.text).join(""),
		state: parts.some((part) => part.state === "streaming")
			? "streaming"
			: parts.at(-1)?.state,
	};
}

export function getMessageSources(message) {
	const fromParts =
		message?.parts
			?.filter((part) => part.type === "source-url")
			.map((part) => ({
				id: part.sourceId,
				url: part.url,
				title: part.title ?? part.url,
			})) ?? [];

	if (fromParts.length) return dedupeSources(fromParts);

	return parseLegacyNews(message?.metadata?.news);
}

export function buildToolStatusItem(part) {
	return {
		id: part.toolCallId ?? part.type,
		name: getToolName(part),
		label: getToolLabel(part),
		status: getToolStatus(part),
	};
}

export function getMessageTools(message) {
	return message?.parts?.filter(isToolPart).map(buildToolStatusItem) ?? [];
}

export function isLastTextPart(parts, index) {
	if (!parts?.length || parts[index]?.type !== "text") return false;

	for (let i = parts.length - 1; i >= 0; i--) {
		if (parts[i].type === "text") return i === index;
	}

	return false;
}

export function parseToolOutput(output) {
	if (output == null) return null;

	if (typeof output === "string") {
		const trimmed = output.trim();
		if (!trimmed) return null;

		try {
			return JSON.parse(trimmed);
		} catch {
			return output;
		}
	}

	return output;
}

export function hasToolOutput(part) {
	if (part?.state !== "output-available") return false;

	const parsed = parseToolOutput(part.output);
	return parsed != null && parsed !== "";
}

export function hasAssistantVisibleContent(message) {
	if (!message || message.role !== "assistant") return false;

	const text = getMessageText(message).trim();
	if (text.length > 0) return true;

	const reasoning = getMessageReasoning(message);
	if (reasoning.text.trim().length > 0) return true;

	if (getMessageSources(message).length > 0) return true;
	if (getMessageTools(message).length > 0) return true;

	return false;
}

export function parseLegacyNews(news) {
	if (!news || typeof news !== "string") return [];

	return news
		.split(",")
		.map((item) => item.trim())
		.filter(Boolean)
		.map((item, index) => {
			const separatorIndex = item.lastIndexOf(" - ");
			if (separatorIndex === -1) {
				return { id: `legacy-${index}`, title: item };
			}

			return {
				id: `legacy-${index}`,
				title: item.slice(0, separatorIndex).trim(),
				source: item.slice(separatorIndex + 3).trim(),
			};
		});
}

export function getSourceHostname(url) {
	if (!url) return "";

	try {
		return new URL(url).hostname.replace(/^www\./, "");
	} catch {
		return url;
	}
}

function dedupeSources(sources) {
	const seen = new Set();

	return sources.filter((source) => {
		const key = source.url ?? source.title;
		if (seen.has(key)) return false;
		seen.add(key);
		return true;
	});
}
