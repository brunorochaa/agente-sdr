// Edge Function principal do webchat.
//
//   POST { sessionId, message }            -> { response }
//   POST { sessionId, action: "history" }  -> { messages }
//
// Organização:
//   handler.ts   rota HTTP (validação e fluxo)
//   agent.ts     ciclo modelo <-> ferramentas
//   tools.ts     ferramentas (lead, horários, agendamento)
//   prompt.ts    instruções do agente
//   db.ts        acesso ao banco
//   llm/         provedores de IA (Gemini, OpenAI, Claude), escolhidos por LLM_PROVIDER

import "@supabase/functions-js/edge-runtime.d.ts";
import { createSupabaseRepository } from "./db.ts";
import { createHandler } from "./handler.ts";
import { providerFromEnv } from "./llm/index.ts";

Deno.serve(
  createHandler({
    repo: () => createSupabaseRepository(),
    provider: () => providerFromEnv(),
  }),
);
