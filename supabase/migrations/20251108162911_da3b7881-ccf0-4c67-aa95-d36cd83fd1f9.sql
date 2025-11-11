-- Criar tabelas para o agente SDR

-- Tabela de sessões de chat
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_activity TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de mensagens
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de leads
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  company TEXT,
  need TEXT,
  interest_confirmed BOOLEAN DEFAULT false,
  meeting_link TEXT,
  meeting_datetime TIMESTAMP WITH TIME ZONE,
  pipefy_card_id TEXT,
  session_id UUID REFERENCES public.chat_sessions(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Políticas públicas para permitir acesso sem autenticação (webchat público)
CREATE POLICY "Permitir leitura de sessões" ON public.chat_sessions FOR SELECT USING (true);
CREATE POLICY "Permitir criação de sessões" ON public.chat_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de sessões" ON public.chat_sessions FOR UPDATE USING (true);

CREATE POLICY "Permitir leitura de mensagens" ON public.chat_messages FOR SELECT USING (true);
CREATE POLICY "Permitir criação de mensagens" ON public.chat_messages FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir leitura de leads" ON public.leads FOR SELECT USING (true);
CREATE POLICY "Permitir criação de leads" ON public.leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de leads" ON public.leads FOR UPDATE USING (true);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers para updated_at
CREATE TRIGGER update_chat_sessions_updated_at
  BEFORE UPDATE ON public.chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON public.chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_session_id ON public.chat_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);