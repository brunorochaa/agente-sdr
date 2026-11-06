import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { LangSwitch } from "@/components/LangSwitch";
import { Logo } from "@/components/Logo";
import { useI18n } from "@/lib/i18n";

const Privacidade = () => {
  const { t } = useI18n();
  const p = t.privacy;

  useEffect(() => {
    document.title = p.title;
    window.scrollTo(0, 0);
    // Ao trocar o idioma, o título da aba acompanha (o LangProvider só cuida da página inicial).
  }, [p.title]);

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="page-container flex h-16 items-center justify-between gap-3">
          <Logo />
          <div className="flex items-center gap-4">
            <LangSwitch />
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {p.back}
            </Link>
          </div>
        </div>
      </header>
      <main className="page-container max-w-3xl py-16">
        <p className="eyebrow mb-4">{p.eyebrow}</p>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{p.heading}</h1>
        <div className="mt-10 space-y-8">
          {p.sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-lg font-semibold">{section.title}</h2>
              <p className="mt-2 leading-relaxed text-muted-foreground">{section.text}</p>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Privacidade;
