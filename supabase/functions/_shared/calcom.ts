// Integração com o Cal.com (API v2).
// Se CAL_COM_API_KEY e CAL_COM_EVENT_TYPE_ID estiverem configurados, usa a API real.
// Caso contrário, funciona em modo demonstração (horários e link simulados).

const CAL_API = "https://api.cal.com/v2";
export const DEFAULT_TZ = "America/Sao_Paulo";

export interface Slot {
  /** Horário em ISO 8601 (é o valor que deve ser usado para agendar). */
  start: string;
  /** Texto amigável para mostrar ao cliente. */
  label: string;
}

export interface Booking {
  meetingLink: string;
  start: string;
  mock: boolean;
}

function calConfig() {
  const apiKey = Deno.env.get("CAL_COM_API_KEY");
  const eventTypeId = Number(Deno.env.get("CAL_COM_EVENT_TYPE_ID"));
  return apiKey && eventTypeId ? { apiKey, eventTypeId } : null;
}

export function formatSlot(iso: string, timeZone = DEFAULT_TZ): string {
  return new Date(iso).toLocaleString("pt-BR", {
    timeZone,
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function mockSlots(timeZone: string): Slot[] {
  // Próximos dias úteis às 10h e 14h (horário de Brasília, UTC-3).
  const slots: Slot[] = [];
  const day = new Date();
  while (slots.length < 6) {
    day.setUTCDate(day.getUTCDate() + 1);
    const weekday = day.getUTCDay();
    if (weekday === 0 || weekday === 6) continue;
    const date = day.toISOString().slice(0, 10);
    for (const hour of ["10:00", "14:00"]) {
      const start = new Date(`${date}T${hour}:00-03:00`).toISOString();
      slots.push({ start, label: formatSlot(start, timeZone) });
    }
  }
  return slots;
}

export async function getAvailableSlots(timeZone = DEFAULT_TZ, limit = 6): Promise<Slot[]> {
  const cfg = calConfig();
  if (!cfg) return mockSlots(timeZone).slice(0, limit);

  const start = new Date();
  const end = new Date(start.getTime() + 7 * 86_400_000);
  const params = new URLSearchParams({
    eventTypeId: String(cfg.eventTypeId),
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
    timeZone,
  });

  const res = await fetch(`${CAL_API}/slots?${params}`, {
    headers: { Authorization: `Bearer ${cfg.apiKey}`, "cal-api-version": "2024-09-04" },
  });
  if (!res.ok) throw new Error(`Cal.com slots HTTP ${res.status}: ${await res.text()}`);

  const body = await res.json();
  const byDay: Record<string, { start: string }[]> = body.data ?? {};
  return Object.values(byDay)
    .flat()
    .slice(0, limit)
    .map((s) => ({ start: s.start, label: formatSlot(s.start, timeZone) }));
}

export async function bookMeeting(params: {
  name: string;
  email: string;
  start: string;
  timeZone?: string;
}): Promise<Booking> {
  const timeZone = params.timeZone || DEFAULT_TZ;
  const startDate = new Date(params.start);
  if (Number.isNaN(startDate.getTime())) throw new Error(`Horário inválido: ${params.start}`);
  const start = startDate.toISOString();

  const cfg = calConfig();
  if (!cfg) {
    return {
      meetingLink: `https://cal.com/erp360/demo?date=${encodeURIComponent(start)}`,
      start,
      mock: true,
    };
  }

  const res = await fetch(`${CAL_API}/bookings`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cfg.apiKey}`,
      "cal-api-version": "2024-08-13",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      start,
      eventTypeId: cfg.eventTypeId,
      attendee: { name: params.name, email: params.email, timeZone, language: "pt-BR" },
    }),
  });
  if (!res.ok) throw new Error(`Cal.com booking HTTP ${res.status}: ${await res.text()}`);

  const { data } = await res.json();
  const meetingLink = data?.meetingUrl || data?.location || `https://cal.com/booking/${data?.uid}`;
  return { meetingLink, start, mock: false };
}
