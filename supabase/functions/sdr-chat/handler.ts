import { corsHeaders, json } from "../_shared/http.ts";
import { runAgent } from "./agent.ts";
import { MAX_MESSAGE_LENGTH, SESSION_ID_PATTERN } from "./config.ts";
import type { Repository } from "./db.ts";
import type { LlmProvider } from "./llm/types.ts";
import { WELCOME_MESSAGE } from "./prompt.ts";

export interface HandlerDeps {
  repo: () => Repository;
  provider: () => LlmProvider;
}

/**
 * Rota HTTP do chat. As dependências (banco e IA) são injetadas,
 * o que permite testar o fluxo inteiro sem rede.
 */
export function createHandler(deps: HandlerDeps) {
  return async (req: Request): Promise<Response> => {
    if (req.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }
    if (req.method !== "POST") {
      return json({ error: "Método não permitido" }, 405);
    }

    try {
      const body = await req.json().catch(() => ({}));

      const sessionId = String(body.sessionId ?? "");
      if (!SESSION_ID_PATTERN.test(sessionId)) {
        return json({ error: "sessionId inválido" }, 400);
      }

      const repo = deps.repo();

      if (body.action === "history") {
        const sessionUuid = await repo.findSession(sessionId);
        const history = sessionUuid ? await repo.loadHistory(sessionUuid) : [];
        return json({ messages: [{ role: "assistant", content: WELCOME_MESSAGE }, ...history] });
      }

      const message = String(body.message ?? "").trim();
      if (!message) {
        return json({ error: "Mensagem vazia" }, 400);
      }
      if (message.length > MAX_MESSAGE_LENGTH) {
        return json({ error: "Mensagem muito longa" }, 400);
      }

      const sessionUuid = await repo.getOrCreateSession(sessionId);
      await repo.saveMessage(sessionUuid, "user", message);

      const history = await repo.loadHistory(sessionUuid);
      const response = await runAgent(deps.provider(), { repo, sessionUuid }, history);

      await repo.saveMessage(sessionUuid, "assistant", response);
      return json({ response });
    } catch (error) {
      // Detalhes ficam no log das Edge Functions; o navegador recebe só uma mensagem genérica.
      console.error("Erro no chat SDR:", error);
      return json({ error: "Erro interno ao processar a mensagem. Tente novamente." }, 500);
    }
  };
}
