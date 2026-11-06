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
import { LangSwitch } from "@/components/LangSwitch";
import { Logo } from "@/components/Logo";
import { Reveal } from "@/components/Reveal";
import { openChat } from "@/lib/chat-events";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

// Os textos ficam em src/lib/copy.ts (pt e en). Aqui só os ícones, na mesma ordem das listas de lá.

const MODULE_ICONS: LucideIcon[] = [Wallet, Boxes, Receipt, ShoppingCart, Users, BarChart3];
const DIFFERENTIAL_ICONS: LucideIcon[] = [LayoutDashboard, Zap, Headset, Sparkles];

/**
 * Flutua por cima do topo (margem negativa do tamanho dele), então o fundo do hero
 * vai até a borda da tela. No topo fica transparente; ao rolar ganha vidro fosco.
 * O <header> não captura cliques: só a barra em si (pointer-events-auto).
 */
function Header() {
  const { t } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    [t.nav.modules, "#modulos"],
    [t.nav.how, "#como-funciona"],
    [t.nav.plans, "#planos"],
    [t.nav.faq, "#duvidas"],
    [t.nav.schedule, "#agendar"],
  ];

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
          <div className="flex h-14 items-center justify-between gap-3 px-4">
            <Logo />
            <nav
              aria-label={t.header.mainNav}
              className="hidden items-center gap-1 text-sm text-muted-foreground lg:flex"
            >
              {navLinks.map(([label, href]) => (
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
              <LangSwitch />
              <button
                type="button"
                onClick={() => openChat()}
                className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md"
              >
                <span className="md:hidden">{t.header.ctaShort}</span>
                <span className="hidden md:inline">{t.header.ctaLong}</span>
              </button>
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-expanded={menuOpen}
                aria-controls="menu-mobile"
                aria-label={menuOpen ? t.header.closeMenu : t.header.openMenu}
                className="grid h-11 w-11 place-items-center rounded-xl border bg-card/70 text-foreground transition-colors hover:bg-card lg:hidden"
              >
                {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {menuOpen && (
            <nav
              id="menu-mobile"
              aria-label={t.header.menu}
              className="grid gap-1 border-t p-3 lg:hidden"
            >
              {navLinks.map(([label, href]) => (
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
  const { t } = useI18n();
  const d = t.dashboard;

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
          <p className="text-sm font-medium">{d.chipReconciled}</p>
          <p className="text-xs text-muted-foreground">{d.chipReconciledSub}</p>
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
        <p className="text-sm font-medium">{d.chipStock}</p>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card shadow-[0_32px_64px_-32px_hsl(200_18%_12%/0.35)]">
        <div className="flex items-center justify-between border-b bg-muted/40 px-5 py-3">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-accent/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-primary/70" />
          </div>
          <span className="eyebrow">{d.title}</span>
          <span className="font-mono text-xs text-muted-foreground">{d.sample}</span>
        </div>

        <dl className="divide-y">
          {d.rows.map((row) => (
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
          <p className="eyebrow mb-3">{d.stockTitle}</p>
          <ul className="space-y-3">
            {d.stock.map((s) => {
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
  const { t } = useI18n();
  const h = t.hero;

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
        aria-label={h.aria}
        className="page-container relative grid items-center gap-16 pb-24 pt-28 md:pt-36 lg:grid-cols-[1.1fr_1fr] xl:gap-24 xl:pb-28 xl:pt-36"
      >
        <div>
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card/80 px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
            {h.badge}
          </p>
          <h1 className="text-4xl font-semibold leading-[1.06] tracking-tight md:text-[3.4rem] xl:text-[4rem]">
            {h.titleStart} <span className="text-gradient">{h.titleHighlight}</span>
            <span className="text-accent">.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground xl:max-w-2xl xl:text-xl">
            {h.text}
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => openChat()}
              className="group inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30"
            >
              {h.cta}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <a
              href="#planos"
              className="rounded-xl border bg-card/70 px-5 py-3.5 text-sm font-medium backdrop-blur transition-colors hover:bg-card"
            >
              {h.secondary}
            </a>
          </div>

          <dl className="mt-12 grid max-w-lg grid-cols-3 gap-2 sm:gap-4">
            {h.stats.map(([value, label]) => (
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
  const { t } = useI18n();

  return (
    <section aria-label={t.differentials.aria} className="border-y bg-card/60">
      <ul className="page-container grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        {t.differentials.items.map((item, index) => {
          const Icon = DIFFERENTIAL_ICONS[index];
          return (
            <li key={item.title}>
              <Reveal delay={index * 80} className="flex items-start gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-sm font-semibold">{item.title}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
                </div>
              </Reveal>
            </li>
          );
        })}
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
  const { t } = useI18n();
  const m = t.modules;

  return (
    <section
      id="modulos"
      aria-labelledby="modulos-titulo"
      className="scroll-mt-20 border-t bg-card/60"
    >
      <div className="page-container py-20 xl:py-24">
        <Reveal>
          <SectionHeading id="modulos-titulo" eyebrow={m.eyebrow} title={m.title} text={m.text} />
        </Reveal>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {m.items.map((module, index) => {
            const Icon = MODULE_ICONS[index];
            return (
              <li key={module.name}>
                <Reveal delay={index * 70} className="h-full">
                  <article className="group relative h-full overflow-hidden rounded-2xl border bg-background p-7 transition-all duration-300 focus-within:border-primary/40 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 xl:p-9">
                    <div
                      aria-hidden="true"
                      className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
                    />
                    <span className="relative grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" />
                    </span>
                    <h3 className="relative mt-6 text-lg font-semibold">
                      {/* O botão se estende por todo o cartão (after:inset-0): o cartão inteiro é clicável */}
                      <button
                        type="button"
                        onClick={() => openChat(m.draft(module.name))}
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
                      {m.ask}
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </article>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function HowItWorks() {
  const { t } = useI18n();
  const steps = t.how.steps;

  return (
    <section
      id="como-funciona"
      aria-labelledby="como-funciona-titulo"
      className="scroll-mt-20 border-t"
    >
      <div className="page-container py-20 xl:py-24">
        <Reveal>
          <SectionHeading id="como-funciona-titulo" eyebrow={t.how.eyebrow} title={t.how.title} />
        </Reveal>
        <ol className="grid gap-12 md:grid-cols-3 xl:gap-16">
          {steps.map((step, index) => (
            <li key={step.title} className="relative">
              {/* Linha até a próxima etapa (a última não tem): vai do círculo ao círculo seguinte */}
              {index < steps.length - 1 && (
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
  const { t } = useI18n();
  const p = t.plans;

  return (
    <section
      id="planos"
      aria-labelledby="planos-titulo"
      className="scroll-mt-20 border-t bg-card/60"
    >
      <div className="page-container py-20 xl:py-24">
        <Reveal>
          <SectionHeading id="planos-titulo" eyebrow={p.eyebrow} title={p.title} text={p.text} />
        </Reveal>
        <div className="grid items-stretch gap-6 lg:grid-cols-3 xl:gap-8">
          {p.items.map((plan, index) => (
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
                      {p.recommended}
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
                  onClick={() => openChat(p.draft(plan.name))}
                  className={cn(
                    "relative mt-auto rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                    plan.featured
                      ? "bg-background text-foreground hover:bg-background/90"
                      : "border bg-card hover:border-primary hover:bg-primary hover:text-primary-foreground",
                  )}
                >
                  {p.cta(plan.name)}
                </button>
              </article>
            </Reveal>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-muted-foreground">{p.note}</p>
      </div>
    </section>
  );
}

function Faq() {
  const { t } = useI18n();
  const f = t.faq;

  return (
    <section id="duvidas" aria-labelledby="duvidas-titulo" className="scroll-mt-20 border-t">
      <div className="page-container grid gap-12 py-20 lg:grid-cols-[1fr_1.6fr] xl:py-24">
        <Reveal>
          <SectionHeading id="duvidas-titulo" eyebrow={f.eyebrow} title={f.title} text={f.text} />
        </Reveal>
        <div className="space-y-3">
          {f.items.map((item, index) => (
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
                {item.privacy && (
                  <Link
                    to="/privacidade"
                    className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
                  >
                    {f.privacyLink}
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
  const { t } = useI18n();
  const c = t.cta;

  return (
    <section
      id="agendar"
      aria-labelledby="agendar-titulo"
      className="scroll-mt-20 border-t bg-card/60 py-20 xl:py-24"
    >
      <div className="page-container">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-emerald-900 px-8 py-16 text-primary-foreground shadow-2xl shadow-primary/20 sm:px-14 xl:py-20">
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
                {c.eyebrow}
              </p>
              <h2
                id="agendar-titulo"
                className="max-w-2xl text-3xl font-semibold leading-tight tracking-tight md:text-4xl"
              >
                {c.title}
              </h2>
              <p className="mt-4 max-w-xl leading-relaxed text-primary-foreground/85">{c.text}</p>

              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                <button
                  type="button"
                  onClick={() => openChat()}
                  className="group inline-flex items-center gap-2 rounded-xl bg-background px-6 py-3.5 text-sm font-medium text-foreground shadow-lg transition-all hover:-translate-y-0.5 hover:bg-background/90"
                >
                  {c.button}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>
                <a
                  href="#planos"
                  className="group inline-flex items-center gap-1.5 text-sm font-medium text-primary-foreground underline underline-offset-4"
                >
                  {c.plansLink}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </a>
              </div>
            </div>

            <ul className="space-y-4 text-sm lg:justify-self-end">
              {c.bullets.map((item) => (
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
  const { t } = useI18n();
  const f = t.footer;

  const productLinks = [
    [t.nav.modules, "#modulos"],
    [t.nav.how, "#como-funciona"],
    [t.nav.plans, "#planos"],
    [f.schedule, "#agendar"],
  ];

  return (
    <footer className="border-t">
      {/* pb extra: o botão flutuante do chat fica no canto e não pode cobrir o texto */}
      <div className="page-container pb-28 pt-14 sm:pb-24">
        <div className="grid gap-10 sm:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {f.tagline}
            </p>
          </div>

          <nav aria-label={f.product}>
            <p className="eyebrow mb-4">{f.product}</p>
            <ul className="space-y-2.5 text-sm">
              {productLinks.map(([label, href]) => (
                <li key={href}>
                  <a href={href} className="text-muted-foreground hover:text-foreground">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label={f.help}>
            <p className="eyebrow mb-4">{f.help}</p>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#duvidas" className="text-muted-foreground hover:text-foreground">
                  {f.faq}
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openChat()}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {f.talk}
                </button>
              </li>
              <li>
                <Link to="/privacidade" className="text-muted-foreground hover:text-foreground">
                  {f.privacy}
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t pt-6 text-sm text-muted-foreground sm:flex-row sm:justify-between">
          <p>
            © {new Date().getFullYear()} ERP360. {f.rights}
          </p>
          <p>{f.demo}</p>
        </div>
      </div>
    </footer>
  );
}

const Index = () => {
  const { t } = useI18n();

  useEffect(() => {
    document.title = t.title;
  }, [t.title]);

  return (
    <div className="min-h-screen">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
      >
        {t.header.skip}
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
};

export default Index;
