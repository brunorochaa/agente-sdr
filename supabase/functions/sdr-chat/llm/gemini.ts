// Google Gemini (API generateContent com function calling).
import type { HistoryMessage, LlmConversation, LlmProvider, ToolCall, ToolSpec } from "./types.ts";

const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

interface GeminiPart {
  text?: string;
  functionCall?: { name: string; args?: Record<string, unknown> };
  functionResponse?: { name: string; response: Record<string, unknown> };
  [key: string]: unknown;
}

interface GeminiContent {
  role: "user" | "model";
  parts: GeminiPart[];
}

/** Converte o histórico para turnos alternados, começando pelo usuário. */
export function toGeminiContents(history: HistoryMessage[]): GeminiContent[] {
  const contents: GeminiContent[] = [];

  for (const message of history) {
    const role = message.role === "assistant" ? "model" : "user";
    const last = contents.at(-1);

    if (last?.role === role) {
      last.parts.push({ text: message.content });
    } else {
      contents.push({ role, parts: [{ text: message.content }] });
    }
  }

  if (contents[0]?.role === "model") {
    contents.shift();
  }

  return contents;
}

export function createGeminiProvider(apiKey: string, model: string): LlmProvider {
  return {
    name: "gemini",
    model,
    startConversation({ system, history, tools }) {
      return new GeminiConversation(apiKey, model, system, toGeminiContents(history), tools);
    },
  };
}

class GeminiConversation implements LlmConversation {
  constructor(
    private readonly apiKey: string,
    private readonly model: string,
    private readonly system: string,
    private readonly contents: GeminiContent[],
    private readonly tools: ToolSpec[],
  ) {}

  async next() {
    const res = await fetch(`${BASE_URL}/${this.model}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": this.apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: this.system }] },
        contents: this.contents,
        tools: [{ functionDeclarations: this.tools }],
        generationConfig: { temperature: 0.7 },
      }),
    });

    if (!res.ok) {
      throw new Error(`Gemini HTTP ${res.status}: ${await res.text()}`);
    }

    const data = await res.json();
    const parts: GeminiPart[] | undefined = data.candidates?.[0]?.content?.parts;
    if (!parts) {
      throw new Error(`Resposta vazia do Gemini: ${JSON.stringify(data)}`);
    }

    // Mantém as partes originais (inclui a thoughtSignature exigida pelos modelos 2.5+).
    this.contents.push({ role: "model", parts });

    const toolCalls: ToolCall[] = parts
      .filter((part) => part.functionCall)
      .map((part, index) => ({
        id: `${part.functionCall!.name}-${index}`,
        name: part.functionCall!.name,
        args: part.functionCall!.args ?? {},
      }));

    return {
      text: parts.map((part) => part.text ?? "").join("").trim(),
      toolCalls,
    };
  }

  addToolResults(results: { call: ToolCall; result: Record<string, unknown> }[]) {
    this.contents.push({
      role: "user",
      parts: results.map(({ call, result }) => ({
        functionResponse: { name: call.name, response: result },
      })),
    });
  }
}
