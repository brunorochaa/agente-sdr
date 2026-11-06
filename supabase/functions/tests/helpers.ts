// Utilitários de teste: banco em memória e um fetch falso que simula as APIs externas.
import type { Slot } from "../_shared/calcom.ts";
import type { ChatMessage, LeadInput, LeadRow, Repository } from "../sdr-chat/db.ts";

// ---------------------------------------------------------------------------
// Banco em memória
// ---------------------------------------------------------------------------

export class MemoryRepository implements Repository {
  sessions = new Map<string, string>();
  messages: (ChatMessage & { session_uuid: string })[] = [];
  leads = new Map<string, LeadRow>();
  offeredSlots = new Map<string, Slot[]>();

  findSession(sessionId: string) {
    return Promise.resolve(this.sessions.get(sessionId) ?? null);
  }

  getOrCreateSession(sessionId: string) {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, crypto.randomUUID());
    }
    return Promise.resolve(this.sessions.get(sessionId)!);
  }

  loadHistory(sessionUuid: string) {
    return Promise.resolve(
      this.messages
        .filter((m) => m.session_uuid === sessionUuid)
        .map(({ role, content, created_at }) => ({ role, content, created_at })),
    );
  }

  saveMessage(sessionUuid: string, role: "user" | "assistant", content: string) {
    this.messages.push({
      session_uuid: sessionUuid,
      role,
      content,
      created_at: new Date().toISOString(),
    });
    return Promise.resolve();
  }

  countUserMessagesSince(since: Date, sessionUuid?: string) {
    const count =
      this.messages.filter((m) =>
        m.role === "user" && new Date(m.created_at) >= since &&
        (!sessionUuid || m.session_uuid === sessionUuid)
      ).length;
    return Promise.resolve(count);
  }

  findLead(email: string) {
    const lead = this.leads.get(email);
    return Promise.resolve(lead ? { ...lead } : null);
  }

  getOfferedSlots(sessionUuid: string) {
    return Promise.resolve(this.offeredSlots.get(sessionUuid) ?? []);
  }

  setOfferedSlots(sessionUuid: string, slots: Slot[]) {
    this.offeredSlots.set(sessionUuid, slots);
    return Promise.resolve();
  }

  upsertLead(lead: LeadInput) {
    const current = this.leads.get(lead.email);
    const row: LeadRow = {
      id: current?.id ?? crypto.randomUUID(),
      name: null,
      company: null,
      need: null,
      interest_confirmed: false,
      meeting_link: null,
      meeting_datetime: null,
      pipefy_card_id: null,
      session_id: null,
      ...current,
      ...lead,
    };
    this.leads.set(lead.email, row);
    return Promise.resolve({ ...row });
  }

  setPipefyCardId(leadId: string, cardId: string) {
    for (const lead of this.leads.values()) {
      if (lead.id === leadId) lead.pipefy_card_id = cardId;
    }
    return Promise.resolve();
  }
}

// ---------------------------------------------------------------------------
// Fetch falso
// ---------------------------------------------------------------------------

export interface RecordedRequest {
  url: string;
  method: string;
  headers: Headers;
  // Corpo JSON livre: cada teste inspeciona o formato da API que simula.
  // deno-lint-ignore no-explicit-any
  body: any;
}

type Responder = (req: RecordedRequest) => unknown;

/**
 * Substitui o fetch global. Cada rota é identificada por um trecho da URL e
 * responde com uma fila de respostas (a última se repete quando a fila acaba).
 */
export class FakeFetch {
  readonly requests: RecordedRequest[] = [];
  private readonly routes: { match: string; queue: Responder[]; status: number }[] = [];
  private original = globalThis.fetch;

  on(match: string, ...responses: (Responder | object)[]) {
    this.routes.push({
      match,
      status: 200,
      queue: responses.map((r) => (typeof r === "function" ? (r as Responder) : () => r)),
    });
    return this;
  }

  fail(match: string, status: number, body: object = { error: "falha simulada" }) {
    this.routes.push({ match, status, queue: [() => body] });
    return this;
  }

  install() {
    globalThis.fetch = async (input: string | URL | Request, init?: RequestInit) => {
      const request = new Request(input, init);
      const text = await request.text();
      const recorded: RecordedRequest = {
        url: request.url,
        method: request.method,
        headers: request.headers,
        body: text ? JSON.parse(text) : undefined,
      };
      this.requests.push(recorded);

      const route = this.routes.find((r) => request.url.includes(r.match));
      if (!route) {
        throw new Error(`FakeFetch: nenhuma rota para ${request.url}`);
      }

      const responder = route.queue.length > 1 ? route.queue.shift()! : route.queue[0];
      return new Response(JSON.stringify(responder(recorded)), {
        status: route.status,
        headers: { "Content-Type": "application/json", "request-id": "req_test" },
      });
    };
    return this;
  }

  restore() {
    globalThis.fetch = this.original;
  }

  to(match: string) {
    return this.requests.filter((r) => r.url.includes(match));
  }
}

// ---------------------------------------------------------------------------
// Variáveis de ambiente
// ---------------------------------------------------------------------------

const MANAGED_ENV = [
  "LLM_PROVIDER",
  "GEMINI_API_KEY",
  "GEMINI_MODEL",
  "OPENAI_API_KEY",
  "OPENAI_MODEL",
  "ANTHROPIC_API_KEY",
  "CLAUDE_MODEL",
  "PIPEFY_API_TOKEN",
  "PIPEFY_PIPE_ID",
  "CAL_COM_API_KEY",
  "CAL_COM_EVENT_TYPE_ID",
];

/** Define as variáveis do teste e limpa todas as outras que o projeto usa. */
export function setEnv(values: Record<string, string>) {
  for (const key of MANAGED_ENV) Deno.env.delete(key);
  for (const [key, value] of Object.entries(values)) Deno.env.set(key, value);
}

/** Silencia console.log/error durante o teste (os módulos registram cada passo). */
export async function quiet<T>(fn: () => Promise<T>): Promise<T> {
  const { log, error } = console;
  console.log = () => {};
  console.error = () => {};
  try {
    return await fn();
  } finally {
    console.log = log;
    console.error = error;
  }
}
