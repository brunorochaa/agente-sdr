import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const pipefyToken = Deno.env.get("PIPEFY_API_TOKEN");
    const pipefyId = Deno.env.get("PIPEFY_PIPE_ID");
    
    if (!pipefyToken) {
      throw new Error('PIPEFY_API_TOKEN não configurado');
    }

    if (!pipefyId) {
      throw new Error('PIPEFY_ID não configurado');
    }

    const { lead } = await req.json();

    console.log('Integrando lead com Pipefy:', lead);

    const escape = (str: string) =>
      (str || "").replace(/"/g, '\\"').replace(/\n/g, " ");

    const fields = [
      { field_id: "nome", field_value: escape(lead.nome) },
      { field_id: "email", field_value: escape(lead.email) },
      { field_id: "empresa", field_value: escape(lead.empresa) },
      { field_id: "necessidade", field_value: escape(lead.necessidade) },
      { field_id: "prazo", field_value: escape(lead.prazo) },
      {
        field_id: "interesse_confirmado",
        field_value: lead.interesse_confirmado ? "sim" : "nao",
      },
      ...(lead.meeting_link
        ? [{ field_id: "meeting_link", field_value: escape(lead.meeting_link) }]
        : []),
      ...(lead.meeting_datetime
        ? [{ field_id: "meeting_datetime", field_value: escape(lead.meeting_datetime) }]
        : []),
    ];

    const mutation = `
      mutation {
        createCard(input: {
          pipe_id: "${pipefyId}"
          fields_attributes: [
            ${fields
              .map((f) => `{ field_id: "${f.field_id}", field_value: "${f.field_value}" }`)
              .join("\n")}
          ]
        }) {
          card {
            id
            title
          }
        }
      }
    `;

    const response = await fetch('https://api.pipefy.com/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${pipefyToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: mutation })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro Pipefy API:', response.status, errorText);
      throw new Error(`Erro na API Pipefy: ${response.status}`);
    }

    const data = await response.json();
    console.log('Resposta Pipefy:', data);

    if (data.errors) {
      console.error('Erros GraphQL:', data.errors);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Erro ao criar card no Pipefy',
          details: data.errors 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        card_id: data.data?.createCard?.card?.id,
        message: 'Lead registrado no Pipefy com sucesso'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error: any) {
    console.error('Erro na integração Pipefy:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Erro desconhecido' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
