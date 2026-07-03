import type { Plant } from "@/types";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=1200&q=80&auto=format&fit=crop";

type MonographRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is MonographRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const asString = (value: unknown, fallback = "") =>
  typeof value === "string" && value.trim() ? value.trim() : fallback;

const asStringArray = (value: unknown) => {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  }

  if (typeof value === "string" && value.trim()) {
    return value
      .split(/[\n;,]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const firstSentence = (value: string, fallback: string) => {
  const [sentence] = value.split(/[.!?]\s/);
  return sentence?.trim() || fallback;
};

export function mapMonographToPlant(monograph: unknown): Plant | null {
  if (!isRecord(monograph)) return null;

  const id = asString(monograph.id);
  const scientificName = asString(monograph.scientificName);
  if (!id || !scientificName) return null;

  const vernacularNames = asStringArray(monograph.vernacularNames);
  const therapeuticIndications = asString(monograph.therapeuticIndications);
  const contraindications = asString(monograph.contraindications);
  const drugInteractions = asString(monograph.drugInteractions);
  const clinicalStudies = asString(monograph.clinicalStudies);
  const activeCompounds = asString(monograph.activeCompounds);
  const fieldPhotos = asStringArray(monograph.fieldPhotos);
  const illustration = asString(monograph.illustration);
  const image = illustration || fieldPhotos[0] || FALLBACK_IMAGE;
  const indications = asStringArray(therapeuticIndications).slice(0, 6);

  return {
    id,
    slug: id,
    scientificName,
    vernacularNames: vernacularNames.length ? vernacularNames : [scientificName],
    family: "Famille non renseignee",
    origin: "Origine non renseignee",
    region: "Distribution non renseignee",
    therapeuticCategory: indications[0] ?? "Monographie",
    indications: indications.length ? indications : ["Usage traditionnel"],
    image,
    gallery: [image, ...fieldPhotos.filter((photo) => photo !== image)].slice(0, 6),
    summary: firstSentence(therapeuticIndications, "Monographie issue de la base IWOSAN."),
    botanicalDescription: asString(monograph.botanicalDescription),
    medicinalProperties: [
      activeCompounds
        ? { property: "Principes actifs", use: activeCompounds, evidence: "Monographie IWOSAN" }
        : null,
      therapeuticIndications
        ? { property: "Indications", use: therapeuticIndications, evidence: "Usage documente" }
        : null,
      clinicalStudies ? { property: "Etudes cliniques", use: clinicalStudies, evidence: "References disponibles" } : null,
    ].filter((item): item is { property: string; use: string; evidence: string } => Boolean(item)),
    preparations: asStringArray(monograph.preparationMethods),
    precautions: [contraindications, drugInteractions ? `Interactions: ${drugInteractions}` : ""].filter(Boolean),
    references: clinicalStudies ? [clinicalStudies] : [],
  };
}

export function mapMonographsToPlants(monographs: unknown[] | undefined): Plant[] {
  return (monographs ?? []).map(mapMonographToPlant).filter((plant): plant is Plant => Boolean(plant));
}
