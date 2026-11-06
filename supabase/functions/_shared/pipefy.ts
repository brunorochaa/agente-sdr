// Integração com o Pipefy (GraphQL).
// Os IDs dos campos dependem do formulário do seu pipe: ajuste FIELD_IDS
// conforme os campos criados no Pipefy (Configurações do pipe > Formulário inicial).

const PIPEFY_URL = "https://api.pipefy.com/graphql";

export const FIELD_IDS = {
  name: "nome",
  email: "email",
  company: "empresa",
  need: "necessidade",
  interestConfirmed: "interesse_confirmado",
  meetingLink: "meeting_link",
  meetingDatetime: "meeting_datetime",
} as const;

export interface LeadData {
  name?: string | null;
  email: string;
  company?: string | null;
  need?: string | null;
  interest_confirmed?: boolean | null;
  meeting_link?: string | null;
  meeting_datetime?: string | null;
}

export function pipefyConfigured(): boolean {
  return Boolean(Deno.env.get("PIPEFY_API_TOKEN") && Deno.env.get("PIPEFY_PIPE_ID"));
}

async function gql<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const token = Deno.env.get("PIPEFY_API_TOKEN");
  if (!token) throw new Error("PIPEFY_API_TOKEN não configurado");

  const res = await fetch(PIPEFY_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) throw new Error(`Pipefy HTTP ${res.status}: ${await res.text()}`);

  const body = await res.json();
  if (body.errors?.length) throw new Error(`Pipefy GraphQL: ${JSON.stringify(body.errors)}`);
  return body.data as T;
}

function yesNo(value: boolean | null | undefined): string | undefined {
  if (value === null || value === undefined) return undefined;
  return value ? "sim" : "nao";
}

function toFields(lead: Partial<LeadData>) {
  const entries: [string, string | null | undefined][] = [
    [FIELD_IDS.name, lead.name],
    [FIELD_IDS.email, lead.email],
    [FIELD_IDS.company, lead.company],
    [FIELD_IDS.need, lead.need],
    [FIELD_IDS.interestConfirmed, yesNo(lead.interest_confirmed)],
    [FIELD_IDS.meetingLink, lead.meeting_link],
    [FIELD_IDS.meetingDatetime, lead.meeting_datetime],
  ];
  return entries
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([field_id, field_value]) => ({ field_id, field_value: String(field_value) }));
}

/** Cria um card no pipe de pré-vendas e devolve o ID do card. */
export async function createLeadCard(lead: LeadData): Promise<string> {
  const pipeId = Deno.env.get("PIPEFY_PIPE_ID");
  if (!pipeId) throw new Error("PIPEFY_PIPE_ID não configurado");

  const data = await gql<{ createCard: { card: { id: string } } }>(
    `mutation CreateCard($input: CreateCardInput!) {
      createCard(input: $input) { card { id } }
    }`,
    {
      input: {
        pipe_id: pipeId,
        title: lead.name ? `${lead.name} (${lead.email})` : lead.email,
        fields_attributes: toFields(lead),
      },
    },
  );
  return data.createCard.card.id;
}

/** Atualiza campos de um card já existente (ex.: dados da reunião). */
export async function updateLeadCard(cardId: string, lead: Partial<LeadData>): Promise<void> {
  for (const field of toFields(lead)) {
    await gql(
      `mutation UpdateField($input: UpdateCardFieldInput!) {
        updateCardField(input: $input) { success }
      }`,
      { input: { card_id: cardId, field_id: field.field_id, new_value: field.field_value } },
    );
  }
}
