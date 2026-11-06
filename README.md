# Agente SDR

Agente de pré-vendas (SDR) com IA para o ERP360, um ERP fictício. Um webchat conversa com o visitante, qualifica o interesse, registra o lead no Pipefy e agenda a reunião no Cal.com. Começou como desafio técnico de um processo seletivo (2025), feito no Lovable, e foi reorganizado em 2026.

> **Documentação completa:** o [mapa do sistema](docs/MAPA_DO_SISTEMA.md) explica onde fica cada peça, como o agente funciona e **o que fazer quando algo muda** (texto, prompt, banco, provedor de IA, deploy).

## O que faz

- Página do ERP360 com módulos, diferenciais, etapas, planos, dúvidas frequentes e política de privacidade (`/privacidade`), e um chat no canto da tela.
- O agente se apresenta, pergunta sobre a empresa, as dores e o prazo, e pergunta diretamente se o visitante quer falar com o time.
- Assim que sabe nome e e-mail, registra o lead no banco e cria um card no Pipefy (e atualiza o card a cada dado novo).
- Com interesse confirmado, oferece horários livres e agenda a reunião no Cal.com, devolvendo o link.
- Guarda a conversa: quem volta ao site continua de onde parou.
- Site e chat em **português e inglês** (botão com as bandeiras; o agente responde no idioma do visitante, com preços em dólar no inglês).
- Funciona com **Gemini, OpenAI (ChatGPT) ou Claude**, escolhidos por uma variável de ambiente.

Sem chaves do Pipefy e do Cal.com, o lead fica só no banco e o agendamento roda em modo demonstração.

## Tecnologias

- React 18, TypeScript, Vite e Tailwind CSS
- Supabase: Postgres e Edge Functions (Deno)
- Gemini, OpenAI ou Claude (function calling / tool use)
- Pipefy (GraphQL) e Cal.com (API v2)

## Como rodar

Frontend:

```bash
cp .env.example .env      # dados do seu projeto Supabase
npm install
npm run dev               # http://localhost:8080
```

Banco e Edge Functions (requer o [Supabase CLI](https://supabase.com/docs/guides/cli)):

```bash
supabase link --project-ref <seu-project-ref>
supabase db push --remote                     # aplica as migrations (CLI 3.x: sem --remote usa o banco local)
cp supabase/.env.example supabase/.env        # preencha as chaves
supabase secrets set --env-file supabase/.env
supabase functions deploy sdr-chat           # o mapa de imports vem do config.toml
```

Se o `db push` falhar ao criar o usuário temporário (`cli_login_postgres`), use a senha do banco: `SUPABASE_DB_PASSWORD=... supabase db push --remote`. Dentro de agentes e scripts, os comandos que alteram produção pedem `--yes`.

Para rodar as funções localmente: `supabase start` e `supabase functions serve --env-file supabase/.env`.

### Deploy

O frontend está na Vercel, que publica a cada push na `main` (o `vercel.json` manda as rotas para o `index.html`). O `.env` não vai para o git, então configure `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` em **Settings → Environment Variables** do projeto na Vercel. Sem elas, a página abre, mas o chat fica indisponível. **As Edge Functions são publicadas à parte**, com `supabase functions deploy sdr-chat --yes`: mudar o prompt ou as ferramentas só vale no ar depois desse deploy.

## Testes e qualidade

```bash
npm test          # testes das Edge Functions (Deno)
npm run check     # typecheck + lint + build do frontend
npm run format    # Prettier no frontend e deno fmt nas funções
```

O GitHub Actions (`.github/workflows/ci.yml`) roda `npm test` e `npm run check` a cada push e pull request.

Os testes usam banco em memória e APIs simuladas, então rodam sem chaves e sem internet. Cobrem o fluxo completo (lead, horários e agendamento) nos três provedores de IA, o formato de cada API, Pipefy, Cal.com e as validações da rota.

## Configuração

Variáveis das Edge Functions (modelo em `supabase/.env.example`):

| Variável                                       | Obrigatória | Observação                                                     |
| ---------------------------------------------- | ----------- | -------------------------------------------------------------- |
| `LLM_PROVIDER`                                 | não         | `gemini` (padrão), `openai` ou `claude`                        |
| chave do provedor escolhido                    | sim         | `GEMINI_API_KEY`, `OPENAI_API_KEY` ou `ANTHROPIC_API_KEY`      |
| `GEMINI_MODEL`, `OPENAI_MODEL`, `CLAUDE_MODEL` | não         | padrões: `gemini-2.5-flash`, `gpt-5-mini`, `claude-sonnet-5-5` |
| `PIPEFY_API_TOKEN`, `PIPEFY_PIPE_ID`           | não         | sem elas, o lead fica só no banco                              |
| `CAL_COM_API_KEY`, `CAL_COM_EVENT_TYPE_ID`     | não         | sem elas, horários e link são simulados                        |

O modelo padrão do Claude é o Sonnet 5.5: bem mais barato que o Opus e suficiente para um chat curto com ferramentas. O Haiku 5.5 é ainda mais barato, mas não tem o _fallback_ do servidor (abaixo). Para trocar, use `CLAUDE_MODEL`.

**Limites de uso:** a função é pública e cada mensagem gasta créditos de IA, então há um teto de 40 mensagens por sessão por hora e 60 por minuto no total (`sdr-chat/config.ts`). Passou disso, a função responde 429 com uma mensagem em português.

**Segurança dos leads:** o e-mail identifica o lead, mas qualquer visitante pode digitar o e-mail de outra pessoa. Se o lead já veio de outra conversa, o agente só preenche campos vazios e não troca uma reunião já agendada. O agendamento só aceita um dos horários que foram oferecidos na conversa (eles ficam em `chat_sessions.offered_slots`).

No Claude, o _fallback_ do servidor fica ligado: se o modelo recusar um pedido por engano, a API repete a resposta em um modelo substituto.

Os IDs dos campos do formulário do Pipefy ficam em `supabase/functions/_shared/pipefy.ts` (`FIELD_IDS`). Crie campos com esses IDs no pipe ou ajuste a constante.

## Quando você muda algo

| Mudou                           | Faça                                                                                              |
| ------------------------------- | ------------------------------------------------------------------------------------------------- |
| Texto, preço ou plano da página | Edite `src/lib/copy.ts` (pt e en) **e** `supabase/functions/sdr-chat/prompt.ts`; deploy da função |
| Prompt ou ferramentas do agente | `npm test` → commit/push → `supabase functions deploy sdr-chat --yes`                             |
| Tabelas do banco                | Migration nova em `supabase/migrations/` → `supabase db push --remote`                            |
| Provedor ou modelo de IA        | `supabase secrets set LLM_PROVIDER=...` (ou `*_MODEL`); sem deploy de código                      |
| Qualquer código                 | `npm test` e `npm run check` antes do commit                                                      |

Os passos detalhados de cada caso estão no [mapa do sistema](docs/MAPA_DO_SISTEMA.md#6-receitas-mudei-x-o-que-faço).

## Estrutura

```text
src/
├── pages/Index.tsx            # página do ERP360
├── pages/Privacidade.tsx      # política de privacidade (/privacidade)
├── lib/copy.ts                # textos da página e do chat (pt e en)
├── lib/i18n.tsx               # idioma da interface (PT/EN)
├── components/LangSwitch.tsx  # botões de idioma (bandeiras)
├── components/ChatWidget.tsx  # webchat
├── components/Logo.tsx        # marca do ERP360 (igual ao public/favicon.svg)
└── lib/                       # utilitários e evento para abrir o chat
docs/MAPA_DO_SISTEMA.md        # mapa completo do sistema e receitas de manutenção
supabase/
├── migrations/                # tabelas chat_sessions, chat_messages e leads
└── functions/
    ├── sdr-chat/              # rota do chat, ciclo do agente, ferramentas e prompt
    │   └── llm/               # provedores de IA (Gemini, OpenAI, Claude)
    ├── _shared/               # integrações Pipefy e Cal.com
    ├── pipefy-integration/    # endpoint interno para testar o Pipefy
    ├── calcom-integration/    # endpoint interno para testar o Cal.com
    └── tests/                 # testes automatizados
```

O navegador só conversa com a função `sdr-chat`. As tabelas têm RLS sem políticas públicas: apenas as Edge Functions (service role) leem e gravam.

API da função `sdr-chat`:

- `POST { "sessionId": "...", "message": "..." }` → `{ "response": "..." }`
- `POST { "sessionId": "...", "action": "history" }` → `{ "messages": [...] }`
