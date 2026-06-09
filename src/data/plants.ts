import type { Plant } from "@/types";

export const plants: Plant[] = [
  {
    id: "pl1",
    slug: "kinkeliba",
    scientificName: "Combretum micranthum",
    vernacularNames: ["Kinkéliba", "Sékhew", "Quinquéliba"],
    family: "Combretaceae",
    origin: "Afrique de l'Ouest",
    indications: ["Digestion", "Détoxification hépatique", "Fièvre"],
    image:
      "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?w=800&q=80&auto=format&fit=crop",
    summary:
      "Plante emblématique du Sahel, utilisée en infusion pour ses propriétés hépatoprotectrices et diurétiques.",
  },
  {
    id: "pl2",
    slug: "moringa-oleifera",
    scientificName: "Moringa oleifera",
    vernacularNames: ["Moringa", "Nébéday", "Arbre miracle"],
    family: "Moringaceae",
    origin: "Pan-tropical",
    indications: ["Malnutrition", "Anémie", "Hypertension"],
    image:
      "https://images.unsplash.com/photo-1615484477778-ca3b77940c25?w=800&q=80&auto=format&fit=crop",
    summary:
      "Source exceptionnelle de protéines, vitamines et minéraux. Utilisé en feuilles fraîches ou poudre.",
  },
  {
    id: "pl3",
    slug: "neem",
    scientificName: "Azadirachta indica",
    vernacularNames: ["Neem", "Margousier"],
    family: "Meliaceae",
    origin: "Asie tropicale, naturalisé en Afrique",
    indications: ["Paludisme", "Dermatoses", "Antiparasitaire"],
    image:
      "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800&q=80&auto=format&fit=crop",
    summary:
      "Arbre aux mille vertus, principes actifs étudiés pour leurs effets antimicrobiens et antiparasitaires.",
  },
  {
    id: "pl4",
    slug: "karite",
    scientificName: "Vitellaria paradoxa",
    vernacularNames: ["Karité", "Shea"],
    family: "Sapotaceae",
    origin: "Savanes ouest-africaines",
    indications: ["Cicatrisation", "Eczéma", "Vergetures"],
    image:
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80&auto=format&fit=crop",
    summary:
      "Beurre extrait des noix, riche en insaponifiables, base de la cosmétique traditionnelle ouest-africaine.",
  },
  {
    id: "pl5",
    slug: "baobab",
    scientificName: "Adansonia digitata",
    vernacularNames: ["Baobab", "Pain de singe"],
    family: "Malvaceae",
    origin: "Savanes africaines",
    indications: ["Diarrhée", "Carences vitamine C", "Fièvre"],
    image:
      "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&q=80&auto=format&fit=crop",
    summary:
      "Toutes les parties sont utilisées : fruit (pulpe acidulée), feuilles (lalo), écorce (fibres médicinales).",
  },
  {
    id: "pl6",
    slug: "artemisia-annua",
    scientificName: "Artemisia annua",
    vernacularNames: ["Armoise annuelle"],
    family: "Asteraceae",
    origin: "Chine, cultivée en Afrique",
    indications: ["Paludisme", "Fièvres récurrentes"],
    image:
      "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800&q=80&auto=format&fit=crop",
    summary:
      "Source d'artémisinine, désormais cultivée et étudiée par les programmes africains de lutte antipaludique.",
  },
];
