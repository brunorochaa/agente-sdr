import { assertEquals, assertStringIncludes } from "@std/assert";
import { buildSystemPrompt } from "../sdr-chat/prompt.ts";

Deno.test("o prompt traz os horários já oferecidos, com o valor start exato", () => {
  const slots = [{ start: "2026-11-09T13:00:00.000Z", label: "segunda-feira, 09/11, 10:00" }];
  const prompt = buildSystemPrompt(new Date(), slots);

  assertStringIncludes(prompt, "HORÁRIOS JÁ OFERECIDOS");
  assertStringIncludes(prompt, "2026-11-09T13:00:00.000Z");
});

Deno.test("sem horários oferecidos, o prompt não menciona a lista", () => {
  assertEquals(buildSystemPrompt(new Date()).includes("HORÁRIOS JÁ OFERECIDOS"), false);
});
