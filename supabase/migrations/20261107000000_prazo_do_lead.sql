-- Prazo informado pelo lead (vai para o campo "prazo" do Pipefy).
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS deadline TEXT;
