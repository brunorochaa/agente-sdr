-- Remove o acesso público às tabelas.
-- Antes, qualquer pessoa com a chave pública (que fica no navegador) podia ler
-- e alterar TODOS os leads e conversas. Agora só as Edge Functions (service role,
-- que ignora o RLS) acessam os dados; o widget fala apenas com a função sdr-chat.

DROP POLICY IF EXISTS "Permitir leitura de sessões" ON public.chat_sessions;
DROP POLICY IF EXISTS "Permitir criação de sessões" ON public.chat_sessions;
DROP POLICY IF EXISTS "Permitir atualização de sessões" ON public.chat_sessions;

DROP POLICY IF EXISTS "Permitir leitura de mensagens" ON public.chat_messages;
DROP POLICY IF EXISTS "Permitir criação de mensagens" ON public.chat_messages;

DROP POLICY IF EXISTS "Permitir leitura de leads" ON public.leads;
DROP POLICY IF EXISTS "Permitir criação de leads" ON public.leads;
DROP POLICY IF EXISTS "Permitir atualização de leads" ON public.leads;

-- RLS continua habilitado e sem políticas = acesso negado para anon/authenticated.

CREATE INDEX IF NOT EXISTS idx_chat_messages_session_created
  ON public.chat_messages(session_id, created_at);
