import { assertEquals, assertStringIncludes } from "@std/assert";
import { getAvailableSlots } from "../_shared/calcom.ts";
import { runTool } from "../sdr-chat/tools.ts";
import { FakeFetch, MemoryRepository, quiet, setEnv } from "./helpers.ts";

const PIPEFY = "api.pipefy.com";
const PIPEFY_ENV = { PIPEFY_API_TOKEN: "token", PIPEFY_PIPE_ID: "42" };

function context() {
  return { repo: new MemoryRepository(), sessionUuid: "uuid-1" };
}

Deno.test("registrarLead recusa e-mail inválido", async () => {
  setEnv({});
  const ctx = context();
  const result = await runTool(ctx, "registrarLead", { name: "Ana", email: "ana-sem-arroba" });

  assertEquals(result.ok, false);
  assertEquals(ctx.repo.leads.size, 0);
});

Deno.test("registrarLead não apaga dados já coletados", async () => {
  setEnv({});
  const ctx = context();
  await runTool(ctx, "registrarLead", { name: "Ana", email: "ana@acme.com", company: "Acme" });
  await runTool(ctx, "registrarLead", { name: "Ana", email: "ana@acme.com", need: "Estoque" });

  const lead = ctx.repo.leads.get("ana@acme.com")!;
  assertEquals(lead.company, "Acme");
  assertEquals(lead.need, "Estoque");
});

Deno.test("Pipefy: cria o card na 1ª vez e atualiza nas seguintes", async () => {
  setEnv(PIPEFY_ENV);
  const ctx = context();
  const fake = new FakeFetch()
    .on(
      PIPEFY,
      { data: { createCard: { card: { id: "card-99" } } } },
      { data: { updateCardField: { success: true } } },
    )
    .install();

  try {
    const first = await runTool(ctx, "registrarLead", { name: "Ana", email: "ana@acme.com" });
    assertEquals(first.pipefy, "criado");
    assertEquals(ctx.repo.leads.get("ana@acme.com")!.pipefy_card_id, "card-99");

    const create = fake.to(PIPEFY)[0].body;
    assertStringIncludes(create.query, "createCard");
    assertEquals(create.variables.input.pipe_id, "42");
    assertEquals(fake.to(PIPEFY)[0].headers.get("authorization"), "Bearer token");

    const second = await runTool(ctx, "registrarLead", {
      name: "Ana",
      email: "ana@acme.com",
      company: "Acme",
    });
    assertEquals(second.pipefy, "atualizado");
    assertStringIncludes(fake.to(PIPEFY)[1].body.query, "updateCardField");
    assertEquals(fake.to(PIPEFY)[1].body.variables.input.card_id, "card-99");
  } finally {
    fake.restore();
  }
});

Deno.test("Pipefy fora do ar não impede salvar o lead", async () => {
  setEnv(PIPEFY_ENV);
  const ctx = context();
  const fake = new FakeFetch().fail(PIPEFY, 503).install();

  try {
    const result = await quiet(() =>
      runTool(ctx, "registrarLead", { name: "Ana", email: "ana@acme.com" })
    );
    assertEquals(result.ok, true);
    assertEquals(result.pipefy, "erro");
    assertEquals(ctx.repo.leads.has("ana@acme.com"), true);
  } finally {
    fake.restore();
  }
});

Deno.test("agendarReuniao exige que os horários tenham sido oferecidos", async () => {
  setEnv({});
  const ctx = context();
  const [slot] = await getAvailableSlots();
  const result = await quiet(() =>
    runTool(ctx, "agendarReuniao", { name: "Ana", email: "ana@acme.com", datetime: slot.start })
  );

  assertEquals(result.ok, false);
  assertStringIncludes(String(result.erro), "oferecerHorarios");
});

Deno.test("agendarReuniao recusa horário que não foi oferecido e devolve os válidos", async () => {
  setEnv({});
  const ctx = context();
  await runTool(ctx, "oferecerHorarios", {});

  for (const datetime of ["amanhã cedo", "2030-01-01T10:00:00.000Z"]) {
    const result = await quiet(() =>
      runTool(ctx, "agendarReuniao", { name: "Ana", email: "ana@acme.com", datetime })
    );
    assertEquals(result.ok, false);
    assertEquals((result.horarios as unknown[]).length, 6);
  }
  assertEquals(ctx.repo.leads.size, 0);
});

Deno.test("agendarReuniao agenda um horário oferecido", async () => {
  setEnv({});
  const ctx = context();
  const offered = (await runTool(ctx, "oferecerHorarios", {})).horarios as { start: string }[];
  const result = await quiet(() =>
    runTool(ctx, "agendarReuniao", {
      name: "Ana",
      email: "ana@acme.com",
      datetime: offered[1].start,
    })
  );

  assertEquals(result.ok, true);
  assertEquals(ctx.repo.leads.get("ana@acme.com")!.meeting_datetime, offered[1].start);
});

Deno.test("outra conversa não sobrescreve um lead existente", async () => {
  setEnv({});
  const repo = new MemoryRepository();
  const dona = { repo, sessionUuid: "sessao-da-ana" };
  const intrusa = { repo, sessionUuid: "sessao-intrusa" };

  await runTool(dona, "registrarLead", { name: "Ana", email: "ana@acme.com", company: "Acme" });
  await runTool(intrusa, "registrarLead", {
    name: "Fulano",
    email: "ana@acme.com",
    company: "Outra",
    need: "Financeiro",
  });

  const lead = repo.leads.get("ana@acme.com")!;
  assertEquals(lead.name, "Ana");
  assertEquals(lead.company, "Acme");
  assertEquals(lead.session_id, "sessao-da-ana");
  assertEquals(lead.need, "Financeiro", "campo vazio pode ser preenchido");
});

Deno.test("outra conversa não troca uma reunião já agendada", async () => {
  setEnv({});
  const repo = new MemoryRepository();
  const dona = { repo, sessionUuid: "sessao-da-ana" };
  const intrusa = { repo, sessionUuid: "sessao-intrusa" };

  const donaSlots = (await runTool(dona, "oferecerHorarios", {})).horarios as { start: string }[];
  await quiet(() =>
    runTool(dona, "agendarReuniao", {
      name: "Ana",
      email: "ana@acme.com",
      datetime: donaSlots[0].start,
    })
  );
  const link = repo.leads.get("ana@acme.com")!.meeting_link;

  const slots = (await runTool(intrusa, "oferecerHorarios", {})).horarios as { start: string }[];
  const result = await quiet(() =>
    runTool(intrusa, "agendarReuniao", {
      name: "Fulano",
      email: "ana@acme.com",
      datetime: slots[3].start,
    })
  );

  assertEquals(result.ok, false);
  assertEquals(repo.leads.get("ana@acme.com")!.meeting_link, link);
});

Deno.test("ferramenta desconhecida não quebra o agente", async () => {
  const result = await runTool(context(), "apagarTudo", {});
  assertEquals(result.ok, false);
});
