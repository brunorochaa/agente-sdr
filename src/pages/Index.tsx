import {
  ArrowRight,
  BarChart3,
  Boxes,
  Check,
  Receipt,
  ShoppingCart,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { ChatWidget } from "@/components/ChatWidget";
import { Logo } from "@/components/Logo";
import { Reveal } from "@/components/Reveal";
import { openChat } from "@/lib/chat-events";
import { cn } from "@/lib/utils";

// Conteúdo alinhado ao que o agente conhece (prompt.ts): módulos, planos e prazos.

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

const FAQ = [
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
];

function Header() {
  return (
    <header className="sticky top-0 z-40 pt-3">
      <div className="page-container">
        <div className="flex h-14 items-center justify-between rounded-2xl border bg-background/70 px-4 shadow-sm backdrop-blur-xl">
          <Logo />
          <nav className="hidden items-center gap-1 text-sm text-muted-foreground md:flex">
            {[
              ["Módulos", "#modulos"],
              ["Como funciona", "#como-funciona"],
              ["Planos", "#planos"],
              ["Dúvidas", "#duvidas"],
            ].map(([label, href]) => (
              <a
                key={href}
                href={href}
                className="rounded-lg px-3 py-1.5 transition-colors hover:bg-muted hover:text-foreground"
              >
                {label}
              </a>
            ))}
          </nav>
          <button
            type="button"
            onClick={() => openChat()}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md"
          >
            <span className="sm:hidden">Conversar</span>
            <span className="hidden sm:inline">Falar com especialista</span>
          </button>
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
      <div className="absolute -top-16 right-8 z-10 hidden animate-float items-center gap-3 rounded-2xl border bg-card/90 px-4 py-3 shadow-xl backdrop-blur sm:flex">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-primary">
          <Check className="h-4 w-4" />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-medium">Conciliação concluída</p>
          <p className="text-xs text-muted-foreground">42 lançamentos</p>
        </div>
      </div>
      <div
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
          <p className="eyebrow mb-3">Estoque abaixo do mínimo</p>
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

      <section className="page-container relative grid items-center gap-16 pb-24 pt-16 md:pt-24 lg:grid-cols-[1.1fr_1fr] xl:gap-24 xl:pb-32 xl:pt-28">
        <div>
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card/80 px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent/70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            Sua empresa em 360°
          </p>
          <h1 className="text-4xl font-semibold leading-[1.06] tracking-tight md:text-[3.4rem] xl:text-[4rem]">
            Financeiro, estoque e vendas falando a{" "}
            <span className="text-gradient">mesma língua.</span>
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
                className="rounded-2xl border bg-card/70 px-3 py-3 backdrop-blur sm:px-4"
              >
                <dt className="whitespace-nowrap font-mono text-[0.95rem] font-medium sm:text-lg">
                  {value}
                </dt>
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

function SectionHeading({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text?: string;
}) {
  return (
    <div className="mb-14 max-w-2xl">
      <p className="mb-4 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-primary">
        <span className="h-px w-6 bg-primary" />
        {eyebrow}
      </p>
      <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">{title}</h2>
      {text && <p className="mt-4 leading-relaxed text-muted-foreground">{text}</p>}
    </div>
  );
}

function Modules() {
  return (
    <section id="modulos" className="border-t bg-card/60">
      <div className="page-container py-24 xl:py-32">
        <Reveal>
          <SectionHeading
            eyebrow="Módulos"
            title="Cada área no seu lugar, todas conectadas."
            text="Uma venda baixa o estoque, gera o recebível e aparece no relatório. Sem exportar, sem copiar e colar."
          />
        </Reveal>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((module, index) => (
            <li key={module.name}>
              <Reveal delay={index * 70} className="h-full">
                <article className="group relative h-full overflow-hidden rounded-2xl border bg-background p-7 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 xl:p-9">
                  <div
                    aria-hidden="true"
                    className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
                  />
                  <span className="relative grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                    <module.icon className="h-6 w-6" strokeWidth={1.75} />
                  </span>
                  <h3 className="relative mt-6 text-lg font-semibold">{module.name}</h3>
                  <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">
                    {module.text}
                  </p>
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
    <section id="como-funciona" className="border-t">
      <div className="page-container py-24 xl:py-32">
        <Reveal>
          <SectionHeading eyebrow="Como funciona" title="Do primeiro contato à operação rodando." />
        </Reveal>
        <div className="relative">
          {/* Linha que liga as três etapas */}
          <div
            aria-hidden="true"
            className="absolute left-6 right-6 top-6 hidden h-px bg-gradient-to-r from-primary/50 via-border to-primary/50 md:block"
          />
          <ol className="grid gap-12 md:grid-cols-3 xl:gap-16">
            {STEPS.map((step, index) => (
              <li key={step.title}>
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
      </div>
    </section>
  );
}

function Plans() {
  return (
    <section id="planos" className="border-t bg-card/60">
      <div className="page-container py-24 xl:py-32">
        <Reveal>
          <SectionHeading
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
                      Mais escolhido
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
                        <Check className="h-3 w-3" />
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
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section id="duvidas" className="border-t">
      <div className="page-container grid gap-12 py-24 lg:grid-cols-[1fr_1.6fr] xl:py-32">
        <Reveal>
          <SectionHeading
            eyebrow="Dúvidas"
            title="O que costumam perguntar antes de começar."
            text="Não achou a sua? Pergunte ao assistente, ele responde em segundos."
          />
        </Reveal>
        <div className="space-y-3">
          {FAQ.map((item, index) => (
            <Reveal key={item.question} delay={index * 70}>
              <details className="group rounded-2xl border bg-card px-6 py-5 transition-colors open:border-primary/30 open:shadow-sm">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-medium">
                  {item.question}
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-muted font-mono text-base text-muted-foreground transition-all group-open:rotate-45 group-open:bg-primary group-open:text-primary-foreground">
                    +
                  </span>
                </summary>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  {item.answer}
                </p>
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
    <section className="pb-24">
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
              <p className="mb-4 font-mono text-xs uppercase tracking-[0.14em] text-primary-foreground/70">
                Próximo passo
              </p>
              <h2 className="max-w-2xl text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
                Vamos ver o ERP360 com os números da sua empresa?
              </h2>
              <p className="mt-4 max-w-xl leading-relaxed text-primary-foreground/80">
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
                  className="text-sm font-medium text-primary-foreground/90 underline-offset-4 hover:underline"
                >
                  Ver planos e preços
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
                    <Check className="h-3.5 w-3.5" />
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
  const columns = [
    {
      title: "Produto",
      links: [
        ["Módulos", "#modulos"],
        ["Como funciona", "#como-funciona"],
        ["Planos", "#planos"],
      ],
    },
    {
      title: "Ajuda",
      links: [["Dúvidas frequentes", "#duvidas"]],
    },
  ];

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

          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <p className="eyebrow mb-4">{column.title}</p>
              <ul className="space-y-2.5 text-sm">
                {column.links.map(([label, href]) => (
                  <li key={href}>
                    <a href={href} className="text-muted-foreground hover:text-foreground">
                      {label}
                    </a>
                  </li>
                ))}
                {column.title === "Ajuda" && (
                  <li>
                    <button
                      type="button"
                      onClick={() => openChat()}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Falar com especialista
                    </button>
                  </li>
                )}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t pt-6 text-xs text-muted-foreground sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} ERP360. Todos os direitos reservados.</p>
          <p>Projeto de demonstração: empresa e produto fictícios.</p>
        </div>
      </div>
    </footer>
  );
}

const Index = () => (
  <div className="min-h-screen">
    <Header />
    <main>
      <Hero />
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
