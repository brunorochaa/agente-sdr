import { assertEquals } from "@std/assert";
import { createHandler } from "../sdr-chat/handler.ts";
import type { LlmProvider } from "../sdr-chat/llm/types.ts";
import { MemoryRepository, quiet } from "./helpers.ts";

function fakeProvider(reply: () => Promise<string>): LlmProvider {
  return {
    name: "fake",
    model: "fake",
    startConversation: () => ({
      next: async () => ({ text: await reply(), toolCalls: [] }),
      addToolResults: () => {},
    }),
  };
}

function setup(reply = () => Promise.resolve("Olá!")) {
  const repo = new MemoryRepository();
  const handler = createHandler({ repo: () => repo, provider: () => fakeProvider(reply) });
  const post = (body: object) =>
    handler(new Request("http://localhost", { method: "POST", body: JSON.stringify(body) }));
  return { repo, handler, post };
}

Deno.test("rejeita sessionId inválido", async () => {
  const { post } = setup();
  const res = await post({ sessionId: "x", message: "oi" });
  assertEquals(res.status, 400);
});

Deno.test("rejeita mensagem vazia ou longa demais", async () => {
  const { post } = setup();
  assertEquals((await post({ sessionId: "session_abcdef", message: "   " })).status, 400);
  assertEquals(
    (await post({ sessionId: "session_abcdef", message: "a".repeat(1001) })).status,
    400,
  );
});

Deno.test("histórico de visitante novo traz só a saudação", async () => {
  const { post } = setup();
  const res = await post({ sessionId: "session_novo123", action: "history" });
  const { messages } = await res.json();

  assertEquals(messages.length, 1);
  assertEquals(messages[0].role, "assistant");
});

Deno.test("histórico devolve a conversa salva", async () => {
  const { post } = setup();
  await post({ sessionId: "session_abcdef", message: "Oi" });

  const { messages } = await (await post({ sessionId: "session_abcdef", action: "history" }))
    .json();
  assertEquals(messages.map((m: { content: string }) => m.content), [
    "Olá! Sou o assistente virtual da ERP360. Como posso ajudar você hoje com a gestão da sua empresa?",
    "Oi",
    "Olá!",
  ]);
});

Deno.test("erro da IA vira mensagem genérica (sem vazar detalhes)", async () => {
  const { post } = setup(() => Promise.reject(new Error("chave secreta inválida sk-123")));
  const res = await quiet(() => post({ sessionId: "session_abcdef", message: "Oi" }));
  const body = await res.json();

  assertEquals(res.status, 500);
  assertEquals(body.error.includes("sk-123"), false);
});

Deno.test("responde ao preflight de CORS", async () => {
  const { handler } = setup();
  const res = await handler(new Request("http://localhost", { method: "OPTIONS" }));
  assertEquals(res.headers.get("access-control-allow-origin"), "*");
});

Deno.test("falha da IA não grava a mensagem (sem duplicar ao tentar de novo)", async () => {
  let fails = true;
  const { repo, post } = setup(() =>
    fails ? Promise.reject(new Error("fora do ar")) : Promise.resolve("Olá!")
  );

  await quiet(() => post({ sessionId: "session_abcdef", message: "Oi" }));
  assertEquals(repo.messages.length, 0);

  fails = false;
  await post({ sessionId: "session_abcdef", message: "Oi" });
  assertEquals(repo.messages.map((m) => m.role), ["user", "assistant"]);
});

Deno.test("limita mensagens por sessão", async () => {
  const { repo, post } = setup();
  const uuid = await repo.getOrCreateSession("session_abcdef");
  for (let i = 0; i < 40; i++) await repo.saveMessage(uuid, "user", "spam");

  const res = await post({ sessionId: "session_abcdef", message: "Oi" });
  assertEquals(res.status, 429);

  // Outra sessão não é afetada.
  assertEquals((await post({ sessionId: "session_outra12", message: "Oi" })).status, 200);
});

Deno.test("limita mensagens no total por minuto", async () => {
  const { repo, post } = setup();
  for (let i = 0; i < 60; i++) {
    const uuid = await repo.getOrCreateSession(`session_load_${i}`);
    await repo.saveMessage(uuid, "user", "carga");
  }

  assertEquals((await post({ sessionId: "session_novo1234", message: "Oi" })).status, 429);
});
