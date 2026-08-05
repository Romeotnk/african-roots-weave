// One-off data population for the hierarchical product category taxonomy
// (see migration 20260804154529_hierarchical_product_taxonomy). Run once
// against the target database: `node prisma/scripts/seedProductTaxonomy.mjs`.
// Safe to re-run: taxonomy inserts are skipDuplicates, and the product remap
// only touches rows still holding an old MedCategory enum string.
import "dotenv/config";
import slugify from "slugify";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const makeSlug = (value) => slugify(value, { lower: true, strict: true, trim: true });

const CATEGORIES = {
  "MIEUX VIVRE": [
    "Protection",
    "Chance & réussite",
    "Envoutement & Désenvoutement",
    "Purification",
    "Aide spirituelle",
    "Talisman",
    "Guérison et addiction",
    "Vaudou",
    "Magie",
    "Pouvoirs occultes",
  ],
  CULTES: [
    "Icônes religieuses",
    "Statues religieuses",
    "Objets de piété",
    "Accessoires",
    "Livres",
    "CD, DVD",
    "Thèmes religieux",
    "Cadeau religieux",
  ],
  "GUERIR VITE": [
    "Livres",
    "Troubles digestifs",
    "Etat grippal",
    "Ophtalmologie",
    "Douleurs et fièvre",
    "Problèmes de peau",
    "Mémoire",
    "Maux de bouche",
    "Problèmes de circulation",
    "Oligothérapie",
    "Stress & sommeil",
    "Cheveux et ongles",
    "Sevrage tabagique",
    "Oreilles",
    "Petits traumatismes",
    "Sexualité",
    "Protection",
  ],
  "BIEN SE NOURIR": [
    "Bébé & Enfant",
    "Riz, Pâtes & Céréales",
    "Fruits Secs & Purées",
    "Sucres",
    "Graines Germées",
    "Aides Culinaires",
    "Assaisonnements",
    "Légumes",
    "Boissons",
    "Thé, Infusions & Café",
    "Epicerie",
    "Cosmétiques & Beauté",
    "Charcuterie",
    "Produits De La Pêche",
    "Aliments Pour Animaux",
    "Autres Produits Alimentaires",
  ],
};

// Old MedCategory enum value -> new subcategory slug, agreed with the user.
const PRODUCT_CATEGORY_REMAP = {
  GASTRO_INTESTINAL: "guerir-vite-troubles-digestifs",
  ETATS_FEBRILES_ICTERES: "guerir-vite-douleurs-et-fievre",
  AFFECTIONS_CUTANEES: "guerir-vite-problemes-de-peau",
  ORL: "guerir-vite-oreilles",
  OPHTALMOLOGIQUE: "guerir-vite-ophtalmologie",
  BUCCO_DENTAIRE: "guerir-vite-maux-de-bouche",
  STOMATOLOGIQUE: "guerir-vite-maux-de-bouche",
  CARDIO_VASCULAIRE: "guerir-vite-problemes-de-circulation",
  SYSTEME_NERVEUX: "guerir-vite-stress-and-sommeil",
  OSTEO_ARTICULAIRE: "guerir-vite-petits-traumatismes",
  PULMONAIRE: "guerir-vite-etat-grippal",
  URO_GENITAL: "guerir-vite-sexualite",
  GYNECO_OBSTETRIQUE: "guerir-vite-sexualite",
  MALADIES_ENFANCE: "bien-se-nourir-bebe-and-enfant",
  MYSTIQUE: "mieux-vivre-aide-spirituelle",
};

async function main() {
  let position = 0;
  for (const [parentName, children] of Object.entries(CATEGORIES)) {
    const parentSlug = makeSlug(parentName);
    const parent = await prisma.taxonomy.upsert({
      where: { scope_slug: { scope: "PRODUCT_CATEGORY", slug: parentSlug } },
      update: {},
      create: { scope: "PRODUCT_CATEGORY", name: parentName, slug: parentSlug, position: position++ },
    });

    let childPosition = 0;
    for (const childName of children) {
      const childSlug = makeSlug(`${parentName}-${childName}`);
      await prisma.taxonomy.upsert({
        where: { scope_slug: { scope: "PRODUCT_CATEGORY", slug: childSlug } },
        update: { parentId: parent.id },
        create: {
          scope: "PRODUCT_CATEGORY",
          name: childName,
          slug: childSlug,
          position: childPosition++,
          parentId: parent.id,
        },
      });
    }
    console.log(`Seeded "${parentName}" with ${children.length} subcategories.`);
  }

  for (const [oldValue, newSlug] of Object.entries(PRODUCT_CATEGORY_REMAP)) {
    const result = await prisma.product.updateMany({
      where: { category: oldValue },
      data: { category: newSlug },
    });
    if (result.count > 0) console.log(`Remapped ${result.count} product(s): ${oldValue} -> ${newSlug}`);
  }

  const stale = await prisma.product.findMany({
    where: { category: { in: Object.keys(PRODUCT_CATEGORY_REMAP) } },
    select: { id: true, category: true },
  });
  if (stale.length > 0) {
    console.warn("WARNING: products still holding an old category value:", stale);
  } else {
    console.log("All products now reference a valid PRODUCT_CATEGORY taxonomy slug.");
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
