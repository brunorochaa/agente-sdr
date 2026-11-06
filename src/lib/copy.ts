// Todos os textos da página e do chat, em português e inglês.
// O inglês segue o tipo do português (`typeof pt`): se faltar uma chave, o TypeScript avisa.
// Planos, preços e prazos devem bater com supabase/functions/sdr-chat/prompt.ts.

export type Lang = "pt" | "en";

const pt = {
  htmlLang: "pt-BR",
  locale: "pt-BR",
  title: "ERP360 | Gestão empresarial integrada, sua empresa em 360°",
  nav: {
    modules: "Módulos",
    how: "Como funciona",
    plans: "Planos",
    faq: "Dúvidas",
    schedule: "Agendar",
  },
  header: {
    ctaShort: "Conversar",
    ctaLong: "Falar com especialista",
    openMenu: "Abrir menu",
    closeMenu: "Fechar menu",
    mainNav: "Principal",
    menu: "Menu",
    skip: "Ir para o conteúdo",
    langLabel: "Idioma",
  },
  hero: {
    aria: "Apresentação",
    badge: "Sua empresa em 360°",
    titleStart: "Financeiro, estoque e vendas falando a",
    titleHighlight: "mesma língua",
    text: "O ERP360 junta as áreas da sua empresa num sistema só. Menos retrabalho, números confiáveis e relatórios prontos quando você precisa decidir.",
    cta: "Conversar com um especialista",
    secondary: "Ver planos e preços",
    stats: [
      ["7–15 dias", "para implantar"],
      ["24/7", "de suporte"],
      ["6", "módulos integrados"],
    ],
  },
  dashboard: {
    title: "Resumo do dia",
    sample: "exemplo",
    rows: [
      { label: "Recebido hoje", value: "R$ 48.230", delta: "+12%", good: true },
      { label: "A pagar esta semana", value: "R$ 19.870", delta: "8 contas", good: false },
      { label: "Pedidos em separação", value: "37", delta: "6 urgentes", good: false },
    ],
    stockTitle: "Níveis de estoque",
    stock: [
      { item: "Parafuso inox M6", qty: 120, min: 400 },
      { item: "Caixa papelão 40x30", qty: 85, min: 150 },
      { item: "Fita adesiva 45mm", qty: 640, min: 300 },
    ],
    chipReconciled: "Conciliação concluída",
    chipReconciledSub: "42 lançamentos",
    chipStock: "Estoque sincronizado",
  },
  differentials: {
    aria: "Diferenciais",
    items: [
      { title: "Interface intuitiva", text: "Telas simples, pensadas para o dia a dia da equipe." },
      { title: "Implementação rápida", text: "Em 7 a 15 dias sua operação está rodando." },
      { title: "Suporte 24/7", text: "Atendimento todos os dias, a qualquer hora." },
      {
        title: "IA integrada",
        text: "Assistente com IA para tirar dúvidas e agilizar o atendimento.",
      },
    ],
  },
  modules: {
    eyebrow: "Módulos",
    title: "Cada área no seu lugar, todas conectadas.",
    text: "Uma venda baixa o estoque, gera o recebível e aparece no relatório. Sem exportar, sem copiar e colar.",
    ask: "Perguntar ao assistente",
    draft: (name: string) => `Quero saber mais sobre o módulo ${name}.`,
    items: [
      {
        name: "Financeiro",
        text: "Contas a pagar e receber, conciliação e fluxo de caixa diário.",
      },
      {
        name: "Estoque",
        text: "Saldo por depósito, alertas de ruptura e inventário sem planilha.",
      },
      { name: "Vendas", text: "Pedidos, orçamentos e faturamento ligados ao estoque." },
      { name: "Compras", text: "Cotações, pedidos a fornecedores e entrada de notas." },
      { name: "RH", text: "Cadastro de colaboradores, férias e ponto em um só lugar." },
      { name: "Relatórios", text: "Indicadores de todas as áreas, atualizados na hora." },
    ],
  },
  how: {
    eyebrow: "Como funciona",
    title: "Do primeiro contato à operação rodando.",
    steps: [
      {
        title: "Conversa inicial",
        text: "Nosso assistente entende o momento da sua empresa e agenda com o time.",
      },
      {
        title: "Demonstração",
        text: "Um especialista mostra o ERP360 com base nos processos que você descreveu.",
      },
      {
        title: "Implantação",
        text: "Em 7 a 15 dias sua operação está rodando, com suporte 24/7 desde o início.",
      },
    ],
  },
  plans: {
    eyebrow: "Planos",
    title: "Preço claro, sem surpresa.",
    text: "Não sabe qual escolher? Conte sobre sua empresa no chat e indicamos o plano certo.",
    recommended: "Recomendado",
    cta: (name: string) => `Falar sobre o ${name}`,
    draft: (name: string) => `Quero saber mais sobre o plano ${name}.`,
    note: "Valores de demonstração: o ERP360 é um produto fictício.",
    items: [
      {
        name: "Starter",
        price: "R$ 297",
        period: "/mês",
        text: "Para quem quer sair das planilhas e organizar o básico.",
        highlights: ["Financeiro, estoque e vendas", "Suporte 24/7"],
        featured: false,
      },
      {
        name: "Professional",
        price: "R$ 597",
        period: "/mês",
        text: "Para empresas em crescimento, com várias áreas conectadas.",
        highlights: ["Todos os módulos", "Relatórios avançados", "Suporte 24/7"],
        featured: true,
      },
      {
        name: "Enterprise",
        price: "Sob consulta",
        period: "",
        text: "Para operações com volume alto ou necessidades específicas.",
        highlights: ["Tudo do Professional", "Implantação dedicada"],
        featured: false,
      },
    ],
  },
  faq: {
    eyebrow: "Dúvidas",
    title: "O que costumam perguntar antes de começar.",
    text: "Não achou a sua? Pergunte ao assistente, ele responde em segundos.",
    privacyLink: "Ler a política de privacidade",
    items: [
      {
        question: "Quanto tempo leva para implantar?",
        answer:
          "Entre 7 e 15 dias, dependendo dos módulos e do volume de dados que precisam ser migrados. O suporte 24/7 já está incluído desde o primeiro dia.",
        privacy: false,
      },
      {
        question: "Preciso contratar todos os módulos?",
        answer:
          "Não. O Starter cobre Financeiro, Estoque e Vendas. O Professional libera todos os módulos e os relatórios avançados, e você pode crescer de plano quando precisar.",
        privacy: false,
      },
      {
        question: "Consigo trazer os dados das minhas planilhas?",
        answer:
          "Sim. Na demonstração, o especialista avalia como é a sua operação hoje e mostra como seus dados entram no ERP360.",
        privacy: false,
      },
      {
        question: "Como funciona a conversa com o assistente?",
        answer:
          "É um assistente com IA. Ele entende o momento da sua empresa, tira dúvidas sobre o produto e, se você quiser, agenda uma demonstração com o nosso time. Os dados que você informa no chat (nome, e-mail, empresa e necessidade) são usados só para esse contato comercial.",
        privacy: false,
      },
      {
        question: "O que acontece com os meus dados?",
        answer:
          "O que você escreve no chat fica guardado em um banco de dados com acesso restrito ao servidor e é usado só para preparar a conversa com o time. O navegador nunca acessa as tabelas diretamente.",
        privacy: true,
      },
    ],
  },
  cta: {
    aria: "Próximo passo",
    eyebrow: "Próximo passo",
    title: "Vamos ver o ERP360 com os números da sua empresa?",
    text: "Converse com o assistente, conte o que hoje te atrapalha e agende uma demonstração com o nosso time.",
    button: "Agendar demonstração",
    plansLink: "Ver planos e preços",
    bullets: [
      "O assistente responde em segundos",
      "Demonstração baseada nos seus processos",
      "Suporte 24/7 desde o primeiro dia",
    ],
  },
  footer: {
    tagline: "Gestão empresarial integrada. Financeiro, estoque e vendas falando a mesma língua.",
    product: "Produto",
    help: "Ajuda",
    schedule: "Agendar demonstração",
    faq: "Dúvidas frequentes",
    talk: "Falar com especialista",
    privacy: "Privacidade e LGPD",
    rights: "Todos os direitos reservados.",
    demo: "Projeto de demonstração: empresa e produto fictícios.",
  },
  chat: {
    welcome:
      "Olá! Sou o assistente virtual da ERP360. Como posso ajudar você hoje com a gestão da sua empresa?",
    suggestions: [
      "Quero conhecer os planos",
      "Meu estoque vive desatualizado",
      "Quero agendar uma demonstração",
    ],
    launcher: "Falar com especialista",
    dialog: "Chat com especialista ERP360",
    name: "Assistente ERP360",
    fast: "Responde em segundos",
    close: "Fechar chat",
    typing: "Assistente digitando",
    failed: "Não enviada. Tentar de novo",
    rateLimited: "Muitas mensagens em pouco tempo. Aguarde um pouco e tente de novo.",
    placeholder: "Escreva sua mensagem",
    messageLabel: "Mensagem",
    send: "Enviar mensagem",
    disclaimer:
      "Assistente com IA. Nome, e-mail e o que você contar aqui são usados só para o contato comercial.",
    privacy: "Privacidade",
  },
  privacy: {
    title: "Privacidade | ERP360",
    eyebrow: "Privacidade e LGPD",
    heading: "Como tratamos os seus dados",
    back: "Voltar ao site",
    sections: [
      {
        title: "Quais dados coletamos",
        text: "Só o que você escreve no chat: mensagens, nome, e-mail, empresa, necessidade e prazo. Se agendar uma demonstração, guardamos também o horário e o link da reunião.",
      },
      {
        title: "Para que usamos",
        text: "Para responder suas perguntas, preparar a conversa com o time comercial e agendar a demonstração. Não usamos os dados para outra finalidade.",
      },
      {
        title: "Com quem compartilhamos",
        text: "Com os serviços que fazem o chat funcionar: Supabase (banco de dados), o provedor de IA configurado (Gemini, OpenAI ou Claude), Pipefy (registro do lead) e Cal.com (agenda). As mensagens são enviadas ao provedor de IA para gerar as respostas.",
      },
      {
        title: "Como protegemos",
        text: "O navegador nunca acessa as tabelas do banco: tudo passa por uma função no servidor, e as tabelas não têm acesso público. Há limite de mensagens por sessão para evitar abuso.",
      },
      {
        title: "Seus direitos (LGPD)",
        text: "Você pode pedir acesso, correção ou exclusão dos seus dados a qualquer momento, pelo próprio chat ou falando com o time comercial.",
      },
      {
        title: "Projeto de demonstração",
        text: "O ERP360 é um produto fictício, criado como desafio técnico. Evite informar dados sensíveis ou reais além do necessário para testar o chat.",
      },
    ],
  },
  notFound: {
    eyebrow: "Erro 404",
    title: "Página não encontrada",
    text: "O endereço pode ter mudado ou não existe mais.",
    back: "Voltar para o início",
  },
};

export type Copy = typeof pt;

const en: Copy = {
  htmlLang: "en",
  locale: "en-US",
  title: "ERP360 | Integrated business management, your company in 360°",
  nav: {
    modules: "Modules",
    how: "How it works",
    plans: "Plans",
    faq: "FAQ",
    schedule: "Book a demo",
  },
  header: {
    ctaShort: "Chat",
    ctaLong: "Talk to an expert",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    mainNav: "Main",
    menu: "Menu",
    skip: "Skip to content",
    langLabel: "Language",
  },
  hero: {
    aria: "Introduction",
    badge: "Your company in 360°",
    titleStart: "Finance, inventory and sales speaking the",
    titleHighlight: "same language",
    text: "ERP360 brings every area of your company into a single system. Less rework, numbers you can trust and reports ready when you need to decide.",
    cta: "Talk to an expert",
    secondary: "See plans and pricing",
    stats: [
      ["7–15 days", "to go live"],
      ["24/7", "support"],
      ["6", "integrated modules"],
    ],
  },
  dashboard: {
    title: "Today's summary",
    sample: "sample",
    rows: [
      { label: "Received today", value: "R$ 48,230", delta: "+12%", good: true },
      { label: "Payable this week", value: "R$ 19,870", delta: "8 bills", good: false },
      { label: "Orders being picked", value: "37", delta: "6 urgent", good: false },
    ],
    stockTitle: "Stock levels",
    stock: [
      { item: "M6 stainless screw", qty: 120, min: 400 },
      { item: "Cardboard box 40x30", qty: 85, min: 150 },
      { item: "Tape 45mm", qty: 640, min: 300 },
    ],
    chipReconciled: "Reconciliation done",
    chipReconciledSub: "42 entries",
    chipStock: "Inventory in sync",
  },
  differentials: {
    aria: "Highlights",
    items: [
      { title: "Intuitive interface", text: "Simple screens built for your team's daily routine." },
      { title: "Fast implementation", text: "Up and running in 7 to 15 days." },
      { title: "24/7 support", text: "Help every day, at any hour." },
      { title: "Built-in AI", text: "An AI assistant to answer questions and speed up support." },
    ],
  },
  modules: {
    eyebrow: "Modules",
    title: "Every area in its place, all connected.",
    text: "A sale updates inventory, creates the receivable and shows up in the report. No exporting, no copy and paste.",
    ask: "Ask the assistant",
    draft: (name: string) => `I would like to know more about the ${name} module.`,
    items: [
      {
        name: "Finance",
        text: "Accounts payable and receivable, reconciliation and daily cash flow.",
      },
      {
        name: "Inventory",
        text: "Stock by warehouse, stock-out alerts and spreadsheet-free counts.",
      },
      { name: "Sales", text: "Orders, quotes and invoicing tied to inventory." },
      { name: "Purchasing", text: "Quotes, supplier orders and invoice intake." },
      { name: "HR", text: "Employee records, vacations and time tracking in one place." },
      { name: "Reports", text: "Indicators from every area, updated in real time." },
    ],
  },
  how: {
    eyebrow: "How it works",
    title: "From first contact to a running operation.",
    steps: [
      {
        title: "First conversation",
        text: "Our assistant learns where your company is today and books time with the team.",
      },
      {
        title: "Demo",
        text: "An expert shows ERP360 based on the processes you described.",
      },
      {
        title: "Implementation",
        text: "In 7 to 15 days your operation is running, with 24/7 support from day one.",
      },
    ],
  },
  plans: {
    eyebrow: "Plans",
    title: "Clear pricing, no surprises.",
    text: "Not sure which one to pick? Tell us about your company in the chat and we will suggest the right plan.",
    recommended: "Recommended",
    cta: (name: string) => `Talk about ${name}`,
    draft: (name: string) => `I would like to know more about the ${name} plan.`,
    note: "Demo prices: ERP360 is a fictional product.",
    items: [
      {
        name: "Starter",
        price: "R$ 297",
        period: "/month",
        text: "For teams leaving spreadsheets behind and organizing the basics.",
        highlights: ["Finance, inventory and sales", "24/7 support"],
        featured: false,
      },
      {
        name: "Professional",
        price: "R$ 597",
        period: "/month",
        text: "For growing companies with several connected areas.",
        highlights: ["All modules", "Advanced reports", "24/7 support"],
        featured: true,
      },
      {
        name: "Enterprise",
        price: "Custom",
        period: "",
        text: "For high-volume operations or specific needs.",
        highlights: ["Everything in Professional", "Dedicated implementation"],
        featured: false,
      },
    ],
  },
  faq: {
    eyebrow: "FAQ",
    title: "What people usually ask before getting started.",
    text: "Can't find yours? Ask the assistant, it answers in seconds.",
    privacyLink: "Read the privacy policy",
    items: [
      {
        question: "How long does implementation take?",
        answer:
          "Between 7 and 15 days, depending on the modules and how much data needs to be migrated. 24/7 support is included from day one.",
        privacy: false,
      },
      {
        question: "Do I have to buy every module?",
        answer:
          "No. Starter covers Finance, Inventory and Sales. Professional unlocks all modules and advanced reports, and you can move up a plan whenever you need.",
        privacy: false,
      },
      {
        question: "Can I bring in my spreadsheet data?",
        answer:
          "Yes. During the demo, the expert looks at how your operation works today and shows how your data fits into ERP360.",
        privacy: false,
      },
      {
        question: "How does the assistant chat work?",
        answer:
          "It is an AI assistant. It learns where your company is today, answers product questions and, if you want, books a demo with our team. What you share in the chat (name, email, company and needs) is used only for that sales contact.",
        privacy: false,
      },
      {
        question: "What happens to my data?",
        answer:
          "What you write in the chat is stored in a database that only the server can access, and it is used only to prepare the conversation with the team. The browser never reads the tables directly.",
        privacy: true,
      },
    ],
  },
  cta: {
    aria: "Next step",
    eyebrow: "Next step",
    title: "Shall we see ERP360 with your company's numbers?",
    text: "Chat with the assistant, tell us what gets in your way today and book a demo with our team.",
    button: "Book a demo",
    plansLink: "See plans and pricing",
    bullets: [
      "The assistant answers in seconds",
      "A demo based on your processes",
      "24/7 support from day one",
    ],
  },
  footer: {
    tagline:
      "Integrated business management. Finance, inventory and sales speaking the same language.",
    product: "Product",
    help: "Help",
    schedule: "Book a demo",
    faq: "Frequently asked questions",
    talk: "Talk to an expert",
    privacy: "Privacy",
    rights: "All rights reserved.",
    demo: "Demo project: fictional company and product.",
  },
  chat: {
    welcome:
      "Hi! I am the ERP360 virtual assistant. How can I help you with managing your company today?",
    suggestions: [
      "I would like to see the plans",
      "My inventory is always out of date",
      "I would like to book a demo",
    ],
    launcher: "Talk to an expert",
    dialog: "Chat with an ERP360 expert",
    name: "ERP360 Assistant",
    fast: "Replies in seconds",
    close: "Close chat",
    typing: "Assistant is typing",
    failed: "Not sent. Try again",
    rateLimited: "Too many messages in a short time. Please wait a moment and try again.",
    placeholder: "Write your message",
    messageLabel: "Message",
    send: "Send message",
    disclaimer:
      "AI assistant. Your name, email and what you share here are used only for the sales contact.",
    privacy: "Privacy",
  },
  privacy: {
    title: "Privacy | ERP360",
    eyebrow: "Privacy",
    heading: "How we handle your data",
    back: "Back to the site",
    sections: [
      {
        title: "What data we collect",
        text: "Only what you write in the chat: messages, name, email, company, needs and timeline. If you book a demo, we also store the time and the meeting link.",
      },
      {
        title: "What we use it for",
        text: "To answer your questions, prepare the conversation with the sales team and book the demo. We do not use the data for any other purpose.",
      },
      {
        title: "Who we share it with",
        text: "With the services that make the chat work: Supabase (database), the configured AI provider (Gemini, OpenAI or Claude), Pipefy (lead record) and Cal.com (scheduling). Your messages are sent to the AI provider to generate replies.",
      },
      {
        title: "How we protect it",
        text: "The browser never reads the database tables: everything goes through a server-side function, and the tables have no public access. There is a message limit per session to prevent abuse.",
      },
      {
        title: "Your rights",
        text: "You can ask for access, correction or deletion of your data at any time, through the chat itself or by talking to the sales team. The site follows Brazil's data protection law (LGPD).",
      },
      {
        title: "Demo project",
        text: "ERP360 is a fictional product built as a technical challenge. Avoid sharing sensitive or real data beyond what is needed to try the chat.",
      },
    ],
  },
  notFound: {
    eyebrow: "Error 404",
    title: "Page not found",
    text: "The address may have changed or no longer exists.",
    back: "Back to home",
  },
};

export const copy: Record<Lang, Copy> = { pt, en };
