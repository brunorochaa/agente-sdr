import { bookMeeting, DEFAULT_TZ, formatSlot, getAvailableSlots } from "../_shared/calcom.ts";
import { errorMessage } from "../_shared/http.ts";
import { createLeadCard, pipefyConfigured, updateLeadCard } from "../_shared/pipefy.ts";
import type { LeadInput, LeadRow, Repository } from "./db.ts";
import type { ToolResult, ToolSpec } from "./llm/types.ts";

type ToolArgs = Record<string, unknown>;

export interface ToolContext {
  repo: Repository;
  sessionUuid: string;
}

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

/** Ferramentas que o agente pode usar (formato neutro, convertido por cada provedor). */
export const toolSpecs: ToolSpec[] = [
  {
    name: "registrarLead",
    description:
      "Registra ou atualiza o lead no banco e no Pipefy. Use assim que tiver nome e e-mail.",
    parameters: {
      type: "object",
      properties: {
        name: { type: "string", description: "Nome completo do lead" },
        email: { type: "string", description: "E-mail do lead" },
        company: { type: "string", description: "Nome da empresa" },
        need: {
          type: "string",
          description: "Necessidade ou dor identificada, incluindo o prazo se informado",
        },
        interest_confirmed: {
          type: "boolean",
          description: "Se o lead confirmou interesse explícito",
        },
      },
      required: ["name", "email"],
    },
  },
  {
    name: "oferecerHorarios",
    description:
      "Busca horários disponíveis para reunião. Use APENAS após o cliente confirmar interesse.",
    parameters: {
      type: "object",
      properties: {
        timezone: { type: "string", description: "Fuso do cliente. Padrão: America/Sao_Paulo" },
      },
    },
  },
  {
    name: "agendarReuniao",
    description:
      "Agenda a reunião no horário escolhido. Use APENAS após o cliente escolher um horário.",
    parameters: {
      type: "object",
      properties: {
        email: { type: "string", description: "E-mail do lead" },
        name: { type: "string", description: "Nome do lead" },
        datetime: { type: "string", description: "Valor 'start' (ISO 8601) do horário escolhido" },
      },
      required: ["email", "name", "datetime"],
    },
  },
];

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/** Sincroniza o lead com o Pipefy. Falhas não interrompem a conversa. */
async function syncWithPipefy(repo: Repository, lead: LeadRow): Promise<ToolResult> {
  if (!pipefyConfigured()) {
    return { pipefy: "não configurado" };
  }

  try {
    if (lead.pipefy_card_id) {
      await updateLeadCard(lead.pipefy_card_id, lead);
      return { pipefy: "atualizado" };
    }

    const cardId = await createLeadCard(lead);
    await repo.setPipefyCardId(lead.id, cardId);
    return { pipefy: "criado" };
  } catch (error) {
    console.error("Erro Pipefy:", error);
    return { pipefy: "erro", detalhe: errorMessage(error) };
  }
}

async function registrarLead({ repo, sessionUuid }: ToolContext, args: ToolArgs) {
  const email = text(args.email).toLowerCase();
  if (!EMAIL_PATTERN.test(email)) {
    return { ok: false, erro: "E-mail inválido" };
  }

  // Envia só os campos preenchidos, para não apagar dados já coletados.
  const lead: LeadInput = { email, session_id: sessionUuid };
  if (text(args.name)) lead.name = text(args.name);
  if (text(args.company)) lead.company = text(args.company);
  if (text(args.need)) lead.need = text(args.need);
  if (typeof args.interest_confirmed === "boolean") {
    lead.interest_confirmed = args.interest_confirmed;
  }

  const saved = await repo.upsertLead(lead);
  return { ok: true, ...(await syncWithPipefy(repo, saved)) };
}

async function oferecerHorarios(_ctx: ToolContext, args: ToolArgs) {
  const slots = await getAvailableSlots(text(args.timezone) || DEFAULT_TZ);
  if (!slots.length) {
    return { ok: false, erro: "Nenhum horário disponível nos próximos 7 dias" };
  }

  return { ok: true, horarios: slots };
}

async function agendarReuniao({ repo, sessionUuid }: ToolContext, args: ToolArgs) {
  const email = text(args.email).toLowerCase();
  if (!EMAIL_PATTERN.test(email)) {
    return { ok: false, erro: "E-mail inválido" };
  }

  const name = text(args.name);
  const booking = await bookMeeting({ name, email, start: text(args.datetime) });

  const lead = await repo.upsertLead({
    email,
    ...(name ? { name } : {}),
    session_id: sessionUuid,
    interest_confirmed: true,
    meeting_link: booking.meetingLink,
    meeting_datetime: booking.start,
  });
  await syncWithPipefy(repo, lead);

  return {
    ok: true,
    link: booking.meetingLink,
    horario: formatSlot(booking.start),
    ...(booking.mock
      ? { observacao: "Agendamento de demonstração (Cal.com não configurado)" }
      : {}),
  };
}

const handlers: Record<string, (ctx: ToolContext, args: ToolArgs) => Promise<ToolResult>> = {
  registrarLead,
  oferecerHorarios,
  agendarReuniao,
};

/** Executa uma ferramenta pedida pelo modelo e devolve o resultado (nunca lança erro). */
export async function runTool(ctx: ToolContext, name: string, args: ToolArgs): Promise<ToolResult> {
  const handler = handlers[name];
  if (!handler) {
    return { ok: false, erro: `Ferramenta desconhecida: ${name}` };
  }

  try {
    return await handler(ctx, args);
  } catch (error) {
    console.error(`Erro em ${name}:`, error);
    return { ok: false, erro: errorMessage(error) };
  }
}
