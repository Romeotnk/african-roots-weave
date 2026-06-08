import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { dict } from "./dictionary";
import { setI18nLang } from "./jsxPatch";

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

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Lang | null;
      if (stored === "fr" || stored === "en") setLangState(stored);
    } catch { /* ignore */ }
  }, []);

  // Reflect lang on <html> and on the JSX runtime patch.
  // Use a layout-style effect synchronously so initial subtree renders correctly.
  setI18nLang(lang);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setI18nLang(l);
    setLangState(l);
    try { localStorage.setItem(STORAGE_KEY, l); } catch { /* ignore */ }
  }, []);

  const t = useCallback((fr: string) => {
    if (lang === "fr") return fr;
    return dict[fr] ?? fr;
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  // `key={lang}` forces a full unmount/remount of the subtree on language
  // change so every JSX call is re-evaluated with the patched runtime.
  return (
    <LanguageContext.Provider value={value}>
      <div key={lang} className="contents">{children}</div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
