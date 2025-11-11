import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface RequestBody {
  sessionId: string;
  message: string;
  conversationHistory: Message[];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { sessionId, message, conversationHistory }: RequestBody = await req.json();

    console.log('Processando mensagem para sessão:', sessionId);

    // 1. Buscar ou criar sessão no banco
    let { data: session, error: sessionError } = await supabase
      .from('chat_sessions')
      .select('id')
      .eq('session_id', sessionId)
      .maybeSingle();

    if (sessionError && sessionError.code !== 'PGRST116') {
      throw sessionError;
    }

    if (!session) {
      const { data: newSession, error: createError } = await supabase
        .from('chat_sessions')
        .insert({ session_id: sessionId })
        .select('id')
        .single();

      if (createError) throw createError;
      session = newSession;
    }

    // 2. Salvar mensagem do usuário
    await supabase.from('chat_messages').insert({
      session_id: session.id,
      role: 'user',
      content: message
    });

    // 3. Preparar contexto e tools para o agente
    const systemPrompt = `Você é um agente SDR (Sales Development Representative) da ERP360, um software de gestão empresarial completo.

SEU OBJETIVO: Conduzir uma conversa natural para:
1. Apresentar o produto ERP360
2. Descobrir as necessidades do cliente (perguntas sobre nome, empresa, necessidades de gestão, prazo)
3. Identificar interesse em adquirir o produto
4. Quando o cliente CONFIRMAR interesse explícito, oferecer agendamento de reunião

PRODUTO ERP360:
- Sistema completo de gestão empresarial (ERP)
- Unifica: Financeiro, Estoque, Vendas, Compras, RH, Relatórios
- Planos: Starter (R$ 297/mês), Professional (R$ 597/mês), Enterprise (customizado)
- Diferenciais: Interface intuitiva, implementação rápida (7-15 dias), suporte 24/7, IA integrada

SCRIPT DE DESCOBERTA:
1. Apresentação inicial empática
2. Perguntar sobre a empresa e tamanho do time
3. Descobrir dores atuais em gestão (processos manuais, falta de integração, relatórios demorados)
4. Entender necessidade específica e urgência
5. Perguntar DIRETAMENTE: "Com base no que conversamos, você gostaria de seguir com uma conversa com nosso time para avaliar o ERP360 para sua empresa?"

IMPORTANTE:
- Seja natural, empático e consultivo (não seja robótico ou agressivo)
- Faça uma pergunta de cada vez
- Use o nome do cliente quando souber
- Só use as ferramentas quando tiver as informações necessárias
- registrarLead: use assim que tiver nome e email
- oferecerHorarios: APENAS após confirmação explícita de interesse
- agendarReuniao: APENAS após o cliente escolher um horário

TOM: Profissional, consultivo, empático e prestativo.`;

    const tools = [
      {
        functionDeclarations: [
          {
            name: "registrarLead",
            description: "Registra ou atualiza as informações do lead no Pipefy. Use assim que coletar nome e email.",
            parameters: {
              type: "object",
              properties: {
                name: { type: "string", description: "Nome completo do lead" },
                email: { type: "string", description: "Email do lead" },
                company: { type: "string", description: "Nome da empresa" },
                need: { type: "string", description: "Necessidade ou dor identificada" },
                interest_confirmed: { type: "boolean", description: "Se o lead confirmou interesse explícito em adquirir" }
              },
              required: ["name", "email"]
            }
          },
          {
            name: "oferecerHorarios",
            description: "Busca horários disponíveis para reunião. Use APENAS após o cliente confirmar interesse em seguir com conversa.",
            parameters: {
              type: "object",
              properties: {
                timezone: { type: "string", description: "Timezone do cliente, padrão America/Sao_Paulo" }
              }
            }
          },
          {
            name: "agendarReuniao",
            description: "Agenda reunião no horário escolhido pelo cliente. Use APENAS após o cliente escolher um horário.",
            parameters: {
              type: "object",
              properties: {
                email: { type: "string", description: "Email do lead" },
                name: { type: "string", description: "Nome do lead" },
                datetime: { type: "string", description: "Data e hora escolhida em formato ISO" }
              },
              required: ["email", "name", "datetime"]
            }
          }
        ]
      }
    ];

    // 4. Montar histórico de mensagens
    const messages: any[] = [
      { role: "system", content: systemPrompt },
      ...conversationHistory.map(m => ({ role: m.role, content: m.content })),
      { role: "user", content: message }
    ];

    let aiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: messages
            .filter(m => m.role !== "system")
            .map(m => ({
              role: m.role === "assistant" ? "model" : "user",
              parts: [{ text: m.content }]
            })),
          tools,
          generationConfig: {
            temperature: 0.7
          }
        }),
      }
    );

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('❌ Erro na API Gemini:', aiResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: `Erro Gemini: ${aiResponse.status} - ${errorText}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const aiData = await aiResponse.json();
    console.log('Resposta da IA:', JSON.stringify(aiData, null, 2));

    let finalResponse = '';
    const parts = aiData.candidates?.[0]?.content?.parts || [];
    const toolCalls = parts
      .filter((p: any) => p.functionCall)
      .map((p: any) => p.functionCall);
      
    // 6. Processar tool calls se houver
    if (toolCalls.length > 0) {
      console.log('Tool calls detectados:', toolCalls.length);
      
      for (const toolCall of toolCalls) {
        const functionName = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments);
        console.log(`Executando ${functionName} com args:`, args);

        if (functionName === 'registrarLead') {
          // Registrar no banco e Pipefy
          const { data: lead, error: leadError } = await supabase
            .from('leads')
            .upsert({
              email: args.email,
              name: args.name,
              company: args.company,
              need: args.need,
              interest_confirmed: args.interest_confirmed || false,
              session_id: session.id
            }, { onConflict: 'email' })
            .select()
            .single();

          if (leadError) {
            console.error('Erro ao salvar lead:', leadError);
          } else {
            console.log('Lead registrado:', lead);
            
            // Chamar função de integração Pipefy
            const pipefyResponse = await supabase.functions.invoke('pipefy-integration', {
              body: { lead }
            });
            
            if (pipefyResponse.error) {
              console.error('Erro Pipefy:', pipefyResponse.error);
            }
          }
        } else if (functionName === 'oferecerHorarios') {
          // Chamar integração Cal.com
          const calResponse = await supabase.functions.invoke('calcom-integration', {
            body: { action: 'get_slots', timezone: args.timezone || 'America/Sao_Paulo' }
          });

          if (calResponse.data?.slots) {
            finalResponse = `Ótimo! Temos os seguintes horários disponíveis:\n${calResponse.data.slots.join('\n')}\n\nQual horário funciona melhor para você?`;
          }
        } else if (functionName === 'agendarReuniao') {
          // Agendar reunião
          const calResponse = await supabase.functions.invoke('calcom-integration', {
            body: {
              action: 'book_meeting',
              email: args.email,
              name: args.name,
              datetime: args.datetime
            }
          });

          if (calResponse.data?.meeting_link) {
            // Atualizar lead com link da reunião
            await supabase
              .from('leads')
              .update({
                meeting_link: calResponse.data.meeting_link,
                meeting_datetime: args.datetime,
                interest_confirmed: true
              })
              .eq('email', args.email);

            finalResponse = `Perfeito! Sua reunião está agendada. Você receberá um email de confirmação com o link: ${calResponse.data.meeting_link}`;
          }
        }
      }
    }

    // Se não houve tool calls ou precisamos da resposta da IA
    if (!finalResponse) {
      finalResponse =
        aiData.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Desculpe, não consegui processar sua mensagem.";
    }

    // 7. Salvar resposta do assistente
    await supabase.from('chat_messages').insert({
      session_id: session.id,
      role: 'assistant',
      content: finalResponse
    });

    return new Response(
      JSON.stringify({ response: finalResponse }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error: any) {
    console.error('Erro no chat SDR:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Erro interno do servidor' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
