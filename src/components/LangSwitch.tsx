import type { Lang } from "@/lib/copy";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const OPTIONS: { code: Lang; flag: string; label: string }[] = [
  { code: "pt", flag: "/flags/br.png", label: "Português (Brasil)" },
  { code: "en", flag: "/flags/us.png", label: "English (US)" },
];

/** Alternador de idioma com as bandeiras do Brasil e dos EUA. */
export function LangSwitch({ className }: { className?: string }) {
  const { lang, setLang, t } = useI18n();

  return (
    <div
      role="group"
      aria-label={t.header.langLabel}
      className={cn("flex items-center rounded-xl border bg-card/70 p-0.5", className)}
    >
      {OPTIONS.map((option) => (
        <button
          key={option.code}
          type="button"
          onClick={() => setLang(option.code)}
          aria-pressed={lang === option.code}
          aria-label={option.label}
          title={option.label}
          className={cn(
            "grid h-9 w-10 place-items-center rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            lang === option.code
              ? "bg-primary/15 ring-1 ring-primary/40"
              : "opacity-60 hover:opacity-100",
          )}
        >
          {/* O PNG tem margem em cima e embaixo: a caixa recorta só a bandeira */}
          <span className="block h-4 w-6 overflow-hidden rounded-[3px]">
            <img src={option.flag} alt="" className="-mt-[4px] h-6 w-6 max-w-none" />
          </span>
        </button>
      ))}
    </div>
  );
}
