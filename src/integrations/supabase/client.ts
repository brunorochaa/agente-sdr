import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as
  | string
  | undefined;

export const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);

if (!supabaseConfigured) {
  // Sem as variáveis, a página continua no ar; só o chat fica indisponível.
  console.error(
    "VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY não configuradas: o chat não vai funcionar.",
  );
}

// O site não usa login: a sessão não precisa ser guardada.
export const supabase = createClient<Database>(
  SUPABASE_URL || "http://localhost:54321",
  SUPABASE_PUBLISHABLE_KEY || "chave-nao-configurada",
  { auth: { persistSession: false, autoRefreshToken: false } },
);
