// Respostas simuladas no formato de cada provedor de IA.

export interface ScriptedTurn {
  text?: string;
  call?: { name: string; args: Record<string, unknown> };
}

let counter = 0;

export function geminiReply(turn: ScriptedTurn) {
  const parts = turn.call
    ? [{ functionCall: { name: turn.call.name, args: turn.call.args }, thoughtSignature: "sig" }]
    : [{ text: turn.text ?? "" }];
  return { candidates: [{ content: { role: "model", parts } }] };
}

export function openAiReply(turn: ScriptedTurn) {
  const message = turn.call
    ? {
      role: "assistant",
      content: null,
      tool_calls: [{
        id: `call_${++counter}`,
        type: "function",
        function: { name: turn.call.name, arguments: JSON.stringify(turn.call.args) },
      }],
    }
    : { role: "assistant", content: turn.text ?? "" };
  return { choices: [{ index: 0, message, finish_reason: turn.call ? "tool_calls" : "stop" }] };
}

export function claudeReply(turn: ScriptedTurn) {
  const content = turn.call
    ? [{ type: "tool_use", id: `toolu_${++counter}`, name: turn.call.name, input: turn.call.args }]
    : [{ type: "text", text: turn.text ?? "" }];
  return {
    id: `msg_${++counter}`,
    type: "message",
    role: "assistant",
    model: "claude-sonnet-5-5",
    content,
    stop_reason: turn.call ? "tool_use" : "end_turn",
    stop_sequence: null,
    usage: { input_tokens: 10, output_tokens: 10 },
  };
}

export const PROVIDERS = [
  {
    name: "gemini",
    env: { LLM_PROVIDER: "gemini", GEMINI_API_KEY: "test-gemini" },
    url: "generativelanguage.googleapis.com",
    reply: geminiReply,
  },
  {
    name: "openai",
    env: { LLM_PROVIDER: "openai", OPENAI_API_KEY: "test-openai" },
    url: "api.openai.com",
    reply: openAiReply,
  },
  {
    name: "claude",
    env: { LLM_PROVIDER: "claude", ANTHROPIC_API_KEY: "test-claude" },
    url: "api.anthropic.com",
    reply: claudeReply,
  },
] as const;
