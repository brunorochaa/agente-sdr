# Mapa do sistema (ERP360 + Agente SDR)

Documento de referência para quem for mexer no projeto (pessoa ou agente de IA). Explica **o que existe, como as peças se ligam e o que fazer quando algo muda**. Se você só quer rodar o projeto, comece pelo `README.md`.

> Mantenha este arquivo atualizado: quando uma mudança alterar algo descrito aqui, corrija o texto no mesmo commit.

## 1. Visão geral em um minuto

Site de um ERP fictício (**ERP360**) com um chat no canto. O chat é um agente de pré-vendas (SDR) com IA: conversa, descobre a necessidade, registra o lead no **Pipefy** e agenda a reunião no **Cal.com**.

```text
Visitante
   │  abre o site (Vercel)
   ▼
Frontend React ──────────────►  Supabase Edge Function "sdr-chat"  (Deno)
(src/, só fala com a função)        │
                                    ├─► Banco Postgres (sessões, mensagens, leads)
                                    ├─► IA: Gemini, OpenAI ou Claude (LLM_PROVIDER)
                                    ├─► Pipefy (cria/atualiza o card do lead)
                                    └─► Cal.com (horários livres e agendamento)
```

Regra de ouro: **o navegador nunca acessa o banco**. As tabelas estão com RLS ligado e sem política pública; só a função (com a `service_role`) lê e grava.

## 2. Onde está o quê

### Frontend (`src/`)

| Arquivo                           | Para que serve                                                                                                                                                        |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `main.tsx`, `App.tsx`             | Ponto de entrada e rotas (`/`, `/privacidade`, `*`). `App` envolve tudo no `LangProvider`.                                                                            |
| `pages/Index.tsx`                 | Página do ERP360 (cabeçalho, hero, diferenciais, módulos, etapas, planos, dúvidas, chamada final, rodapé). Só estrutura e ícones: **os textos vêm de `lib/copy.ts`**. |
| `pages/Privacidade.tsx`           | Página `/privacidade` (LGPD).                                                                                                                                         |
| `pages/NotFound.tsx`              | Página 404.                                                                                                                                                           |
| `lib/copy.ts`                     | **Todos os textos da interface, em português e inglês.** O inglês segue o tipo do português.                                                                          |
| `lib/i18n.tsx`                    | `LangProvider` e `useI18n()`. Idioma salvo em `localStorage` (`erp360_lang`); sem escolha, segue o idioma do navegador.                                               |
| `components/ChatWidget.tsx`       | O webchat: sessão, histórico, envio, erros, acessibilidade.                                                                                                           |
| `components/LangSwitch.tsx`       | Botões de idioma com as bandeiras (`public/flags/br.png` e `us.png`).                                                                                                 |
| `components/Logo.tsx`             | Marca (rosto de óculos escuros "B)"). Deve ficar igual a `public/favicon.svg`.                                                                                        |
| `components/Reveal.tsx`           | Animação de entrada ao rolar a página.                                                                                                                                |
| `lib/chat-events.ts`              | `openChat(texto?)`: qualquer botão da página abre o chat (com texto sugerido).                                                                                        |
| `integrations/supabase/client.ts` | Cliente Supabase do navegador (chave pública). Não derruba a página se faltarem as variáveis.                                                                         |
| `index.css`, `tailwind.config.ts` | Tema (cores em HSL, verde `142 59% 30%` e âmbar), utilitários (`.bg-grid`, `.text-gradient`, `.eyebrow`, `.page-container`).                                          |

Arquivos estáticos em `public/`: `favicon.svg`, `favicon.ico`, `icon-256.png`, `flags/`, `robots.txt`. O `vercel.json` manda qualquer rota para o `index.html` (necessário para `/privacidade` abrir direto).

### Backend (`supabase/functions/`)

| Arquivo                                      | Para que serve                                                                                                                             |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `sdr-chat/index.ts`                          | Liga as dependências reais (banco, IA) à rota. Único arquivo que usa `Deno.serve`.                                                         |
| `sdr-chat/handler.ts`                        | Rota HTTP: valida a entrada, aplica os limites, monta o histórico, chama o agente, grava as mensagens.                                     |
| `sdr-chat/agent.ts`                          | Ciclo modelo ↔ ferramentas (até `MAX_TOOL_ROUNDS` rodadas).                                                                                |
| `sdr-chat/tools.ts`                          | As três ferramentas do agente: `registrarLead`, `oferecerHorarios`, `agendarReuniao`, com as proteções.                                    |
| `sdr-chat/prompt.ts`                         | Prompt do agente (produto, planos, script, estilo) e a saudação.                                                                           |
| `sdr-chat/db.ts`                             | Interface `Repository` e a versão real com Supabase.                                                                                       |
| `sdr-chat/config.ts`                         | Limites: histórico (30 msgs), rodadas de ferramenta (4), tamanho da mensagem (1000), limites de uso (40/sessão/hora e 60/min global).      |
| `sdr-chat/llm/`                              | Provedores de IA: `types.ts` (interface `LlmProvider`), `gemini.ts`, `openai.ts`, `claude.ts` e `index.ts` (escolha por `LLM_PROVIDER`).   |
| `_shared/pipefy.ts`                          | Cria/atualiza o card (GraphQL). IDs dos campos em `FIELD_IDS`.                                                                             |
| `_shared/calcom.ts`                          | Horários livres e agendamento (API v2). Fuso padrão `America/Sao_Paulo`.                                                                   |
| `_shared/http.ts`                            | Utilitários HTTP e de erro.                                                                                                                |
| `pipefy-integration/`, `calcom-integration/` | Endpoints internos só para testar as integrações (exigem login).                                                                           |
| `tests/`                                     | Testes (Deno). `helpers.ts` tem o banco em memória (`MemoryRepository`) e o `FakeFetch`; `fixtures.ts` tem respostas simuladas de cada IA. |

### Banco (`supabase/migrations/`)

| Migration                                      | O que faz                                                                    |
| ---------------------------------------------- | ---------------------------------------------------------------------------- |
| `20251108162911_...sql`                        | Cria `chat_sessions`, `chat_messages` e `leads`.                             |
| `20251110000000_restringir_acesso_publico.sql` | Fecha o acesso público (RLS sem políticas). **Importante para a segurança.** |
| `20261106000000_horarios_e_limite.sql`         | Coluna `chat_sessions.offered_slots` e índice para o limite de uso.          |

Tabelas: `chat_sessions` (uma por visitante; guarda os horários oferecidos), `chat_messages` (histórico: papel e texto), `leads` (e-mail único, nome, empresa, necessidade, interesse, reunião, id do card no Pipefy).

### Outros

- `.github/workflows/ci.yml`: a cada push/PR roda `npm test` e `npm run check`.
- `supabase/config.toml`: `project_id`, `verify_jwt` e `import_map` de cada função.
- `CLAUDE.md` / `AGENTS.md`: instruções para agentes de IA (devem ter o **mesmo conteúdo**, só o título muda).

## 3. Como o agente funciona (regras que não podem quebrar)

1. **Fluxo**: apresenta o produto → pergunta empresa, dores e prazo → pergunta diretamente se quer falar com o time → só então oferece horários → só depois de o cliente escolher, agenda.
2. **Ferramentas** (nomes em português, de propósito): `registrarLead` (assim que souber nome e e-mail, e a cada dado novo), `oferecerHorarios` (só com interesse confirmado), `agendarReuniao` (só com horário escolhido).
3. **Horários**: o agendamento só aceita um horário que a própria conversa recebeu de `oferecerHorarios`. Eles ficam em `chat_sessions.offered_slots` e são repetidos no prompt, porque o histórico guarda só o texto das respostas.
4. **Leads de outra conversa**: o e-mail identifica o lead, mas não prova identidade. Se o lead veio de outra sessão, o agente só preenche campos vazios e não troca uma reunião já marcada (`protectForeignLead`).
5. **Falha externa não trava o chat**: se Pipefy ou Cal.com falharem, a ferramenta devolve `{ ok: false, erro }` ao modelo, que explica ao cliente.
6. **Gravação das mensagens**: a mensagem do usuário só é salva depois que a IA responde (evita duplicar ao tentar de novo).
7. **Limites**: 40 mensagens por sessão por hora e 60 por minuto no total. Passou, a função responde 429 com mensagem em português.
8. **Texto puro**: o chat não renderiza markdown. O prompt proíbe asteriscos, `#` e crases; listas usam hífen.
9. **Idioma**: o agente responde no idioma em que o cliente escrever (português por padrão). Em inglês, cita os preços em dólar.
10. **Troca de provedor** não pode mexer no `agent.ts`: o ciclo só conhece a interface `LlmProvider`.

## 4. Configuração e segredos

### Frontend (Vercel e `.env` local)

| Variável                        | Observação                                                     |
| ------------------------------- | -------------------------------------------------------------- |
| `VITE_SUPABASE_URL`             | `https://<project-ref>.supabase.co`                            |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Chave **pública** (anon/publishable). Pode ficar no navegador. |
| `VITE_SUPABASE_PROJECT_ID`      | Opcional.                                                      |

Na Vercel: **Settings → Environment Variables** (Production), depois **Redeploy**. Sem essas duas, a página abre mas o chat fica indisponível.

### Edge Functions (`supabase secrets set`, modelo em `supabase/.env.example`)

`LLM_PROVIDER` (`gemini`, `openai` ou `claude`), a chave do provedor (`GEMINI_API_KEY`, `OPENAI_API_KEY` ou `ANTHROPIC_API_KEY`), `*_MODEL` opcionais, `PIPEFY_API_TOKEN` e `PIPEFY_PIPE_ID`, `CAL_COM_API_KEY` e `CAL_COM_EVENT_TYPE_ID`. `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` o Supabase injeta sozinho. Sem as chaves do Pipefy e do Cal.com, o lead fica só no banco e os horários são simulados.

### Regras de segredo

- **Nunca** colocar a `service_role` (ou chave "secret") na Vercel, no `.env` do frontend ou em qualquer arquivo versionado. Só existe dentro do Supabase.
- A senha do banco e as chaves de IA/Pipefy/Cal.com **não** vão para o git nem para chats. Se vazarem, troque (Supabase: Database → Settings → reset password).
- O `.env` não é versionado (`.gitignore`).

## 5. Rotina de trabalho

Depois de **qualquer** alteração de código:

```bash
npm test          # testes das Edge Functions (sem rede, sem chaves)
npm run check     # typecheck + lint + build
npm run format    # Prettier (frontend) e deno fmt (funções), quando precisar
```

O CI repete `npm test` e `npm run check`. Convenções: 2 espaços, aspas duplas, LF, linhas de até 100 colunas. Textos de interface, prompt e erros em português (e inglês onde houver tradução); nomes de código em inglês, exceto as ferramentas do agente.

**Commits** (preferência do Bruno): autor `Bruno Rocha do Amaral <brunorochaamaral@gmail.com>` (já fixado no git local do repositório) e **sem** linha `Co-Authored-By: Claude`. Não reescrever histórico publicado sem autorização explícita.

## 6. Receitas: "mudei X, o que faço?"

### Mudei um texto, preço, plano ou prazo na página

1. Edite `src/lib/copy.ts` **nos dois idiomas** (o TypeScript avisa se faltar chave).
2. Se for plano, preço, prazo, módulo ou diferencial: edite também `supabase/functions/sdr-chat/prompt.ts` (a página e o agente precisam dizer a mesma coisa; em inglês os preços ficam em dólar).
3. `npm test` e `npm run check`.
4. Commit e push → a Vercel publica sozinha.
5. Se mexeu no `prompt.ts`: **deploy da função** (veja abaixo), senão o agente continua com o texto antigo.

### Mudei o prompt, as ferramentas ou qualquer coisa em `supabase/functions/`

1. Ajuste o código (e os testes em `tests/`, se o comportamento mudou).
2. `npm test`.
3. Commit e push (isso **não** atualiza o agente no ar).
4. Deploy da função: `npx -y supabase functions deploy sdr-chat --yes`.
5. Teste no chat do site.

### Adicionei uma migration (mudança no banco)

1. Crie um arquivo novo em `supabase/migrations/` com data/hora no nome (`AAAAMMDDHHMMSS_descricao.sql`). Nunca edite uma migration já aplicada.
2. Mantenha o RLS ligado e **sem** políticas públicas nas tabelas.
3. Atualize a interface `Repository` e o `MemoryRepository` (`tests/helpers.ts`) se o código passar a usar a coluna nova.
4. Aplique: `supabase db push --remote` (CLI 3.x; sem `--remote` ele usa o banco local). Se falhar com `cli_login_postgres`: `SUPABASE_DB_PASSWORD=... supabase db push --remote`.
5. Faça o deploy da função se ela usa a mudança.

### Quero trocar ou adicionar um provedor de IA

1. Implemente `LlmProvider` em `sdr-chat/llm/<nome>.ts` e registre em `llm/index.ts`.
2. Acrescente respostas simuladas em `tests/fixtures.ts` e testes em `providers_test.ts`/`flow_test.ts`.
3. Troque em produção só com a variável: `supabase secrets set LLM_PROVIDER=<nome>` (e a chave). Não precisa mexer em `agent.ts`.

### Quero mudar o modelo do Claude/Gemini/OpenAI

`supabase secrets set CLAUDE_MODEL=...` (ou `GEMINI_MODEL`, `OPENAI_MODEL`). Padrões: `claude-sonnet-5-5`, `gemini-2.5-flash`, `gpt-5-mini`. Não precisa de deploy de código.

### Mudei campos do Pipefy ou a integração do Cal.com

- Pipefy: os IDs dos campos estão em `_shared/pipefy.ts` (`FIELD_IDS`); o pipe precisa ter campos com esses IDs.
- Cal.com: o tipo de evento vem de `CAL_COM_EVENT_TYPE_ID`. A integração foi escrita pela documentação da API v2 e **nunca foi testada de ponta a ponta com chaves reais**.
- Deploy da função depois.

### Mudei a marca (logo/ícone)

`components/Logo.tsx` e `public/favicon.svg` devem ficar iguais. O `favicon.ico` e o `icon-256.png` vêm do ícone original do Bruno (`D:\Bruno\BrunoCentralProjetos\Resources\icone.ico`). O nome do produto continua "ERP360", sem o "B)" no texto.

### Quero adicionar um idioma novo

Acrescente o código em `Lang` e um bloco completo em `lib/copy.ts`, a bandeira em `public/flags/` e o botão em `components/LangSwitch.tsx`; ajuste `initialLang` em `lib/i18n.tsx` e o prompt (idioma e moeda).

### Mudei a estrutura do projeto ou o comportamento importante

Atualize, no mesmo commit: este arquivo, o `README.md` e o `CLAUDE.md` **e** o `AGENTS.md` (conteúdo idêntico, só o título muda).

### O site no ar não atualizou

1. Vercel → **Deployments**: o último deploy está _Ready_, _Building_ ou _Error_?
2. _Error_: leia o log. Já aconteceu por `vercel.json` inválido (use o rewrite simples `/(.*)` → `/index.html`).
3. _Ready_ e o site antigo: cache do navegador (Ctrl+Shift+R).
4. Sem deploy novo: confira em Settings → Git se a branch de produção é a `main`.

### O chat não responde

1. Variáveis `VITE_SUPABASE_*` na Vercel (e Redeploy depois de criar/alterar).
2. Projeto do Supabase pausado? (Projetos gratuitos pausam por inatividade: restaure no painel.)
3. Função publicada? `supabase functions list` e o log da função no painel.
4. Chave do provedor de IA válida e com crédito (`supabase secrets list`).
5. Erro 429: o limite de uso foi atingido (aguarde).

## 7. Estado atual e pendências (atualizado em 2026-11-06)

- **No ar**: site na Vercel (`brunorochaa-agente-sdr.vercel.app`, publica a cada push na `main`), projeto Supabase `elite-agente-sdr` com as 3 migrations aplicadas e a função `sdr-chat` publicada. O chat respondeu em produção; o fluxo completo de agendamento ainda precisa ser testado com chaves reais.
- **Pendências do dono**: trocar a senha do banco (foi colada em um chat); conferir no Table Editor se havia dado real exposto antes do RLS ser fechado; testar o agendamento de ponta a ponta.
- **Sobras do Lovable**: `bun.lockb`, `components.json` e `public/placeholder.svg` foram removidos em 2026-11-06 (nada os usava). O gerenciador de pacotes do projeto é o npm (`package-lock.json`).
- **Ideias não feitas**: ação agendada no GitHub para evitar a pausa do Supabase gratuito; imagem própria de compartilhamento (`og-image`); atualização em lote dos cards antigos do Pipefy.
- **Não verificado visualmente**: menu do celular aberto, chat aberto em tela cheia no celular e o cabeçalho ao rolar (o navegador sem tela usado nos testes não rola nem clica).

## 8. Armadilhas conhecidas

- **Windows/CRLF**: os arquivos usam LF (`.gitattributes`). Se um editor gravar CRLF, normalize antes de fazer substituições por script.
- **Supabase CLI 3.x**: `db push` precisa de `--remote`; comandos que mudam produção pedem `--yes` quando rodam em agente/script; o bundle das funções precisa do `import_map` (já está no `config.toml`).
- **Chat com altura**: a área de mensagens do `ChatWidget` precisa de `min-h-0` para rolar por dentro; sem isso o painel inteiro rola ao focar o campo.
- **Deploy de função não é automático**: o push atualiza só o site. Prompt e ferramentas só mudam no ar depois do `supabase functions deploy`.
- **Cabeçalho flutuante**: o `<header>` não captura cliques (`pointer-events-none`); só a barra interna (`pointer-events-auto`). Mantenha isso ao mexer nele.
- **Chave anon não é segredo**; `service_role` é. Confundir as duas é o erro mais grave possível aqui.
