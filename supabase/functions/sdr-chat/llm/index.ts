// Escolhe o provedor de IA pela variável LLM_PROVIDER (gemini | openai | claude).
import { createClaudeProvider } from "./claude.ts";
import { createGeminiProvider } from "./gemini.ts";
import { createOpenAiProvider } from "./openai.ts";
import type { LlmProvider } from "./types.ts";

export type ProviderName = "gemini" | "openai" | "claude";

const PROVIDERS: Record<
  ProviderName,
  {
    keyEnv: string;
    modelEnv: string;
    defaultModel: string;
    create: (apiKey: string, model: string) => LlmProvider;
  }
> = {
  gemini: {
    keyEnv: "GEMINI_API_KEY",
    modelEnv: "GEMINI_MODEL",
    defaultModel: "gemini-2.5-flash",
    create: createGeminiProvider,
  },
  openai: {
    keyEnv: "OPENAI_API_KEY",
    modelEnv: "OPENAI_MODEL",
    defaultModel: "gpt-5-mini",
    create: createOpenAiProvider,
  },
  claude: {
    keyEnv: "ANTHROPIC_API_KEY",
    modelEnv: "CLAUDE_MODEL",
    defaultModel: "claude-sonnet-5-5",
    create: createClaudeProvider,
  },
};

export function providerFromEnv(
  env: (key: string) => string | undefined = Deno.env.get,
): LlmProvider {
  const name = (env("LLM_PROVIDER") ?? "gemini").toLowerCase() as ProviderName;
  const config = PROVIDERS[name];
  if (!config) {
    throw new Error(`LLM_PROVIDER inválido: "${name}". Use gemini, openai ou claude.`);
  }

  const apiKey = env(config.keyEnv);
  if (!apiKey) {
    throw new Error(`${config.keyEnv} não configurado (LLM_PROVIDER=${name})`);
  }

  return config.create(apiKey, env(config.modelEnv) || config.defaultModel);
}

export type { LlmProvider } from "./types.ts";
