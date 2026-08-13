import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import fr from "@/locales/fr/common.json";
import en from "@/locales/en/common.json";
import { getSiteTranslations } from "@/lib/api/site";

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

// Super-admin-edited text (src/routes/admin/site/textes.tsx) lives in the
// TranslationOverride table, not in these static bundles — flatten a nested
// object (as the JSON files are) into i18next's dot-path key format so a
// stored key like "annuaire.filters.nearby" lands on the right nested leaf.
const unflatten = (flat: Record<string, string>): Record<string, unknown> => {
  const root: Record<string, unknown> = {};
  for (const [path, value] of Object.entries(flat)) {
    const segments = path.split(".");
    let node = root;
    segments.forEach((segment, index) => {
      if (index === segments.length - 1) {
        node[segment] = value;
        return;
      }
      if (typeof node[segment] !== "object" || node[segment] === null) node[segment] = {};
      node = node[segment] as Record<string, unknown>;
    });
  }
  return root;
};

// Inverse of unflatten — used by the "Textes du site" admin page to turn the
// static bundles into a flat, searchable list of editable keys.
export const flattenTranslations = (value: Record<string, unknown>, prefix = ""): Record<string, string> => {
  const out: Record<string, string> = {};
  for (const [segment, child] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${segment}` : segment;
    if (child && typeof child === "object" && !Array.isArray(child)) {
      Object.assign(out, flattenTranslations(child as Record<string, unknown>, path));
    } else {
      out[path] = String(child);
    }
  }
  return out;
};

export const STATIC_TRANSLATIONS: Record<SupportedLanguage, Record<string, unknown>> = { fr, en };

const fetchedLocales = new Set<SupportedLanguage>();

export const applyTranslationOverrides = async (locale: SupportedLanguage) => {
  if (fetchedLocales.has(locale)) return;
  fetchedLocales.add(locale);
  try {
    const response = await getSiteTranslations(locale);
    const overrides = response.data ?? {};
    if (Object.keys(overrides).length > 0) {
      i18n.addResourceBundle(locale, "common", unflatten(overrides), true, true);
    }
  } catch {
    // Overrides are an enhancement, not a requirement — the static bundle
    // already rendered, so a failed fetch here should never block the app.
    fetchedLocales.delete(locale);
  }
};

export default i18n;
