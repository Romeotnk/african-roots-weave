import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import { useMeQuery } from "@/hooks/useAuthApi";
import { updateMe } from "@/lib/api/auth";
import i18n, { applyTranslationOverrides, SUPPORTED_LANGUAGES, type SupportedLanguage } from "@/lib/i18n";

interface Ctx {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
}

const LanguageCtx = createContext<Ctx>({ language: "fr", setLanguage: () => {} });
const KEY = "iwosan_language";

function isSupportedLanguage(value: string | null): value is SupportedLanguage {
  return SUPPORTED_LANGUAGES.includes(value as SupportedLanguage);
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Starts at "fr" to match the server-rendered <html lang="fr"> exactly — the
  // stored preference is only applied after mount (see ThemeProvider for the
  // same SSR-hydration-safe pattern), so the first client render never
  // mismatches the server-rendered markup.
  const [language, setLanguageState] = useState<SupportedLanguage>("fr");
  const meQuery = useMeQuery();
  const hasAppliedStoredPreference = useRef(false);

  useEffect(() => {
    if (hasAppliedStoredPreference.current) return;
    try {
      const stored = localStorage.getItem(KEY);
      if (isSupportedLanguage(stored)) {
        hasAppliedStoredPreference.current = true;
        if (stored !== "fr") setLanguageState(stored);
        return;
      }
    } catch {
      /* ignore */
    }
    // No local preference yet: fall back to the signed-in user's saved
    // language once it loads, so a returning user on a new device/browser
    // still sees their preferred language without having to reselect it.
    if (isSupportedLanguage(meQuery.data?.language ?? null)) {
      hasAppliedStoredPreference.current = true;
      setLanguageState(meQuery.data!.language as SupportedLanguage);
    }
  }, [meQuery.data]);

  useEffect(() => {
    i18n.changeLanguage(language).catch(() => undefined);
    document.documentElement.lang = language;
    applyTranslationOverrides(language).catch(() => undefined);
  }, [language]);

  const setLanguage = useCallback(
    (lang: SupportedLanguage) => {
      setLanguageState(lang);
      hasAppliedStoredPreference.current = true;
      try {
        localStorage.setItem(KEY, lang);
      } catch {
        /* ignore */
      }
      if (meQuery.data) {
        updateMe({ language: lang }).catch(() => undefined);
      }
    },
    [meQuery.data],
  );

  const value = useMemo(() => ({ language, setLanguage }), [language, setLanguage]);

  return (
    <LanguageCtx.Provider value={value}>
      <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
    </LanguageCtx.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageCtx);
}
