// Endpoint para testar a integração com o Cal.com isoladamente.
// O fluxo do chat (sdr-chat) usa o módulo _shared/calcom.ts diretamente.
// Exige JWT (veja supabase/config.toml): não é chamado pelo navegador.
import "@supabase/functions-js/edge-runtime.d.ts";
import { corsHeaders, errorMessage, json } from "../_shared/http.ts";
import { bookMeeting, getAvailableSlots } from "../_shared/calcom.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, email, name, datetime, timezone } = await req.json();

    if (action === "get_slots") {
      return json({ slots: await getAvailableSlots(timezone) });
    }
    if (action === "book_meeting") {
      if (!email || !name || !datetime) {
        return json({ error: "email, name e datetime são obrigatórios" }, 400);
      }
      const booking = await bookMeeting({ email, name, start: datetime, timeZone: timezone });
      return json({ meeting_link: booking.meetingLink, start: booking.start, mock: booking.mock });
    }
    return json({ error: "Ação inválida. Use get_slots ou book_meeting." }, 400);
  } catch (error) {
    console.error("Erro na integração Cal.com:", error);
    return json({ error: errorMessage(error) }, 500);
  }
});
