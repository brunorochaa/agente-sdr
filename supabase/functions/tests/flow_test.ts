// Fluxo completo do SDR, do cumprimento ao agendamento, em cada provedor de IA.
// Banco em memória + APIs simuladas: nada sai para a rede.
import { assert, assertEquals, assertExists, assertStringIncludes } from "@std/assert";
import { getAvailableSlots } from "../_shared/calcom.ts";
import { createHandler } from "../sdr-chat/handler.ts";
import { providerFromEnv } from "../sdr-chat/llm/index.ts";
import { PROVIDERS } from "./fixtures.ts";
import { FakeFetch, MemoryRepository, quiet, setEnv } from "./helpers.ts";

const SESSION = "session_teste_123";

function post(handler: (req: Request) => Promise<Response>, body: object) {
  return handler(
    new Request("http://localhost/sdr-chat", { method: "POST", body: JSON.stringify(body) }),
  );
}

for (const provider of PROVIDERS) {
  Deno.test(`[${provider.name}] fluxo completo: lead, horários e agendamento`, async () => {
    setEnv(provider.env);
    const [slot] = await getAvailableSlots();
    const repo = new MemoryRepository();
    const handler = createHandler({ repo: () => repo, provider: () => providerFromEnv() });

    const fake = new FakeFetch()
      .on(
        provider.url,
        provider.reply({
          call: {
            name: "registrarLead",
            args: { name: "Ana Souza", email: "Ana@Acme.com", company: "Acme" },
          },
        }),
        provider.reply({ text: "Prazer, Ana! Quais as maiores dores da Acme hoje?" }),
        provider.reply({ call: { name: "oferecerHorarios", args: {} } }),
        provider.reply({ text: "Tenho estes horários disponíveis. Qual prefere?" }),
        provider.reply({
          call: {
            name: "agendarReuniao",
            args: { name: "Ana Souza", email: "ana@acme.com", datetime: slot.start },
          },
        }),
        provider.reply({ text: "Reunião agendada! Enviei o link por e-mail." }),
      )
      .install();

    try {
      await quiet(async () => {
        // 1. Cliente se apresenta -> agente registra o lead
        let res = await post(handler, {
          sessionId: SESSION,
          message: "Oi, sou a Ana da Acme, ana@acme.com",
        });
        assertEquals(res.status, 200);
        assertEquals(
          (await res.json()).response,
          "Prazer, Ana! Quais as maiores dores da Acme hoje?",
        );

        const lead = repo.leads.get("ana@acme.com");
        assertExists(lead, "lead deveria ser salvo com e-mail normalizado");
        assertEquals(lead.name, "Ana Souza");
        assertEquals(lead.company, "Acme");

        // 2. Cliente confirma interesse -> agente oferece horários
        res = await post(handler, { sessionId: SESSION, message: "Quero conversar com o time" });
        assertEquals(
          (await res.json()).response,
          "Tenho estes horários disponíveis. Qual prefere?",
        );

        const slotsSent = JSON.stringify(fake.to(provider.url).at(-1)!.body);
        assertStringIncludes(slotsSent, slot.start, "horários devem voltar para o modelo");

        // 3. Cliente escolhe -> agente agenda
        res = await post(handler, { sessionId: SESSION, message: "Pode ser o primeiro" });
        assertEquals((await res.json()).response, "Reunião agendada! Enviei o link por e-mail.");

        const booked = repo.leads.get("ana@acme.com")!;
        assertEquals(booked.interest_confirmed, true);
        assertEquals(booked.meeting_datetime, slot.start);
        assertStringIncludes(booked.meeting_link!, "cal.com");
        assertEquals(booked.company, "Acme", "agendar não pode apagar dados já coletados");

        // Histórico: 3 mensagens do cliente + 3 respostas
        assertEquals(repo.messages.length, 6);
        assertEquals(fake.to(provider.url).length, 6);
      });

      checkProviderFormat(provider.name, fake);
    } finally {
      fake.restore();
    }
  });
}

/** Confere se cada provedor recebeu a requisição no formato da sua API. */
function checkProviderFormat(name: string, fake: FakeFetch) {
  const requests = fake.requests.filter((r) => !r.url.includes("cal.com"));
  const first = requests[0];
  const afterTool = requests[1];

  if (name === "gemini") {
    assertEquals(first.headers.get("x-goog-api-key"), "test-gemini");
    assertStringIncludes(first.body.systemInstruction.parts[0].text, "ERP360");
    assertEquals(first.body.tools[0].functionDeclarations.length, 3);
    // Resposta do modelo reenviada com a assinatura original
    assertEquals(afterTool.body.contents.at(-2).parts[0].thoughtSignature, "sig");
    assertEquals(afterTool.body.contents.at(-1).parts[0].functionResponse.name, "registrarLead");
  }

  if (name === "openai") {
    assertEquals(first.headers.get("authorization"), "Bearer test-openai");
    assertEquals(first.body.messages[0].role, "system");
    assertEquals(first.body.tools[0].type, "function");
    const call = afterTool.body.messages.at(-2).tool_calls[0];
    const result = afterTool.body.messages.at(-1);
    assertEquals(result.role, "tool");
    assertEquals(result.tool_call_id, call.id);
  }

  if (name === "claude") {
    assertEquals(first.headers.get("authorization"), "Bearer test-claude");
    assertStringIncludes(first.headers.get("anthropic-beta")!, "server-side-fallback-2026-07-01");
    assertEquals(first.body.model, "claude-opus-5-5");
    assertEquals(first.body.fallbacks, "default");
    assertStringIncludes(first.body.system, "ERP360");
    assertEquals(first.body.tools[0].input_schema.type, "object");
    assertEquals(first.body.messages[0].role, "user");
    const toolUse = afterTool.body.messages.at(-2).content[0];
    const toolResult = afterTool.body.messages.at(-1).content[0];
    assertEquals(toolResult.type, "tool_result");
    assertEquals(toolResult.tool_use_id, toolUse.id);
    assert(!("temperature" in first.body), "Opus 5.5 rejeita temperature");
  }
}
