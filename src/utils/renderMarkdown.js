import DOMPurify from "dompurify";
import MarkdownIt from "markdown-it";

const md = new MarkdownIt({ linkify: true, breaks: true });

const defaultFence =
	md.renderer.rules.fence ??
	((tokens, idx, options, _env, self) =>
		self.renderToken(tokens, idx, options));

md.renderer.rules.fence = (tokens, idx, options, env, self) => {
	const token = tokens[idx];
	const lang = (token.info ?? "").trim().split(/\s+/)[0]?.toLowerCase();

	if (lang === "mermaid") {
		const source = token.content.trimEnd();
		return `<pre class="mermaid">${md.utils.escapeHtml(source)}</pre>\n`;
	}

	return defaultFence(tokens, idx, options, env, self);
};

const sanitizeConfig = {
	ADD_TAGS: ["pre"],
	ADD_ATTR: ["class"],
};

/** Converte markdown (ex.: resposta do agente de IA) em HTML seguro para `v-html`. */
export function renderMarkdown(text) {
	return DOMPurify.sanitize(md.render(text ?? ""), sanitizeConfig);
}
