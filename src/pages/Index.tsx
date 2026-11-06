import { ArrowRight, Check } from "lucide-react";
import { ChatWidget } from "@/components/ChatWidget";
import { openChat } from "@/lib/chat-events";
import { cn } from "@/lib/utils";

// Conteúdo alinhado ao que o agente conhece (prompt.ts): módulos, planos e prazos.

const MODULES = [
  { name: "Financeiro", text: "Contas a pagar e receber, conciliação e fluxo de caixa diário." },
  { name: "Estoque", text: "Saldo por depósito, alertas de ruptura e inventário sem planilha." },
  { name: "Vendas", text: "Pedidos, orçamentos e faturamento ligados ao estoque." },
  { name: "Compras", text: "Cotações, pedidos a fornecedores e entrada de notas." },
  { name: "RH", text: "Cadastro de colaboradores, férias e ponto em um só lugar." },
  { name: "Relatórios", text: "Indicadores de todas as áreas, atualizados na hora." },
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

function Logo() {
  return (
    <a href="#" className="flex items-center gap-2 font-semibold tracking-tight">
      <span className="grid h-7 w-7 place-items-center rounded-md bg-primary font-mono text-[10px] text-primary-foreground">
        360
      </span>
      ERP360
    </a>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
      <div className="page-container flex h-16 items-center justify-between">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#modulos" className="hover:text-foreground">
            Módulos
          </a>
          <a href="#como-funciona" className="hover:text-foreground">
            Como funciona
          </a>
          <a href="#planos" className="hover:text-foreground">
            Planos
          </a>
        </nav>
        <button
          type="button"
          onClick={() => openChat()}
          className="rounded-md border border-foreground/15 px-3.5 py-2 text-sm font-medium transition-colors hover:bg-foreground hover:text-background"
        >
          Falar com especialista
        </button>
      </div>
    </header>
  );
}

/** Painel ilustrativo do produto (dados de exemplo). */
function DashboardPreview() {
  const rows = [
    { label: "Recebido hoje", value: "R$ 48.230", delta: "+12%" },
    { label: "A pagar esta semana", value: "R$ 19.870", delta: "8 contas" },
    { label: "Pedidos em separação", value: "37", delta: "6 urgentes" },
  ];
  const stock = [
    { item: "Parafuso inox M6", qty: 120, min: 400 },
    { item: "Caixa papelão 40x30", qty: 85, min: 150 },
    { item: "Fita adesiva 45mm", qty: 640, min: 300 },
  ];

  return (
    <div className="rounded-xl border bg-card shadow-[0_1px_0_hsl(var(--border)),0_24px_48px_-24px_hsl(200_18%_12%/0.25)]">
      <div className="flex items-center justify-between border-b px-5 py-3">
        <span className="eyebrow">Resumo do dia</span>
        <span className="font-mono text-xs text-muted-foreground">exemplo</span>
      </div>

      <dl className="divide-y">
        {rows.map((row) => (
          <div key={row.label} className="flex items-baseline justify-between px-5 py-3.5">
            <dt className="text-sm text-muted-foreground">{row.label}</dt>
            <dd className="flex items-baseline gap-3">
              <span className="font-mono text-base font-medium">{row.value}</span>
              <span className="w-20 text-right text-xs text-muted-foreground">{row.delta}</span>
            </dd>
          </div>
        ))}
      </dl>

      <div className="border-t bg-muted/40 px-5 py-4">
        <p className="eyebrow mb-3">Estoque abaixo do mínimo</p>
        <ul className="space-y-2.5">
          {stock.map((s) => {
            const ratio = Math.min(s.qty / s.min, 1);
            const low = s.qty < s.min;
            return (
              <li key={s.item} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1">
                <span className="text-sm">{s.item}</span>
                <span
                  className={cn("font-mono text-xs", low ? "text-destructive" : "text-primary")}
                >
                  {s.qty}/{s.min}
                </span>
                <span className="col-span-2 h-1 overflow-hidden rounded-full bg-border">
                  <span
                    className={cn("block h-full", low ? "bg-destructive/70" : "bg-primary")}
                    style={{ width: `${ratio * 100}%` }}
                  />
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="page-container grid items-center gap-14 pb-24 pt-16 md:pt-24 lg:grid-cols-[1.15fr_1fr] xl:gap-24 xl:pb-32 xl:pt-28">
      <div>
        <p className="eyebrow mb-5">Gestão empresarial integrada</p>
        <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight md:text-[3.4rem] xl:text-[3.9rem]">
          Financeiro, estoque e vendas falando a mesma língua.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground xl:max-w-2xl xl:text-xl">
          O ERP360 junta as áreas da sua empresa num sistema só. Menos retrabalho, números
          confiáveis e relatórios prontos quando você precisa decidir.
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => openChat()}
            className="group inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Conversar com um especialista
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
          <a href="#planos" className="text-sm font-medium underline-offset-4 hover:underline">
            Ver planos e preços
          </a>
        </div>

        <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t pt-6">
          {[
            ["7–15 dias", "para implantar"],
            ["24/7", "de suporte"],
            ["6", "módulos integrados"],
          ].map(([value, label]) => (
            <div key={label}>
              <dt className="font-mono text-lg font-medium">{value}</dt>
              <dd className="mt-1 text-xs text-muted-foreground">{label}</dd>
            </div>
          ))}
        </dl>
      </div>

      <DashboardPreview />
    </section>
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
    <div className="mb-12 max-w-2xl">
      <p className="eyebrow mb-3">{eyebrow}</p>
      <h2 className="text-3xl font-semibold tracking-tight">{title}</h2>
      {text && <p className="mt-4 leading-relaxed text-muted-foreground">{text}</p>}
    </div>
  );
}

function Modules() {
  return (
    <section id="modulos" className="border-t bg-card">
      <div className="page-container py-24 xl:py-32">
        <SectionHeading
          eyebrow="Módulos"
          title="Cada área no seu lugar, todas conectadas."
          text="Uma venda baixa o estoque, gera o recebível e aparece no relatório. Sem exportar, sem copiar e colar."
        />
        <ol className="grid border-l border-t sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((module, index) => (
            <li key={module.name} className="border-b border-r p-7 xl:p-10">
              <span className="font-mono text-xs text-muted-foreground">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 font-semibold">{module.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{module.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="como-funciona" className="border-t">
      <div className="page-container py-24 xl:py-32">
        <SectionHeading eyebrow="Como funciona" title="Do primeiro contato à operação rodando." />
        <ol className="grid gap-10 md:grid-cols-3 xl:gap-16">
          {STEPS.map((step, index) => (
            <li key={step.title} className="relative border-t-2 border-foreground pt-6">
              <span className="font-mono text-xs text-muted-foreground">Etapa {index + 1}</span>
              <h3 className="mt-2 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Plans() {
  return (
    <section id="planos" className="border-t bg-card">
      <div className="page-container py-24 xl:py-32">
        <SectionHeading
          eyebrow="Planos"
          title="Preço claro, sem surpresa."
          text="Não sabe qual escolher? Conte sobre sua empresa no chat e indicamos o plano certo."
        />
        <div className="grid gap-6 lg:grid-cols-3 xl:gap-8">
          {PLANS.map((plan) => (
            <article
              key={plan.name}
              className={cn(
                "flex flex-col rounded-xl border p-7",
                plan.featured ? "border-foreground bg-foreground text-background" : "bg-background",
              )}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{plan.name}</h3>
                {plan.featured && (
                  <span className="rounded-full bg-accent px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-accent-foreground">
                    Mais escolhido
                  </span>
                )}
              </div>
              <p className="mt-6">
                <span
                  className={cn(
                    "text-3xl font-medium",
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
                  "mt-3 text-sm leading-relaxed",
                  plan.featured ? "text-background/70" : "text-muted-foreground",
                )}
              >
                {plan.text}
              </p>
              <ul className="mb-8 mt-6 space-y-2.5 text-sm">
                {plan.highlights.map((item) => (
                  <li key={item} className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => openChat(`Quero saber mais sobre o plano ${plan.name}.`)}
                className={cn(
                  "mt-auto rounded-md px-4 py-2.5 text-sm font-medium transition-colors",
                  plan.featured
                    ? "bg-background text-foreground hover:bg-background/90"
                    : "border border-foreground/15 hover:bg-foreground hover:text-background",
                )}
              >
                Falar sobre o {plan.name}
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t">
      <div className="page-container flex flex-col gap-4 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <Logo />
        <p>© {new Date().getFullYear()} ERP360. Projeto de demonstração.</p>
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
    </main>
    <Footer />
    <ChatWidget />
  </div>
);

export default Index;
