import DOMPurify from "dompurify";
import MarkdownIt from "markdown-it";

const md = new MarkdownIt({ linkify: true, breaks: true });

/** Converte markdown (ex.: resposta do agente de IA) em HTML seguro para `v-html`. */
export function renderMarkdown(text) {
	return DOMPurify.sanitize(md.render(text ?? ""));
}
