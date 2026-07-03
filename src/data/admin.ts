import { articles } from "@/data/articles";
import { affiliateEarnings } from "@/data/affiliate";
import { events } from "@/data/events";
import { products } from "@/data/products";
import { professionals } from "@/data/professionals";
import { questions } from "@/data/questions";
import { recipes } from "@/data/recipes";
import { supportTickets } from "@/data/help";
import { trainings } from "@/data/trainings";
import { walletTransactions } from "@/data/wallet";

export const adminKpis = [
  { label: "Nouveaux utilisateurs aujourd'hui", value: "42", change: "+18%" },
  { label: "Annonces en moderation", value: "9", change: "urgent" },
  { label: "Transactions du jour", value: "1 284 000 XOF", change: "+11%" },
  { label: "Tickets non resolus", value: "6", change: "urgent" },
  { label: "Commissions du mois", value: "4 820 000 XOF", change: "+24%" },
  { label: "Commandes completees", value: "318", change: "+7%" },
  { label: "Nouveaux pros", value: "27", change: "+9%" },
  { label: "Conversion visiteurs", value: "8.4%", change: "+1.2 pt" },
];

export const adminCharts = {
  signups: [22, 28, 24, 35, 31, 46, 42, 58, 51, 66, 61, 72],
  salesByCategory: [
    { label: "Pharmacopee", value: 38 },
    { label: "Soins", value: 24 },
    { label: "Nutrition", value: 18 },
    { label: "Rites", value: 12 },
  ],
  roles: [
    { label: "USER", value: 68 },
    { label: "PRO", value: 22 },
    { label: "RESEARCHER", value: 7 },
    { label: "ADMIN", value: 3 },
  ],
};

export const adminUrgentActions = [
  { label: "Valider les annonces en attente", to: "/admin/marketplace", count: 9 },
  { label: "Traiter les KYC", to: "/admin/utilisateurs/kyc", count: 5 },
  { label: "Repondre aux tickets support", to: "/admin/communication/tickets", count: 6 },
  { label: "Verifier les litiges ouverts", to: "/admin/finances/litiges", count: 3 },
];

export const adminActivity = [
  "Awa D. a soumis un KYC",
  "Annonce Kinkeliba premium soumise a moderation",
  "Ticket TCK-1024 assigne au support",
  "Commande CMD-2031 marquee livree",
  "Question forum signalee par 3 utilisateurs",
  "Nouvelle inscription praticien : Dr. Kouadio",
];

export const adminHomeSections = [
  "Hero / Diaporama principal",
  "Categories medicales",
  "Portrait de la semaine",
  "Annonces recentes",
  "Praticiens en vedette",
  "Banniere publicitaire 1",
  "Articles recents",
  "Evenements a venir",
  "Temoignages",
  "Newsletter",
  "Footer",
].map((name, index) => ({ id: `section-${index}`, name, enabled: !["Banniere publicitaire 1", "Temoignages"].includes(name) }));

export const adminMenus = {
  header: ["Accueil", "Marketplace", "Annuaire", "Pharmacopee", "Discutons-en", "Agenda", "Formations"],
  footer: ["Plateforme", "Contenus", "Legal", "Reseaux sociaux"],
};

export const adminStaticPages = [
  { title: "A propos", slug: "/a-propos", status: "publie", locked: true, updatedAt: "2026-06-20" },
  { title: "CGU", slug: "/cgu", status: "publie", locked: true, updatedAt: "2026-06-18" },
  { title: "Politique de confidentialite", slug: "/confidentialite", status: "brouillon", locked: true, updatedAt: "2026-06-12" },
];

export const adminUsers = [
  { id: "u1", name: "Issa K.", email: "issa@example.com", role: "USER", country: "Benin", status: "actif", joinedAt: "2026-01-08" },
  { id: "u2", name: "Dr. Amina Traore", email: "amina@example.com", role: "PROFESSIONAL", country: "Mali", status: "actif", joinedAt: "2025-11-12" },
  { id: "u3", name: "Marc L.", email: "marc@example.com", role: "USER", country: "France", status: "suspendu", joinedAt: "2026-04-02" },
];

export const adminKycQueue = [
  { id: "kyc-1", user: "Awa D.", document: "CNI", country: "Benin", submittedAt: "2026-06-14", status: "pending" },
  { id: "kyc-2", user: "Henriette B.", document: "Passeport", country: "Senegal", submittedAt: "2026-06-13", status: "pending" },
];

export const adminFinance = {
  transactions: walletTransactions.map((item, index) => ({
    id: item.id,
    user: index % 2 ? "Awa D." : "Issa K.",
    type: item.type,
    amount: item.amount,
    status: item.status,
    ref: `MON-${1000 + index}`,
    date: item.date,
  })),
  commissions: affiliateEarnings,
  refunds: [
    { id: "rf-1", order: "CMD-2031", amount: 18500, reason: "Produit non recu", status: "pending" },
    { id: "rf-2", order: "CMD-1988", amount: 9000, reason: "Article abime", status: "processed" },
  ],
  disputes: [
    { id: "lit-1", order: "CMD-2031", buyer: "Awa D.", seller: "Herboristerie Sahel", status: "Ouvert" },
    { id: "lit-2", order: "CMD-1992", buyer: "Marc L.", seller: "Mama Aissata", status: "En cours" },
  ],
};

export const adminNewsletter = {
  subscribers: [
    { email: "awa@example.com", joinedAt: "2026-05-01", status: "actif" },
    { email: "marc@example.com", joinedAt: "2026-05-12", status: "desabonne" },
  ],
  campaigns: [
    { subject: "Nouvelles monographies disponibles", openRate: "42%", sentAt: "2026-06-01" },
    { subject: "Agenda des ateliers de juin", openRate: "38%", sentAt: "2026-05-25" },
  ],
};

export const adminCommunityReports = [
  { id: "rep-1", content: questions[0]?.title ?? "Question", reports: 3, author: "Issa K.", status: "auto-masque" },
  { id: "rep-2", content: "Avis produit juge trompeur", reports: 2, author: "Marc L.", status: "a verifier" },
];

export const adminModules = {
  editorial: { articles, recipes, plantsCount: 4, events, trainings },
  marketplace: { products, pending: products.slice(0, 3) },
  professionals,
  tickets: supportTickets,
};

export const adminLogs = [
  { at: "2026-06-15 09:21", admin: "Admin Iwosan", role: "ADMIN", action: "Annonce approuvee", entity: "Product #p1", ip: "196.47.12.44" },
  { at: "2026-06-15 10:05", admin: "Moderateur", role: "MODERATOR", action: "Question masquee", entity: "Forum #q1", ip: "41.85.90.12" },
  { at: "2026-06-15 11:30", admin: "Admin Iwosan", role: "ADMIN", action: "Taux commission modifie", entity: "Config commissions", ip: "196.47.12.44" },
];
