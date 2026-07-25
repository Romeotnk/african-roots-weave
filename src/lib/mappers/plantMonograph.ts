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

type MedicinalProperty = { property: string; use: string; evidence: string };

const asMedicinalProperties = (value: unknown): MedicinalProperty[] => {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is MedicinalProperty =>
      isRecord(item) && typeof item.property === "string" && typeof item.use === "string" && typeof item.evidence === "string",
  );
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

  const derivedIndications = asStringArray(therapeuticIndications).slice(0, 6);
  const indications = asStringArray(monograph.indications);
  const medicinalProperties = asMedicinalProperties(monograph.medicinalProperties);
  const preparations = asStringArray(monograph.preparations);
  const precautions = asStringArray(monograph.precautions);
  const references = asStringArray(monograph.references);
  const gallery = asStringArray(monograph.gallery);

  return {
    id,
    slug: asString(monograph.slug) || id,
    scientificName,
    vernacularNames: vernacularNames.length ? vernacularNames : [scientificName],
    family: asString(monograph.family, "Famille non renseignee"),
    origin: asString(monograph.origin, "Origine non renseignee"),
    region: asString(monograph.region, "Distribution non renseignee"),
    therapeuticCategory: asString(monograph.therapeuticCategory) || derivedIndications[0] || "Monographie",
    indications: indications.length ? indications : derivedIndications.length ? derivedIndications : ["Usage traditionnel"],
    image,
    gallery: gallery.length ? gallery : [image, ...fieldPhotos.filter((photo) => photo !== image)].slice(0, 6),
    summary: asString(monograph.summary) || firstSentence(therapeuticIndications, "Monographie issue de la base IWOSAN."),
    botanicalDescription: asString(monograph.botanicalDescription),
    medicinalProperties: medicinalProperties.length
      ? medicinalProperties
      : [
          activeCompounds
            ? { property: "Principes actifs", use: activeCompounds, evidence: "Monographie IWOSAN" }
            : null,
          therapeuticIndications
            ? { property: "Indications", use: therapeuticIndications, evidence: "Usage documente" }
            : null,
          clinicalStudies ? { property: "Etudes cliniques", use: clinicalStudies, evidence: "References disponibles" } : null,
        ].filter((item): item is MedicinalProperty => Boolean(item)),
    preparations: preparations.length ? preparations : asStringArray(monograph.preparationMethods),
    precautions: precautions.length
      ? precautions
      : [contraindications, drugInteractions ? `Interactions: ${drugInteractions}` : ""].filter(Boolean),
    references: references.length ? references : clinicalStudies ? [clinicalStudies] : [],
  };
}

export function mapMonographsToPlants(monographs: unknown[] | undefined): Plant[] {
  return (monographs ?? []).map(mapMonographToPlant).filter((plant): plant is Plant => Boolean(plant));
}
