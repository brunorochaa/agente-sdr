import { assert, assertEquals, assertRejects } from "@std/assert";
import { bookMeeting, getAvailableSlots } from "../_shared/calcom.ts";
import { FakeFetch, setEnv } from "./helpers.ts";

const CAL_ENV = { CAL_COM_API_KEY: "cal-key", CAL_COM_EVENT_TYPE_ID: "777" };

Deno.test("modo demonstração: só dias úteis, às 10h e 14h de Brasília", async () => {
  setEnv({});
  const slots = await getAvailableSlots();

  assertEquals(slots.length, 6);
  for (const slot of slots) {
    const date = new Date(slot.start);
    const weekday = date.getUTCDay();
    assert(weekday >= 1 && weekday <= 5, `${slot.start} caiu no fim de semana`);
    assert([13, 17].includes(date.getUTCHours()), `${slot.start} fora de 10h/14h (UTC-3)`);
    assert(date.getTime() > Date.now(), "horário no passado");
  }
});

Deno.test("API real: busca horários e agenda com os cabeçalhos corretos", async () => {
  setEnv(CAL_ENV);
  const fake = new FakeFetch()
    .on("/v2/slots", {
      status: "success",
      data: {
        "2026-11-10": [{ start: "2026-11-10T13:00:00.000Z" }],
        "2026-11-11": [{ start: "2026-11-11T17:00:00.000Z" }],
      },
    })
    .on("/v2/bookings", {
      status: "success",
      data: { uid: "abc", meetingUrl: "https://cal.com/video/abc" },
    })
    .install();

  try {
    const slots = await getAvailableSlots();
    assertEquals(slots.map((s) => s.start), [
      "2026-11-10T13:00:00.000Z",
      "2026-11-11T17:00:00.000Z",
    ]);
    const slotsReq = fake.to("/v2/slots")[0];
    assertEquals(slotsReq.headers.get("authorization"), "Bearer cal-key");
    assertEquals(new URL(slotsReq.url).searchParams.get("eventTypeId"), "777");

    const booking = await bookMeeting({
      name: "Ana",
      email: "ana@acme.com",
      start: slots[0].start,
    });
    assertEquals(booking.meetingLink, "https://cal.com/video/abc");
    assertEquals(booking.mock, false);
    const bookReq = fake.to("/v2/bookings")[0];
    assertEquals(bookReq.body.eventTypeId, 777);
    assertEquals(bookReq.body.attendee.email, "ana@acme.com");
  } finally {
    fake.restore();
  }
});

Deno.test("agendar com data inválida é recusado antes de chamar a API", async () => {
  setEnv(CAL_ENV);
  await assertRejects(
    () => bookMeeting({ name: "Ana", email: "ana@acme.com", start: "ontem" }),
    Error,
    "Horário inválido",
  );
});
