// OpenAI (ChatGPT) - API Chat Completions com tools.
import type { HistoryMessage, LlmConversation, LlmProvider, ToolCall, ToolSpec } from "./types.ts";

const API_URL = "https://api.openai.com/v1/chat/completions";

interface OpenAiToolCall {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
}

type OpenAiMessage =
  | { role: "system" | "user"; content: string }
  | { role: "assistant"; content: string | null; tool_calls?: OpenAiToolCall[] }
  | { role: "tool"; tool_call_id: string; content: string };

function parseArgs(raw: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(raw || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function createOpenAiProvider(apiKey: string, model: string): LlmProvider {
  return {
    name: "openai",
    model,
    startConversation({ system, history, tools }) {
      return new OpenAiConversation(apiKey, model, system, history, tools);
    },
  };
}

class OpenAiConversation implements LlmConversation {
  private readonly messages: OpenAiMessage[];

  constructor(
    private readonly apiKey: string,
    private readonly model: string,
    system: string,
    history: HistoryMessage[],
    private readonly tools: ToolSpec[],
  ) {
    this.messages = [
      { role: "system", content: system },
      ...history.map((m) => ({ role: m.role, content: m.content }) as OpenAiMessage),
    ];
  }

  async next() {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: this.messages,
        tools: this.tools.map((tool) => ({ type: "function", function: tool })),
      }),
    });

    if (!res.ok) {
      throw new Error(`OpenAI HTTP ${res.status}: ${await res.text()}`);
    }

    const data = await res.json();
    const message = data.choices?.[0]?.message;
    if (!message) {
      throw new Error(`Resposta vazia da OpenAI: ${JSON.stringify(data)}`);
    }

    this.messages.push({
      role: "assistant",
      content: message.content ?? null,
      ...(message.tool_calls?.length ? { tool_calls: message.tool_calls } : {}),
    });

    const toolCalls: ToolCall[] = (message.tool_calls ?? []).map((call: OpenAiToolCall) => ({
      id: call.id,
      name: call.function.name,
      args: parseArgs(call.function.arguments),
    }));

    return { text: (message.content ?? "").trim(), toolCalls };
  }

  addToolResults(results: { call: ToolCall; result: Record<string, unknown> }[]) {
    for (const { call, result } of results) {
      this.messages.push({
        role: "tool",
        tool_call_id: call.id,
        content: JSON.stringify(result),
      });
    }
  }
}
