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

/** Texto do campo de mensagem, usado como default pelo composer e pelo input. */
export const CHAT_PLACEHOLDER = "Fale com nossa IA...";

/** Tipos aceitos em cada picker do menu de anexos, espelhando a base anterior. */
export const CHAT_DOC_ACCEPT =
	".pdf,.doc,.docx,.txt,.csv,.xls,.xlsx,.ppt,.pptx";

export const CHAT_IMAGE_ACCEPT = "image/*";
