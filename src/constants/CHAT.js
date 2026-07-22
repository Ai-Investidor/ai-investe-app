/**
 * Largura da coluna central do chat, compartilhada entre a home (ViewChat) e a
 * conversa (ViewChatConversation) para que o composer fique alinhado com as
 * mensagens nas duas telas.
 *
 * Desktop-first (RULES.md#R8): a base é a largura de desktop e `max-md:` adapta
 * para telas menores.
 */
export const CHAT_COLUMN_CLASS =
	"w-[clamp(541px,65%,720px)] min-w-0 max-w-full mx-auto max-md:w-full";
