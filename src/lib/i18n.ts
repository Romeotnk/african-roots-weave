import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import fr from "@/locales/fr/common.json";
import en from "@/locales/en/common.json";

export type SupportedLanguage = "fr" | "en";
export const SUPPORTED_LANGUAGES: SupportedLanguage[] = ["fr", "en"];

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources: { fr: { common: fr }, en: { common: en } },
    lng: "fr",
    fallbackLng: "fr",
    defaultNS: "common",
    interpolation: { escapeValue: false },
  });
}

export default i18n;
