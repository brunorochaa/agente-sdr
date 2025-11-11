# 💼 Agente SDR Automatizado - ERP360

Sistema de pré-vendas automatizado que:
- ✅ Conduz conversas naturais para qualificar leads  
- ✅ Coleta informações como nome, email, empresa e necessidade  
- ✅ Identifica interesse e agenda reuniões automaticamente  
- ✅ Integra com Pipefy para gestão de leads  
- ✅ Integra com Cal.com para agendamento  

---

## 🎯 Funcionalidades

### Chat Inteligente
- Interface responsiva e acessível  
- Conversas persistentes (localStorage + banco de dados)  
- Sessões identificadas por ID anônimo  
- Visual moderno, inspirado em ferramentas como Intercom e Drift  

### Assistente de Vendas
- Baseado em Supabase  
- Executa ações automáticas:
  - `registrarLead`: grava no banco e Pipefy  
  - `oferecerHorarios`: busca horários disponíveis  
  - `agendarReuniao`: agenda via Cal.com  

### Integrações
- **Pipefy**: armazena e organiza os leads no funil  
- **Cal.com**: agenda reuniões em tempo real  
- **Supabase**: backend completo com banco e funções  

---

## 🚀 Como Testar

1. **Abra o chat** (ícone no canto inferior direito)  
2. **Converse com o assistente**:
   - Ele se apresenta  
   - Faz perguntas sobre sua empresa e necessidade  
   - Verifica interesse na solução  
3. **Agende uma reunião**:
   - Se houver interesse, ele mostra horários  
   - Você escolhe um  
   - O link da reunião é enviado automaticamente  

---

## ⚙️ Configuração das Integrações

### Pipefy
1. Crie um token em: [https://app.pipefy.com/tokens](https://app.pipefy.com/tokens)  
2. O token deve estar em `PIPEFY_API_TOKEN`  
3. Edite `supabase/functions/pipefy-integration/index.ts`:
   - Linha 22: substitua `PIPE_ID` pelo ID do funil  
   - Ajuste os `field_id` conforme os campos do seu pipe  

### Cal.com
1. Crie uma chave de API em: [https://cal.com/settings/developer/api-keys](https://cal.com/settings/developer/api-keys)  
2. Configure em `CAL_COM_API_KEY`  
3. Edite `supabase/functions/calcom-integration/index.ts`:
   - Linha 43: substitua `EVENT_TYPE_ID` pelo tipo de evento  
   - Ative as linhas 46–53 para usar a API real  

---

## 📊 Banco de Dados

**Tabelas principais:**
- `chat_sessions`: sessões dos usuários  
- `chat_messages`: histórico de mensagens  
- `leads`: informações e status dos contatos  

**Segurança:**  
Todas as tabelas têm políticas públicas (read/write) para permitir uso sem autenticação.

---

## 🎨 Design

- **Cor primária:** azul profissional (#2563eb)  
- **Cor de destaque:** verde sucesso (#10b981)  
- **Fonte:** sans-serif moderna  
- **Transições:** suaves, com animações leves  
- **Sombras:** sutis, para dar profundidade  

---

## 🔧 Tecnologias

### Frontend
- React + TypeScript  
- Tailwind CSS  
- Shadcn UI  
- React Query  

### Backend
- Supabase (PostgreSQL)  
- Edge Functions (Deno)  

### Integrações
- Pipefy GraphQL API  
- Cal.com REST API  

---

## 💬 Fluxo do Assistente

1. **Apresentação:** cumprimenta e oferece ajuda  
2. **Descoberta:** entende o cenário da empresa  
3. **Qualificação:** identifica dores e urgência  
4. **Confirmação:** valida o interesse  
5. **Agendamento:** oferece horários e agenda  

**Tom de voz:**
- Natural e profissional  
- Empático e direto  
- Sempre uma pergunta por vez  

---

## 🔐 Segurança

- Segredos gerenciados via Supabase  
- Nenhuma chave exposta no frontend  
- RLS policies ativas  
- Validação de entradas em todas as rotas  

---

## 📈 Próximos Passos

1. ✅ Configurar IDs reais do Pipefy e Cal.com  
2. ✅ Testar o fluxo completo  
3. ✅ Ajustar mensagens conforme feedback  
4. ⬜ Adicionar métricas de conversão  
5. ⬜ Enviar notificações por e-mail  
6. ⬜ Criar dashboard para leads  

---

## 🤝 Suporte

Se precisar ajustar algo:  
1. Acesse o backend: <lov-actions><lov-open-backend>Ver Backend</lov-open-backend></lov-actions>  
2. Confira os logs das funções  
3. Verifique as tabelas de dados  

---

## 📚 Referências

- [Supabase](https://supabase.com/docs)  
- [Pipefy API](https://developers.pipefy.com/)  
- [Cal.com API](https://cal.com/docs/api-reference)  

---