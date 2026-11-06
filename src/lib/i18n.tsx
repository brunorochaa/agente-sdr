import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { copy, type Copy, type Lang } from "@/lib/copy";

const STORAGE_KEY = "erp360_lang";

interface I18n {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Copy;
}

/** Idioma salvo; sem escolha anterior, segue o navegador (português se for pt, senão inglês). */
function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "pt" || saved === "en") return saved;
  } catch {
    // localStorage bloqueado: segue o navegador
  }
  return navigator.language?.toLowerCase().startsWith("pt") ? "pt" : "en";
}

const I18nContext = createContext<I18n | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  useEffect(() => {
    document.documentElement.lang = copy[lang].htmlLang;
  }, [lang]);

  const value = useMemo<I18n>(
    () => ({
      lang,
      t: copy[lang],
      setLang: (next) => {
        setLangState(next);
        try {
          localStorage.setItem(STORAGE_KEY, next);
        } catch {
          // sem localStorage, a escolha vale só nesta visita
        }
      },
    }),
    [lang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18n {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n precisa estar dentro de <LangProvider>");
  return ctx;
}
