import { MAX_TOOL_ROUNDS } from "./config.ts";
import type { HistoryMessage, LlmProvider } from "./llm/types.ts";
import { buildSystemPrompt } from "./prompt.ts";
import { runTool, type ToolContext, toolSpecs } from "./tools.ts";

const FALLBACK_EMPTY = "Desculpe, não consegui processar sua mensagem. Pode repetir?";
const FALLBACK_LOOP = "Desculpe, tive um problema para concluir essa ação. Pode tentar novamente?";

/**
 * Ciclo do agente: chama o modelo, executa as ferramentas que ele pedir,
 * devolve os resultados e repete até receber uma resposta em texto.
 * Funciona igual para qualquer provedor (Gemini, OpenAI, Claude).
 */
export async function runAgent(
  provider: LlmProvider,
  ctx: ToolContext,
  history: HistoryMessage[],
): Promise<string> {
  // Os horários já oferecidos vão no prompt: o histórico só guarda o texto das respostas,
  // então sem isso o modelo perderia o valor exato (ISO) de cada horário.
  const offeredSlots = await ctx.repo.getOfferedSlots(ctx.sessionUuid);

  const conversation = provider.startConversation({
    system: buildSystemPrompt(new Date(), offeredSlots),
    history,
    tools: toolSpecs,
  });

  for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
    const turn = await conversation.next();

    if (!turn.toolCalls.length) {
      return turn.text || FALLBACK_EMPTY;
    }

    const results = [];
    for (const call of turn.toolCalls) {
      console.log(`[${provider.name}] ferramenta ${call.name}:`, call.args);
      results.push({ call, result: await runTool(ctx, call.name, call.args) });
    }

    conversation.addToolResults(results);
  }

  return FALLBACK_LOOP;
}
