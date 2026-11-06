import { assertEquals, assertThrows } from "@std/assert";
import { toGeminiContents } from "../sdr-chat/llm/gemini.ts";
import { providerFromEnv } from "../sdr-chat/llm/index.ts";

function env(values: Record<string, string>) {
  return (key: string) => values[key];
}

Deno.test("usa Gemini por padrão", () => {
  const provider = providerFromEnv(env({ GEMINI_API_KEY: "k" }));
  assertEquals(provider.name, "gemini");
  assertEquals(provider.model, "gemini-2.5-flash");
});

Deno.test("escolhe o provedor e o modelo pelas variáveis", () => {
  assertEquals(
    providerFromEnv(env({ LLM_PROVIDER: "openai", OPENAI_API_KEY: "k" })).name,
    "openai",
  );
  assertEquals(
    providerFromEnv(env({ LLM_PROVIDER: "Claude", ANTHROPIC_API_KEY: "k" })).model,
    "claude-sonnet-5-5",
  );
  assertEquals(
    providerFromEnv(
      env({ LLM_PROVIDER: "claude", ANTHROPIC_API_KEY: "k", CLAUDE_MODEL: "claude-haiku-5-5" }),
    ).model,
    "claude-haiku-5-5",
  );
});

Deno.test("explica o erro quando falta configuração", () => {
  assertThrows(
    () => providerFromEnv(env({ LLM_PROVIDER: "llama" })),
    Error,
    "LLM_PROVIDER inválido",
  );
  assertThrows(
    () => providerFromEnv(env({ LLM_PROVIDER: "claude" })),
    Error,
    "ANTHROPIC_API_KEY não configurado",
  );
});

Deno.test("Gemini: junta mensagens seguidas e começa pelo usuário", () => {
  const contents = toGeminiContents([
    { role: "assistant", content: "Olá!" },
    { role: "user", content: "Oi" },
    { role: "user", content: "Tudo bem?" },
    { role: "assistant", content: "Tudo!" },
  ]);

  assertEquals(contents.map((c) => c.role), ["user", "model"]);
  assertEquals(contents[0].parts.length, 2);
});
