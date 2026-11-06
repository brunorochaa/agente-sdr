import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Boxes,
  Check,
  Headset,
  LayoutDashboard,
  Menu,
  Receipt,
  ShoppingCart,
  Sparkles,
  Users,
  Wallet,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { ChatWidget } from "@/components/ChatWidget";
import { Logo } from "@/components/Logo";
import { Reveal } from "@/components/Reveal";
import { openChat } from "@/lib/chat-events";
import { cn } from "@/lib/utils";

// Conteúdo alinhado ao que o agente conhece (prompt.ts): módulos, planos, prazos e diferenciais.

const MODULES: { name: string; text: string; icon: LucideIcon }[] = [
  {
    name: "Financeiro",
    text: "Contas a pagar e receber, conciliação e fluxo de caixa diário.",
    icon: Wallet,
  },
  {
    name: "Estoque",
    text: "Saldo por depósito, alertas de ruptura e inventário sem planilha.",
    icon: Boxes,
  },
  {
    name: "Vendas",
    text: "Pedidos, orçamentos e faturamento ligados ao estoque.",
    icon: Receipt,
  },
  {
    name: "Compras",
    text: "Cotações, pedidos a fornecedores e entrada de notas.",
    icon: ShoppingCart,
  },
  {
    name: "RH",
    text: "Cadastro de colaboradores, férias e ponto em um só lugar.",
    icon: Users,
  },
  {
    name: "Relatórios",
    text: "Indicadores de todas as áreas, atualizados na hora.",
    icon: BarChart3,
  },
];

const DIFFERENTIALS: { title: string; text: string; icon: LucideIcon }[] = [
  {
    title: "Interface intuitiva",
    text: "Telas simples, pensadas para o dia a dia da equipe.",
    icon: LayoutDashboard,
  },
  {
    title: "Implementação rápida",
    text: "Em 7 a 15 dias sua operação está rodando.",
    icon: Zap,
  },
  {
    title: "Suporte 24/7",
    text: "Atendimento todos os dias, a qualquer hora.",
    icon: Headset,
  },
  {
    title: "IA integrada",
    text: "Assistente com IA para tirar dúvidas e agilizar o atendimento.",
    icon: Sparkles,
  },
];

const STEPS = [
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
];

const PLANS = [
  {
    name: "Starter",
    price: "R$ 297",
    period: "/mês",
    text: "Para quem quer sair das planilhas e organizar o básico.",
    highlights: ["Financeiro, estoque e vendas", "Suporte 24/7"],
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
  },
];

const FAQ: { question: string; answer: string; privacyLink?: boolean }[] = [
  {
    question: "Quanto tempo leva para implantar?",
    answer:
      "Entre 7 e 15 dias, dependendo dos módulos e do volume de dados que precisam ser migrados. O suporte 24/7 já está incluído desde o primeiro dia.",
  },
  {
    question: "Preciso contratar todos os módulos?",
    answer:
      "Não. O Starter cobre Financeiro, Estoque e Vendas. O Professional libera todos os módulos e os relatórios avançados, e você pode crescer de plano quando precisar.",
  },
  {
    question: "Consigo trazer os dados das minhas planilhas?",
    answer:
      "Sim. Na demonstração, o especialista avalia como é a sua operação hoje e mostra como seus dados entram no ERP360.",
  },
  {
    question: "Como funciona a conversa com o assistente?",
    answer:
      "É um assistente com IA. Ele entende o momento da sua empresa, tira dúvidas sobre o produto e, se você quiser, agenda uma demonstração com o nosso time. Os dados que você informa no chat (nome, e-mail, empresa e necessidade) são usados só para esse contato comercial.",
  },
  {
    question: "O que acontece com os meus dados?",
    answer:
      "O que você escreve no chat fica guardado em um banco de dados com acesso restrito ao servidor e é usado só para preparar a conversa com o time. O navegador nunca acessa as tabelas diretamente.",
    privacyLink: true,
  },
];

const NAV_LINKS = [
  ["Módulos", "#modulos"],
  ["Como funciona", "#como-funciona"],
  ["Planos", "#planos"],
  ["Dúvidas", "#duvidas"],
  ["Agendar", "#agendar"],
];

/**
 * Flutua por cima do topo (margem negativa do tamanho dele), então o fundo do hero
 * vai até a borda da tela. No topo fica transparente; ao rolar ganha vidro fosco.
 * O <header> não captura cliques: só a barra em si (pointer-events-auto).
 */
function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Menu do celular: fecha com Esc e com clique fora dele.
  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    const onPointerDown = (event: PointerEvent) => {
      if (barRef.current && !barRef.current.contains(event.target as Node)) setMenuOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [menuOpen]);

  return (
    <header className="pointer-events-none sticky top-0 z-40 -mb-[4.25rem] h-[4.25rem] pt-3">
      <div className="page-container">
        <div
          ref={barRef}
          className={cn(
            "pointer-events-auto rounded-2xl border transition-all duration-300",
            scrolled || menuOpen
              ? "border-border bg-background/80 shadow-lg shadow-foreground/5 backdrop-blur-xl"
              : "border-transparent bg-transparent",
          )}
        >
          <div className="flex h-14 items-center justify-between px-4">
            <Logo />
            <nav
              aria-label="Principal"
              className="hidden items-center gap-1 text-sm text-muted-foreground lg:flex"
            >
              {NAV_LINKS.map(([label, href]) => (
                <a
                  key={href}
                  href={href}
                  className="rounded-lg px-3 py-1.5 transition-colors hover:bg-muted hover:text-foreground"
                >
                  {label}
                </a>
              ))}
            </nav>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => openChat()}
                className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md"
              >
                <span className="sm:hidden">Conversar</span>
                <span className="hidden sm:inline">Falar com especialista</span>
              </button>
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-expanded={menuOpen}
                aria-controls="menu-mobile"
                aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
                className="grid h-11 w-11 place-items-center rounded-xl border bg-card/70 text-foreground transition-colors hover:bg-card lg:hidden"
              >
                {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {menuOpen && (
            <nav id="menu-mobile" aria-label="Menu" className="grid gap-1 border-t p-3 lg:hidden">
              {NAV_LINKS.map(([label, href]) => (
                <a
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-3 text-sm font-medium transition-colors hover:bg-muted"
                >
                  {label}
                </a>
              ))}
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}

/** Painel ilustrativo do produto (dados de exemplo). */
function DashboardPreview() {
  const rows = [
    { label: "Recebido hoje", value: "R$ 48.230", delta: "+12%", good: true },
    { label: "A pagar esta semana", value: "R$ 19.870", delta: "8 contas" },
    { label: "Pedidos em separação", value: "37", delta: "6 urgentes" },
  ];
  const stock = [
    { item: "Parafuso inox M6", qty: 120, min: 400 },
    { item: "Caixa papelão 40x30", qty: 85, min: 150 },
    { item: "Fita adesiva 45mm", qty: 640, min: 300 },
  ];

  return (
    <div className="relative">
      {/* Cartões flutuantes: dão profundidade ao painel */}
      <div
        aria-hidden="true"
        className="absolute -top-16 right-8 z-10 hidden animate-float items-center gap-3 rounded-2xl border bg-card/90 px-4 py-3 shadow-xl backdrop-blur sm:flex"
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-primary">
          <Check className="h-4 w-4" />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-medium">Conciliação concluída</p>
          <p className="text-xs text-muted-foreground">42 lançamentos</p>
        </div>
      </div>
      <div
        aria-hidden="true"
        className="absolute -bottom-14 left-8 z-10 hidden animate-float items-center gap-3 rounded-2xl border bg-card/90 px-4 py-3 shadow-xl backdrop-blur sm:flex"
        style={{ animationDelay: "-3s" }}
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500/60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
        </span>
        <p className="text-sm font-medium">Estoque sincronizado</p>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card shadow-[0_32px_64px_-32px_hsl(200_18%_12%/0.35)]">
        <div className="flex items-center justify-between border-b bg-muted/40 px-5 py-3">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-accent/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-primary/70" />
          </div>
          <span className="eyebrow">Resumo do dia</span>
          <span className="font-mono text-xs text-muted-foreground">exemplo</span>
        </div>

        <dl className="divide-y">
          {rows.map((row) => (
            <div key={row.label} className="flex items-baseline justify-between px-5 py-4">
              <dt className="text-sm text-muted-foreground">{row.label}</dt>
              <dd className="flex items-baseline gap-3">
                <span className="font-mono text-base font-medium">{row.value}</span>
                <span
                  className={cn(
                    "text-right text-xs sm:w-20",
                    row.good ? "font-medium text-primary" : "text-muted-foreground",
                  )}
                >
                  {row.delta}
                </span>
              </dd>
            </div>
          ))}
        </dl>

        <div className="border-t bg-muted/40 px-5 py-4">
          <p className="eyebrow mb-3">Níveis de estoque</p>
          <ul className="space-y-3">
            {stock.map((s) => {
              const ratio = Math.min(s.qty / s.min, 1);
              const low = s.qty < s.min;
              return (
                <li
                  key={s.item}
                  className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1.5"
                >
                  <span className="text-sm">{s.item}</span>
                  <span
                    className={cn("font-mono text-xs", low ? "text-destructive" : "text-primary")}
                  >
                    {s.qty}/{s.min}
                  </span>
                  <span className="col-span-2 h-1.5 overflow-hidden rounded-full bg-border">
                    <span
                      className={cn(
                        "block h-full rounded-full",
                        low ? "bg-destructive/70" : "bg-primary",
                      )}
                      style={{ width: `${ratio * 100}%` }}
                    />
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <div className="relative overflow-hidden">
      {/* Fundo: grade discreta e dois brilhos desfocados (verde e âmbar) */}
      <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden="true" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 -top-24 h-[28rem] w-[28rem] rounded-full bg-primary/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-40 h-[24rem] w-[24rem] rounded-full bg-accent/20 blur-3xl"
      />

      <section
        aria-label="Apresentação"
        className="page-container relative grid items-center gap-16 pb-24 pt-28 md:pt-36 lg:grid-cols-[1.1fr_1fr] xl:gap-24 xl:pb-32 xl:pt-40"
      >
        <div>
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card/80 px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
            Sua empresa em 360°
          </p>
          <h1 className="text-4xl font-semibold leading-[1.06] tracking-tight md:text-[3.4rem] xl:text-[4rem]">
            Financeiro, estoque e vendas falando a{" "}
            <span className="text-gradient">mesma língua</span>
            <span className="text-accent">.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground xl:max-w-2xl xl:text-xl">
            O ERP360 junta as áreas da sua empresa num sistema só. Menos retrabalho, números
            confiáveis e relatórios prontos quando você precisa decidir.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => openChat()}
              className="group inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30"
            >
              Conversar com um especialista
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <a
              href="#planos"
              className="rounded-xl border bg-card/70 px-5 py-3.5 text-sm font-medium backdrop-blur transition-colors hover:bg-card"
            >
              Ver planos e preços
            </a>
          </div>

          <dl className="mt-12 grid max-w-lg grid-cols-3 gap-2 sm:gap-4">
            {[
              ["7–15 dias", "para implantar"],
              ["24/7", "de suporte"],
              ["6", "módulos integrados"],
            ].map(([value, label]) => (
              <div
                key={label}
                className="rounded-2xl border bg-card/70 px-2.5 py-3 backdrop-blur sm:px-4"
              >
                <dt className="font-mono text-sm font-medium sm:text-lg">{value}</dt>
                <dd className="mt-0.5 text-xs text-muted-foreground">{label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <DashboardPreview />
      </section>
    </div>
  );
}

/** Faixa de diferenciais: os mesmos que o agente cita no prompt. */
function Differentials() {
  return (
    <section aria-label="Diferenciais" className="border-y bg-card/60">
      <ul className="page-container grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        {DIFFERENTIALS.map((item, index) => (
          <li key={item.title}>
            <Reveal delay={index * 80} className="flex items-start gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <item.icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-sm font-semibold">{item.title}</h2>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
              </div>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}

function SectionHeading({
  id,
  eyebrow,
  title,
  text,
}: {
  id: string;
  eyebrow: string;
  title: string;
  text?: string;
}) {
  return (
    <div className="mb-14 max-w-2xl">
      <p className="mb-4 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-primary">
        <span className="h-px w-6 bg-primary" aria-hidden="true" />
        {eyebrow}
      </p>
      <h2 id={id} className="text-3xl font-semibold tracking-tight md:text-4xl">
        {title}
      </h2>
      {text && <p className="mt-4 leading-relaxed text-muted-foreground">{text}</p>}
    </div>
  );
}

function Modules() {
  return (
    <section
      id="modulos"
      aria-labelledby="modulos-titulo"
      className="scroll-mt-20 border-t bg-card/60"
    >
      <div className="page-container py-24 xl:py-32">
        <Reveal>
          <SectionHeading
            id="modulos-titulo"
            eyebrow="Módulos"
            title="Cada área no seu lugar, todas conectadas."
            text="Uma venda baixa o estoque, gera o recebível e aparece no relatório. Sem exportar, sem copiar e colar."
          />
        </Reveal>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((module, index) => (
            <li key={module.name}>
              <Reveal delay={index * 70} className="h-full">
                <article className="group relative h-full overflow-hidden rounded-2xl border bg-background p-7 transition-all duration-300 focus-within:border-primary/40 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 xl:p-9">
                  <div
                    aria-hidden="true"
                    className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
                  />
                  <span className="relative grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                    <module.icon className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <h3 className="relative mt-6 text-lg font-semibold">
                    {/* O botão se estende por todo o cartão (after:inset-0): o cartão inteiro é clicável */}
                    <button
                      type="button"
                      onClick={() => openChat(`Quero saber mais sobre o módulo ${module.name}.`)}
                      className="text-left after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
                    >
                      {module.name}
                    </button>
                  </h3>
                  <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">
                    {module.text}
                  </p>
                  <span
                    aria-hidden="true"
                    className="relative mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary"
                  >
                    Perguntar ao assistente
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </article>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section
      id="como-funciona"
      aria-labelledby="como-funciona-titulo"
      className="scroll-mt-20 border-t"
    >
      <div className="page-container py-24 xl:py-32">
        <Reveal>
          <SectionHeading
            id="como-funciona-titulo"
            eyebrow="Como funciona"
            title="Do primeiro contato à operação rodando."
          />
        </Reveal>
        <ol className="grid gap-12 md:grid-cols-3 xl:gap-16">
          {STEPS.map((step, index) => (
            <li key={step.title} className="relative">
              {/* Linha até a próxima etapa (a última não tem): vai do círculo ao círculo seguinte */}
              {index < STEPS.length - 1 && (
                <div
                  aria-hidden="true"
                  className="absolute left-16 right-[-3rem] top-6 hidden h-px bg-gradient-to-r from-primary/50 to-border md:block xl:right-[-4rem]"
                />
              )}
              <Reveal delay={index * 120}>
                <span className="relative grid h-12 w-12 place-items-center rounded-full bg-primary font-mono text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 ring-8 ring-background">
                  {index + 1}
                </span>
                <h3 className="mt-6 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                  {step.text}
                </p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Plans() {
  return (
    <section
      id="planos"
      aria-labelledby="planos-titulo"
      className="scroll-mt-20 border-t bg-card/60"
    >
      <div className="page-container py-24 xl:py-32">
        <Reveal>
          <SectionHeading
            id="planos-titulo"
            eyebrow="Planos"
            title="Preço claro, sem surpresa."
            text="Não sabe qual escolher? Conte sobre sua empresa no chat e indicamos o plano certo."
          />
        </Reveal>
        <div className="grid items-stretch gap-6 lg:grid-cols-3 xl:gap-8">
          {PLANS.map((plan, index) => (
            <Reveal key={plan.name} delay={index * 100} className="h-full">
              <article
                className={cn(
                  "relative flex h-full flex-col overflow-hidden rounded-3xl border p-8 transition-all duration-300 hover:-translate-y-1",
                  plan.featured
                    ? "border-primary/40 bg-foreground text-background shadow-2xl shadow-primary/20 lg:scale-[1.03]"
                    : "bg-background hover:shadow-xl",
                )}
              >
                {plan.featured && (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/40 blur-3xl"
                  />
                )}
                <div className="relative flex items-center justify-between">
                  <h3 className="font-semibold">{plan.name}</h3>
                  {plan.featured && (
                    <span className="rounded-full bg-accent px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-accent-foreground">
                      Recomendado
                    </span>
                  )}
                </div>
                <p className="relative mt-6">
                  <span
                    className={cn(
                      "text-4xl font-medium",
                      plan.price.startsWith("R$") && "font-mono tracking-tight",
                    )}
                  >
                    {plan.price}
                  </span>
                  <span className={plan.featured ? "text-background/60" : "text-muted-foreground"}>
                    {plan.period}
                  </span>
                </p>
                <p
                  className={cn(
                    "relative mt-3 text-sm leading-relaxed",
                    plan.featured ? "text-background/70" : "text-muted-foreground",
                  )}
                >
                  {plan.text}
                </p>
                <ul className="relative mb-8 mt-6 space-y-3 text-sm">
                  {plan.highlights.map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <span
                        className={cn(
                          "grid h-5 w-5 shrink-0 place-items-center rounded-full",
                          plan.featured ? "bg-primary/60" : "bg-primary/10 text-primary",
                        )}
                      >
                        <Check className="h-3 w-3" aria-hidden="true" />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => openChat(`Quero saber mais sobre o plano ${plan.name}.`)}
                  className={cn(
                    "relative mt-auto rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                    plan.featured
                      ? "bg-background text-foreground hover:bg-background/90"
                      : "border bg-card hover:border-primary hover:bg-primary hover:text-primary-foreground",
                  )}
                >
                  Falar sobre o {plan.name}
                </button>
              </article>
            </Reveal>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Valores de demonstração: o ERP360 é um produto fictício.
        </p>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section id="duvidas" aria-labelledby="duvidas-titulo" className="scroll-mt-20 border-t">
      <div className="page-container grid gap-12 py-24 lg:grid-cols-[1fr_1.6fr] xl:py-32">
        <Reveal>
          <SectionHeading
            id="duvidas-titulo"
            eyebrow="Dúvidas"
            title="O que costumam perguntar antes de começar."
            text="Não achou a sua? Pergunte ao assistente, ele responde em segundos."
          />
        </Reveal>
        <div className="space-y-3">
          {FAQ.map((item, index) => (
            <Reveal key={item.question} delay={index * 70}>
              <details className="group rounded-2xl border bg-card px-6 py-5 transition-colors open:border-primary/30 open:shadow-sm">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-medium [&::-webkit-details-marker]:hidden">
                  {item.question}
                  <span
                    aria-hidden="true"
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-muted font-mono text-base text-muted-foreground transition-all group-open:rotate-45 group-open:bg-primary group-open:text-primary-foreground"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  {item.answer}
                </p>
                {item.privacyLink && (
                  <Link
                    to="/privacidade"
                    className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Ler a política de privacidade
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                )}
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function CallToAction() {
  return (
    <section
      id="agendar"
      aria-labelledby="agendar-titulo"
      className="scroll-mt-20 border-t bg-card/60 py-24 xl:py-32"
    >
      <div className="page-container">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-emerald-900 px-8 py-16 text-primary-foreground shadow-2xl shadow-primary/20 sm:px-14 xl:py-24">
          {/* Anéis decorativos: lembram o ciclo de 360° da marca */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-1/2">
            {[28, 44, 60].map((size) => (
              <span
                key={size}
                className="absolute right-[-8rem] top-1/2 -translate-y-1/2 rounded-full border border-primary-foreground/10"
                style={{ height: `${size}rem`, width: `${size}rem` }}
              />
            ))}
          </div>

          <div className="relative grid items-center gap-10 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <p className="mb-4 font-mono text-xs uppercase tracking-[0.14em] text-primary-foreground/90">
                Próximo passo
              </p>
              <h2
                id="agendar-titulo"
                className="max-w-2xl text-3xl font-semibold leading-tight tracking-tight md:text-4xl"
              >
                Vamos ver o ERP360 com os números da sua empresa?
              </h2>
              <p className="mt-4 max-w-xl leading-relaxed text-primary-foreground/85">
                Converse com o assistente, conte o que hoje te atrapalha e agende uma demonstração
                com o nosso time.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                <button
                  type="button"
                  onClick={() => openChat()}
                  className="group inline-flex items-center gap-2 rounded-xl bg-background px-6 py-3.5 text-sm font-medium text-foreground shadow-lg transition-all hover:-translate-y-0.5 hover:bg-background/90"
                >
                  Agendar demonstração
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>
                <a
                  href="#planos"
                  className="group inline-flex items-center gap-1.5 text-sm font-medium text-primary-foreground underline underline-offset-4"
                >
                  Ver planos e preços
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </a>
              </div>
            </div>

            <ul className="space-y-4 text-sm lg:justify-self-end">
              {[
                "O assistente responde em segundos",
                "Demonstração baseada nos seus processos",
                "Suporte 24/7 desde o primeiro dia",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary-foreground/15">
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t">
      {/* pb extra: o botão flutuante do chat fica no canto e não pode cobrir o texto */}
      <div className="page-container pb-28 pt-14 sm:pb-24">
        <div className="grid gap-10 sm:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Gestão empresarial integrada. Financeiro, estoque e vendas falando a mesma língua.
            </p>
          </div>

          <nav aria-label="Produto">
            <p className="eyebrow mb-4">Produto</p>
            <ul className="space-y-2.5 text-sm">
              {[
                ["Módulos", "#modulos"],
                ["Como funciona", "#como-funciona"],
                ["Planos", "#planos"],
                ["Agendar demonstração", "#agendar"],
              ].map(([label, href]) => (
                <li key={href}>
                  <a href={href} className="text-muted-foreground hover:text-foreground">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Ajuda">
            <p className="eyebrow mb-4">Ajuda</p>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#duvidas" className="text-muted-foreground hover:text-foreground">
                  Dúvidas frequentes
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openChat()}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Falar com especialista
                </button>
              </li>
              <li>
                <Link to="/privacidade" className="text-muted-foreground hover:text-foreground">
                  Privacidade e LGPD
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t pt-6 text-sm text-muted-foreground sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} ERP360. Todos os direitos reservados.</p>
          <p>Projeto de demonstração: empresa e produto fictícios.</p>
        </div>
      </div>
    </footer>
  );
}

const Index = () => (
  <div className="min-h-screen">
    <a
      href="#conteudo"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
    >
      Ir para o conteúdo
    </a>
    <Header />
    <main id="conteudo" tabIndex={-1} className="outline-none">
      <Hero />
      <Differentials />
      <Modules />
      <HowItWorks />
      <Plans />
      <Faq />
      <CallToAction />
    </main>
    <Footer />
    <ChatWidget />
  </div>
);

export default Index;
