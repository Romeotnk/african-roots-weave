export interface CmsPage {
  slug: string;
  title: string;
  contentHtml: string;
  metaTitle: string;
  metaDescription: string;
  isPublished: boolean;
  updatedAt: string;
}

export const cmsPages: CmsPage[] = [
  {
    slug: "a-propos",
    title: "A propos d'IWOSAN",
    metaTitle: "A propos - IWOSAN",
    metaDescription: "Notre mission pour documenter et transmettre les savoirs medicaux africains.",
    isPublished: true,
    updatedAt: "2026-06-20",
    contentHtml:
      "<p>IWOSAN rassemble praticiens, chercheurs, vendeurs et communautes autour des savoirs africains de soin.</p><p>La plateforme met en avant la documentation, la verification, la transmission et l'acces responsable aux ressources de sante traditionnelles.</p>",
  },
  {
    slug: "cgu",
    title: "Conditions generales d'utilisation",
    metaTitle: "CGU - IWOSAN",
    metaDescription: "Conditions d'utilisation de la plateforme IWOSAN.",
    isPublished: true,
    updatedAt: "2026-06-21",
    contentHtml:
      "<p>Les utilisateurs s'engagent a publier des informations exactes, respectueuses et conformes aux lois applicables.</p><p>Les contenus de sante sont informatifs et ne remplacent pas une consultation medicale.</p>",
  },
  {
    slug: "politique-confidentialite",
    title: "Politique de confidentialite",
    metaTitle: "Confidentialite - IWOSAN",
    metaDescription: "Donnees collectees, conservation et droits des utilisateurs IWOSAN.",
    isPublished: true,
    updatedAt: "2026-06-21",
    contentHtml:
      "<p>IWOSAN collecte les donnees necessaires au fonctionnement du compte, des commandes, de la messagerie et de la verification KYC.</p><p>Chaque utilisateur peut demander la modification ou la suppression de ses donnees selon les procedures prevues.</p>",
  },
  {
    slug: "mentions-legales",
    title: "Mentions legales",
    metaTitle: "Mentions legales - IWOSAN",
    metaDescription: "Informations legales et contact editeur de la plateforme IWOSAN.",
    isPublished: true,
    updatedAt: "2026-06-21",
    contentHtml:
      "<p>Editeur : IWOSAN Africa. Contact : contact@iwosan.africa.</p><p>Hebergement, responsabilites editoriales et informations administratives seront completees lors du branchement final.</p>",
  },
];
