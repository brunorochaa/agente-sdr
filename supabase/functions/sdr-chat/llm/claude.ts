// Anthropic Claude - Messages API com tool use, via SDK oficial.
import Anthropic from "@anthropic-ai/sdk";
import type { HistoryMessage, LlmConversation, LlmProvider, ToolCall, ToolSpec } from "./types.ts";

const MAX_TOKENS = 16000;
const REFUSAL_MESSAGE =
  "Desculpe, não posso ajudar com isso. Posso ajudar com algo sobre o ERP360?";

export function createClaudeProvider(apiKey: string, model: string): LlmProvider {
  return {
    name: "claude",
    model,
    startConversation({ system, history, tools }) {
      // O cliente é criado por conversa para usar o fetch atual (facilita testes).
      const client = new Anthropic({ apiKey, fetch: (...args) => fetch(...args) });
      return new ClaudeConversation(client, model, system, history, tools);
    },
  };
}

class ClaudeConversation implements LlmConversation {
  private readonly messages: Anthropic.Beta.BetaMessageParam[];
  private readonly tools: Anthropic.Beta.BetaTool[];

  constructor(
    private readonly client: Anthropic,
    private readonly model: string,
    private readonly system: string,
    history: HistoryMessage[],
    tools: ToolSpec[],
  ) {
    // A conversa precisa começar com o usuário (a saudação inicial é descartada).
    const firstUser = history.findIndex((m) => m.role === "user");
    this.messages = history
      .slice(Math.max(firstUser, 0))
      .map((m) => ({ role: m.role, content: m.content }));

    this.tools = tools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      input_schema: tool.parameters,
    }));
  }

  async next() {
    const response = await this.client.beta.messages.create({
      // Se o modelo recusar por engano, a API repete em um modelo substituto.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      model: this.model,
      max_tokens: MAX_TOKENS,
      system: this.system,
      tools: this.tools,
      messages: this.messages,
    });

    if (response.stop_reason === "refusal") {
      return { text: REFUSAL_MESSAGE, toolCalls: [] };
    }

    // Devolve o conteúdo completo (inclui blocos de raciocínio que devem ser reenviados).
    this.messages.push({ role: "assistant", content: response.content });

    const toolCalls: ToolCall[] = response.content
      .filter((block): block is Anthropic.Beta.BetaToolUseBlock => block.type === "tool_use")
      .map((block) => ({
        id: block.id,
        name: block.name,
        args: (block.input ?? {}) as Record<string, unknown>,
      }));

    const text = response.content
      .filter((block): block is Anthropic.Beta.BetaTextBlock => block.type === "text")
      .map((block) => block.text)
      .join("")
      .trim();

    return { text, toolCalls };
  }

  addToolResults(results: { call: ToolCall; result: Record<string, unknown> }[]) {
    // Todos os resultados vão numa única mensagem do usuário.
    this.messages.push({
      role: "user",
      content: results.map(({ call, result }) => ({
        type: "tool_result" as const,
        tool_use_id: call.id,
        content: JSON.stringify(result),
        ...(result.ok === false ? { is_error: true } : {}),
      })),
    });
  }
}
