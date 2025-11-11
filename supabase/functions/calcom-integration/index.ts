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
    const calComApiKey = Deno.env.get('CAL_COM_API_KEY');
    
    if (!calComApiKey) {
      throw new Error('CAL_COM_API_KEY não configurado');
    }

    const { action, email, name, datetime, timezone } = await req.json();

    console.log('Ação Cal.com:', action);

    if (action === 'get_slots') {
      // Buscar slots disponíveis (próximos 7 dias)
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);

      // Exemplo de slots mock - em produção, usar API real do Cal.com
      const mockSlots = [
        `📅 ${new Date(Date.now() + 86400000).toLocaleDateString('pt-BR')} às 10:00`,
        `📅 ${new Date(Date.now() + 86400000).toLocaleDateString('pt-BR')} às 14:00`,
        `📅 ${new Date(Date.now() + 172800000).toLocaleDateString('pt-BR')} às 10:00`,
        `📅 ${new Date(Date.now() + 172800000).toLocaleDateString('pt-BR')} às 15:00`,
        `📅 ${new Date(Date.now() + 259200000).toLocaleDateString('pt-BR')} às 11:00`
      ];

      return new Response(
        JSON.stringify({ slots: mockSlots }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );

    } else if (action === 'book_meeting') {
      // Criar agendamento no Cal.com
      // IMPORTANTE: Ajuste o eventTypeId conforme seu evento no Cal.com
      const EVENT_TYPE_ID = 123456; // Substitua pelo ID real do seu tipo de evento

      const bookingData = {
        eventTypeId: EVENT_TYPE_ID,
        start: datetime,
        responses: {
          name: name,
          email: email
        },
        timeZone: timezone || 'America/Sao_Paulo',
        language: 'pt'
      };

      // Em produção, fazer requisição real:
      // const response = await fetch('https://api.cal.com/v1/bookings', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${calComApiKey}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify(bookingData)
      // });

      // Mock para demonstração
      const mockMeetingLink = `https://cal.com/erp360/demo?date=${datetime}`;

      console.log('Reunião agendada (mock):', mockMeetingLink);

      return new Response(
        JSON.stringify({ 
          meeting_link: mockMeetingLink,
          message: 'Reunião agendada com sucesso'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Ação inválida' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );

  } catch (error: any) {
    console.error('Erro na integração Cal.com:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Erro desconhecido' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
