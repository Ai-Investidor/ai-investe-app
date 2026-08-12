import { getToolName } from "@utils/chatMessageParts.js";
import FetchPriceHistoryTool from "@/components/ChatGenerative/tools/FetchPriceHistoryTool.vue";
import RenderGraphicTool from "@/components/ChatGenerative/tools/RenderGraphicTool.vue";

export const CHAT_GENERATIVE_TOOLS = {
	fetch_price_history: FetchPriceHistoryTool,
	render_xy_graphic: RenderGraphicTool,
	render_pizza_graphic: RenderGraphicTool,
};

export function resolveGenerativeToolComponent(part) {
	const name = getToolName(part);
	return CHAT_GENERATIVE_TOOLS[name] ?? null;
}
