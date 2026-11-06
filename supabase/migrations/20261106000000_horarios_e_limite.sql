-- Horários oferecidos na conversa e índice para o limite de mensagens.
--
-- offered_slots: os horários que o agente mostrou ao cliente na última oferta.
-- Sem isso, no turno seguinte o modelo não sabia mais o valor exato (ISO) de cada
-- horário e tinha que adivinhar a data a partir do texto que ele mesmo escreveu.

ALTER TABLE public.chat_sessions
  ADD COLUMN IF NOT EXISTS offered_slots JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Limite global de mensagens por minuto (protege os créditos de IA).
CREATE INDEX IF NOT EXISTS idx_chat_messages_role_created
  ON public.chat_messages(role, created_at);
