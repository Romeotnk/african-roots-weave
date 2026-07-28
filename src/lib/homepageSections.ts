export type HomepageSectionKey = "modules" | "portrait" | "products" | "professionals" | "events";

export type HomepageSectionConfig = { key: HomepageSectionKey; enabled: boolean };

export const HOMEPAGE_SECTION_LABELS: Record<HomepageSectionKey, string> = {
  modules: "Tout l'écosystème (modules)",
  portrait: "Portrait de la semaine",
  products: "Produits en avant",
  professionals: "Praticiens en vedette",
  events: "Événements à venir",
};

export const DEFAULT_HOMEPAGE_SECTIONS: HomepageSectionConfig[] = [
  { key: "modules", enabled: true },
  { key: "portrait", enabled: true },
  { key: "products", enabled: true },
  { key: "professionals", enabled: true },
  { key: "events", enabled: true },
];

// Tolerant parse: falls back to the default order/visibility if the config
// is missing, malformed, or references unknown section keys (e.g. after a
// deploy removes a section) so the homepage never renders empty by accident.
export function parseHomepageSections(raw: string | undefined): HomepageSectionConfig[] {
  if (!raw) return DEFAULT_HOMEPAGE_SECTIONS;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_HOMEPAGE_SECTIONS;
    const validKeys = new Set(DEFAULT_HOMEPAGE_SECTIONS.map((section) => section.key));
    const cleaned = parsed.filter(
      (item): item is HomepageSectionConfig =>
        item && typeof item === "object" && validKeys.has(item.key) && typeof item.enabled === "boolean",
    );
    const missing = DEFAULT_HOMEPAGE_SECTIONS.filter((section) => !cleaned.some((item) => item.key === section.key));
    return cleaned.length > 0 ? [...cleaned, ...missing] : DEFAULT_HOMEPAGE_SECTIONS;
  } catch {
    return DEFAULT_HOMEPAGE_SECTIONS;
  }
}
