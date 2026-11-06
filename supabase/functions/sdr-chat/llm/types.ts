// Tipos neutros: o agente conversa com qualquer provedor (Gemini, OpenAI, Claude)
// através destas interfaces. Cada provedor converte para o formato da sua API.

export type ChatRole = "user" | "assistant";

export interface HistoryMessage {
  role: ChatRole;
  content: string;
}

/** Ferramenta descrita em JSON Schema (formato aceito pelos três provedores). */
export interface ToolSpec {
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<string, { type: string; description: string }>;
    required?: string[];
  };
}

export interface ToolCall {
  /** ID da chamada (OpenAI e Claude exigem devolver o mesmo ID no resultado). */
  id: string;
  name: string;
  args: Record<string, unknown>;
}

export type ToolResult = Record<string, unknown>;

export interface ModelTurn {
  text: string;
  toolCalls: ToolCall[];
}

/**
 * Uma conversa em andamento com o modelo. Cada provedor guarda as mensagens
 * no formato nativo da sua API (preservando assinaturas de raciocínio etc.).
 */
export interface LlmConversation {
  /** Envia o estado atual ao modelo e devolve o próximo turno dele. */
  next(): Promise<ModelTurn>;
  /** Registra os resultados das ferramentas pedidas no último turno. */
  addToolResults(results: { call: ToolCall; result: ToolResult }[]): void;
}

export interface LlmProvider {
  readonly name: string;
  readonly model: string;
  startConversation(params: {
    system: string;
    history: HistoryMessage[];
    tools: ToolSpec[];
  }): LlmConversation;
}
