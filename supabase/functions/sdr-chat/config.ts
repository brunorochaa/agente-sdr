/** Quantas mensagens anteriores da conversa são enviadas ao modelo. */
export const HISTORY_LIMIT = 30;

/** Quantas rodadas de ferramentas o agente pode fazer antes de responder. */
export const MAX_TOOL_ROUNDS = 4;

export const MAX_MESSAGE_LENGTH = 1000;

export const SESSION_ID_PATTERN = /^[A-Za-z0-9_-]{8,100}$/;

/** Limite de mensagens por sessão na última hora (protege os créditos de IA). */
export const MAX_MESSAGES_PER_SESSION_HOUR = 40;

/** Limite global de mensagens por minuto, somando todos os visitantes. */
export const MAX_MESSAGES_GLOBAL_MINUTE = 60;
