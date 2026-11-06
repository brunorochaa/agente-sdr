// Endpoint para testar a integração com o Pipefy isoladamente.
// O fluxo do chat (sdr-chat) usa o módulo _shared/pipefy.ts diretamente.
// Exige JWT (veja supabase/config.toml): não é chamado pelo navegador.
import "@supabase/functions-js/edge-runtime.d.ts";
import { corsHeaders, errorMessage, json } from "../_shared/http.ts";
import { createLeadCard, updateLeadCard } from "../_shared/pipefy.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { lead, cardId } = await req.json();
    if (!lead?.email) return json({ success: false, error: "lead.email é obrigatório" }, 400);

    if (cardId) {
      await updateLeadCard(cardId, lead);
      return json({ success: true, card_id: cardId });
    }
    return json({ success: true, card_id: await createLeadCard(lead) });
  } catch (error) {
    console.error("Erro na integração Pipefy:", error);
    return json({ success: false, error: errorMessage(error) }, 500);
  }
});
