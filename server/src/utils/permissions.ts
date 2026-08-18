import { Role } from "@prisma/client";

// Central permission catalog. Additive on top of the Role enum: DEFAULT_ROLE_PERMISSIONS
// below is a reference for what should be written to the RolePermission table (via the
// admin roles-and-permissions UI, or a one-off script) for each new permission — it is
// NOT read at request time. permissions.service.ts's hasPermission(...) checks only the
// live RolePermission rows, so adding a key here has no runtime effect until those rows
// actually exist in the database.
export const PERMISSION_CATALOG: { key: string; label: string; group: string }[] = [
  { key: "users.ban", label: "Bannir/débannir un utilisateur", group: "Utilisateurs" },
  { key: "users.role.update", label: "Modifier le rôle d'un utilisateur", group: "Utilisateurs" },
  { key: "kyc.review", label: "Approuver/rejeter une vérification KYC", group: "Utilisateurs" },
  { key: "professionals.verify", label: "Vérifier un professionnel / portrait de la semaine", group: "Utilisateurs" },
  { key: "content.author", label: "Publier articles/événements/formations", group: "Contenu" },
  { key: "content.review", label: "Approuver/rejeter le contenu en attente", group: "Contenu" },
  { key: "product.moderate", label: "Approuver/rejeter une annonce marketplace", group: "Marketplace" },
  { key: "product.create", label: "Publier une annonce marketplace (vendeur)", group: "Marketplace" },
  { key: "coupons.manage", label: "Gérer ses coupons de réduction (vendeur)", group: "Marketplace" },
  { key: "forum.moderate", label: "Fermer/masquer questions, réponses, commentaires", group: "Forum" },
  { key: "forum.feature", label: "Mettre une question en vedette", group: "Forum" },
  { key: "finance.refund.approve", label: "Approuver/rejeter un remboursement", group: "Finance" },
  { key: "finance.dispute.resolve", label: "Résoudre un litige commande", group: "Finance" },
  { key: "finance.config", label: "Configurer les taux de commission", group: "Finance" },
  { key: "finance.reports.view", label: "Consulter la vue d'ensemble MLM et les transactions", group: "Finance" },
  { key: "content.pages.manage", label: "Gérer les pages CMS", group: "Contenu" },
  { key: "content.monographs.manage", label: "Gérer les monographies Pharmacopée", group: "Contenu" },
  { key: "system.config", label: "Configurer le site (identité, maintenance, CSS)", group: "Système" },
  { key: "content.translations.manage", label: "Modifier les textes du site et les modèles d'e-mail", group: "Contenu" },
  { key: "marketing.newsletter.send", label: "Envoyer la newsletter", group: "Marketing" },
  { key: "support.triage", label: "Répondre aux tickets support", group: "Support" },
  { key: "audit.read", label: "Consulter le journal d'audit", group: "Système" },
];

export const PERMISSION_KEYS = PERMISSION_CATALOG.map((entry) => entry.key);

export const DEFAULT_ROLE_PERMISSIONS: Record<string, Role[]> = {
  "users.ban": [Role.SUPER_ADMIN, Role.ADMIN],
  "users.role.update": [Role.SUPER_ADMIN, Role.ADMIN],
  "kyc.review": [Role.SUPER_ADMIN, Role.ADMIN],
  "professionals.verify": [Role.SUPER_ADMIN, Role.ADMIN],
  "content.author": [Role.SUPER_ADMIN, Role.ADMIN, Role.PROFESSIONAL],
  "content.review": [Role.SUPER_ADMIN, Role.ADMIN],
  "product.moderate": [Role.SUPER_ADMIN, Role.ADMIN],
  "product.create": [Role.SUPER_ADMIN, Role.ADMIN, Role.PROFESSIONAL],
  "coupons.manage": [Role.SUPER_ADMIN, Role.ADMIN, Role.PROFESSIONAL],
  "forum.moderate": [Role.SUPER_ADMIN, Role.ADMIN],
  "forum.feature": [Role.SUPER_ADMIN, Role.ADMIN],
  "finance.refund.approve": [Role.SUPER_ADMIN, Role.ADMIN],
  "finance.dispute.resolve": [Role.SUPER_ADMIN, Role.ADMIN],
  "finance.config": [Role.SUPER_ADMIN],
  "finance.reports.view": [Role.SUPER_ADMIN, Role.ADMIN],
  "content.pages.manage": [Role.SUPER_ADMIN, Role.ADMIN],
  // Pharmacopée monographs are deliberately kept exclusive to the principal
  // administrator (see the same superAdminOnlySpaces rule for Pharmacopée
  // articles in content.controller.ts) — unlike content.review, this is not
  // opened up to ADMIN by default.
  "content.monographs.manage": [Role.SUPER_ADMIN],
  "system.config": [Role.SUPER_ADMIN],
  "content.translations.manage": [Role.SUPER_ADMIN],
  "marketing.newsletter.send": [Role.SUPER_ADMIN, Role.ADMIN],
  "support.triage": [Role.SUPER_ADMIN, Role.ADMIN, Role.PROFESSIONAL],
  "audit.read": [Role.SUPER_ADMIN],
};

export type PermissionOverrides = { grant?: string[]; revoke?: string[] };
