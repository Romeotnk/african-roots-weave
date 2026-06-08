import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { dict } from "./dictionary";

export type Lang = "fr" | "en";

interface Ctx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (fr: string) => string;
}

const LanguageContext = createContext<Ctx>({ lang: "fr", setLang: () => {}, t: (s) => s });

const STORAGE_KEY = "iwosan_lang";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("fr");

  // Hydrate from localStorage on client
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Lang | null;
      if (stored === "fr" || stored === "en") setLangState(stored);
    } catch { /* ignore */ }
  }, []);

  // Reflect lang on <html>
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try { localStorage.setItem(STORAGE_KEY, l); } catch { /* ignore */ }
  }, []);

  const t = useCallback((fr: string) => {
    if (lang === "fr") return fr;
    return dict[fr] ?? fr;
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
