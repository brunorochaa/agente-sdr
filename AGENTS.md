# AGENTS.md

> **Sincronia obrigatória:** `CLAUDE.md` e `AGENTS.md` devem ter o mesmo conteúdo (só o título muda). Sempre que um for alterado, atualize o outro.

## O que é

Agente SDR (pré-vendas) com IA para o ERP360, um ERP fictício: webchat que qualifica o lead, registra no Pipefy e agenda reunião no Cal.com. Desafio técnico de processo seletivo (2025), feito no Lovable e reorganizado em 2026. Uso e estrutura no `README.md`.

## Stack

- Frontend: React 18, TypeScript, Vite, Tailwind (sem biblioteca de componentes; ícones do `lucide-react`).
- Backend: Supabase (Postgres + Edge Functions em Deno). Dependências do Deno no `supabase/functions/deno.json`.
- IA: Gemini, OpenAI ou Claude, escolhidos por `LLM_PROVIDER`. O Claude usa o SDK oficial (`@anthropic-ai/sdk`).

## Como rodar / compilar / testar

```bash
npm install
npm run dev       # frontend em http://localhost:8080
npm test          # testes das Edge Functions (Deno, sem rede)
npm run check     # typecheck + lint + build
npm run format    # Prettier + deno fmt
```

O Deno não precisa estar instalado: os scripts usam `npx deno`.

## Estrutura

- `src/pages/Index.tsx`: página do ERP360. `src/components/ChatWidget.tsx`: webchat. `src/components/Logo.tsx`: marca, o rosto de óculos escuros "B)" do Bruno (manter igual a `public/favicon.svg`; o `favicon.ico` e o `icon-256.png` vêm do ícone original em `D:BrunoBrunoCentralProjetosResources`). O nome do produto continua ERP360, sem o "B)" no texto. `src/lib/chat-events.ts`: `openChat(texto?)` abre o chat de qualquer lugar da página.
- `supabase/functions/sdr-chat/`: `index.ts` (liga banco e IA reais), `handler.ts` (rota HTTP com dependências injetadas), `agent.ts` (ciclo modelo ↔ ferramentas), `tools.ts` (registrarLead, oferecerHorarios, agendarReuniao), `prompt.ts`, `db.ts` (interface `Repository`), `config.ts`.
- `supabase/functions/sdr-chat/llm/`: `types.ts` (interface `LlmProvider`), um arquivo por provedor e `index.ts` (escolha por variável).
- `supabase/functions/_shared/`: `pipefy.ts`, `calcom.ts`, `http.ts`.
- `supabase/functions/tests/`: testes com `MemoryRepository` e `FakeFetch` (`helpers.ts`) e respostas simuladas de cada IA (`fixtures.ts`).

## Convenções

- Textos da interface, do prompt e de erros em pt-BR; nomes de código em inglês, exceto as ferramentas do agente (nomes em pt-BR).
- O navegador nunca acessa as tabelas: tudo passa pela função `sdr-chat`, que usa a service role. Não criar políticas RLS públicas.
- Novo provedor de IA: implementar `LlmProvider` em `llm/` e registrar em `llm/index.ts`. O ciclo do agente não deve conhecer detalhes de provedor.
- Página e prompt devem dizer a mesma coisa sobre planos, preços e prazos (`Index.tsx`, incluindo as dúvidas frequentes, e `prompt.ts`).
- O e-mail identifica o lead, mas não é prova de identidade: nunca sobrescrever dados de um lead que veio de outra conversa. O agendamento só aceita horários que a própria conversa recebeu de `oferecerHorarios`.
- Falha no Pipefy ou no Cal.com não pode travar a conversa: as ferramentas devolvem `{ ok: false, erro }` ao modelo.
- Formatação: `.editorconfig`, Prettier (`.prettierrc.json`) e `deno fmt` (2 espaços, aspas duplas, LF, linhas de até 100).

## Notas para futuros agentes

- Em 2026-11-06 o projeto foi reorganizado: saiu do Lovable (IA e plugins), ganhou testes, suporte a três provedores de IA, redesign da página e do chat, e perdeu os componentes shadcn/ui e as dependências que não eram usados.
- Bugs corrigidos na reorganização: o chat quebrava em toda chamada de ferramenta (formato antigo do Lovable), o prompt do agente não era enviado ao Gemini, o Pipefy recebia campos vazios e criava card duplicado, qualquer pessoa podia ler todos os leads pela chave pública, e visitante novo não via a saudação.
- Em 2026-11-06, segunda rodada: o agendamento só aceita horários oferecidos na conversa (guardados em `chat_sessions.offered_slots` e repetidos no prompt, porque o histórico só guarda o texto das respostas); a mensagem do usuário só é gravada depois que a IA responde; lead de outra conversa não é sobrescrito; limite de mensagens (por sessão e global); modelo padrão do Claude passou a ser o Sonnet 5.5; marca nova (`Logo.tsx`, `favicon.svg`), seção de dúvidas e chamada final na página; CI no GitHub Actions. Migration nova: `20261106000000_horarios_e_limite.sql` (precisa de `supabase db push`).
- Os arquivos do projeto usam LF (`.gitattributes`). Se um editor gravar CRLF, normalize antes de fazer substituições por script.
- Nunca testado de ponta a ponta com chaves reais. A integração real com o Cal.com (API v2) foi escrita pela documentação.
- Deploy: a Vercel publica a `main` a cada push e precisa das variáveis `VITE_SUPABASE_*` configuradas no painel dela (o `.env` não é versionado). Em 2026-11-06 o site ficou em branco porque o `.env` saiu do git antes disso; o `client.ts` agora não derruba a página quando faltam as variáveis.
- Após alterações de código: rode `npm test` e `npm run check`.

## Regras gerais

- Use português do Brasil (pt-BR) nas respostas ao usuário, na documentação e nos textos novos do código.
- Prefira soluções simples e fáceis de manter; não adicione dependências sem necessidade.
- Não altere arquivos ou funcionalidades fora do escopo da tarefa sem explicar o motivo.
- Atualize o `README.md` quando mudar instalação, estrutura ou comportamento importante.
