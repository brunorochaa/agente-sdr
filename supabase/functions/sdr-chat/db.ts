import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Slot } from "../_shared/calcom.ts";
import { HISTORY_LIMIT } from "./config.ts";
import type { ChatRole, HistoryMessage } from "./llm/types.ts";

export interface ChatMessage extends HistoryMessage {
  created_at: string;
}

export interface LeadRow {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
  need: string | null;
  interest_confirmed: boolean | null;
  meeting_link: string | null;
  meeting_datetime: string | null;
  pipefy_card_id: string | null;
  /** Sessão de chat que criou o lead. */
  session_id: string | null;
}

export type LeadInput = Partial<Omit<LeadRow, "id">> & { email: string };

/** Tudo o que o chat precisa do banco. Nos testes, é trocado por uma versão em memória. */
export interface Repository {
  findSession(sessionId: string): Promise<string | null>;
  getOrCreateSession(sessionId: string): Promise<string>;
  loadHistory(sessionUuid: string): Promise<ChatMessage[]>;
  saveMessage(sessionUuid: string, role: ChatRole, content: string): Promise<void>;
  /** Quantas mensagens de usuário chegaram desde `since` (numa sessão ou no total). */
  countUserMessagesSince(since: Date, sessionUuid?: string): Promise<number>;
  findLead(email: string): Promise<LeadRow | null>;
  upsertLead(lead: LeadInput): Promise<LeadRow>;
  setPipefyCardId(leadId: string, cardId: string): Promise<void>;
  /** Últimos horários mostrados ao cliente (usados para validar o agendamento). */
  getOfferedSlots(sessionUuid: string): Promise<Slot[]>;
  setOfferedSlots(sessionUuid: string, slots: Slot[]): Promise<void>;
}

/** Repositório real (Supabase com service role: ignora o RLS, só existe no servidor). */
export function createSupabaseRepository(
  db: SupabaseClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  ),
): Repository {
  return {
    async findSession(sessionId) {
      const { data, error } = await db
        .from("chat_sessions")
        .select("id")
        .eq("session_id", sessionId)
        .maybeSingle();

      if (error) throw error;
      return data?.id ?? null;
    },

    async getOrCreateSession(sessionId) {
      const { data, error } = await db
        .from("chat_sessions")
        .upsert(
          { session_id: sessionId, last_activity: new Date().toISOString() },
          { onConflict: "session_id" },
        )
        .select("id")
        .single();

      if (error) throw error;
      return data.id;
    },

    async loadHistory(sessionUuid) {
      const { data, error } = await db
        .from("chat_messages")
        .select("role, content, created_at")
        .eq("session_id", sessionUuid)
        .order("created_at", { ascending: false })
        .limit(HISTORY_LIMIT);

      if (error) throw error;
      return ((data ?? []) as ChatMessage[]).reverse();
    },

    async saveMessage(sessionUuid, role, content) {
      const { error } = await db
        .from("chat_messages")
        .insert({ session_id: sessionUuid, role, content });

      if (error) throw error;
    },

    async countUserMessagesSince(since, sessionUuid) {
      let query = db
        .from("chat_messages")
        .select("id", { count: "exact", head: true })
        .eq("role", "user")
        .gte("created_at", since.toISOString());
      if (sessionUuid) query = query.eq("session_id", sessionUuid);

      const { count, error } = await query;
      if (error) throw error;
      return count ?? 0;
    },

    async findLead(email) {
      const { data, error } = await db
        .from("leads")
        .select("*")
        .eq("email", email)
        .maybeSingle();

      if (error) throw error;
      return (data as LeadRow | null) ?? null;
    },

    async upsertLead(lead) {
      const { data, error } = await db
        .from("leads")
        .upsert(lead, { onConflict: "email" })
        .select()
        .single();

      if (error) throw error;
      return data as LeadRow;
    },

    async setPipefyCardId(leadId, cardId) {
      const { error } = await db
        .from("leads")
        .update({ pipefy_card_id: cardId })
        .eq("id", leadId);

      if (error) throw error;
    },

    async getOfferedSlots(sessionUuid) {
      const { data, error } = await db
        .from("chat_sessions")
        .select("offered_slots")
        .eq("id", sessionUuid)
        .maybeSingle();

      if (error) throw error;
      return (data?.offered_slots as Slot[] | undefined) ?? [];
    },

    async setOfferedSlots(sessionUuid, slots) {
      const { error } = await db
        .from("chat_sessions")
        .update({ offered_slots: slots })
        .eq("id", sessionUuid);

      if (error) throw error;
    },
  };
}
