import { Role } from "@prisma/client";

// Central permission catalog. Additive on top of the Role enum: this is the
// seed of RolePermission rows (see prisma/seedRolePermissions.ts) and mirrors
// exactly the checkRole(...) allow-lists already in place at the time this
// was introduced, so seeding it changes nothing about who can do what today —
// it only makes those allow-lists editable from the admin panel and
// overridable per user, instead of being fixed in code.
export const PERMISSION_CATALOG: { key: string; label: string; group: string }[] = [
  { key: "users.ban", label: "Bannir/débannir un utilisateur", group: "Utilisateurs" },
  { key: "users.role.update", label: "Modifier le rôle d'un utilisateur", group: "Utilisateurs" },
  { key: "kyc.review", label: "Approuver/rejeter une vérification KYC", group: "Utilisateurs" },
  { key: "professionals.verify", label: "Vérifier un professionnel / portrait de la semaine", group: "Utilisateurs" },
  { key: "content.author", label: "Publier articles/événements/formations", group: "Contenu" },
  { key: "content.review", label: "Approuver/rejeter le contenu en attente", group: "Contenu" },
  { key: "product.moderate", label: "Approuver/rejeter une annonce marketplace", group: "Marketplace" },
  { key: "forum.moderate", label: "Fermer/masquer questions, réponses, commentaires", group: "Forum" },
  { key: "forum.feature", label: "Mettre une question en vedette", group: "Forum" },
  { key: "finance.refund.approve", label: "Approuver/rejeter un remboursement", group: "Finance" },
  { key: "finance.dispute.resolve", label: "Résoudre un litige commande", group: "Finance" },
  { key: "finance.config", label: "Configurer les taux de commission", group: "Finance" },
  { key: "system.config", label: "Configurer le site (identité, maintenance, CSS)", group: "Système" },
  { key: "marketing.newsletter.send", label: "Envoyer la newsletter", group: "Marketing" },
  { key: "support.triage", label: "Répondre aux tickets support", group: "Support" },
  { key: "audit.read", label: "Consulter le journal d'audit", group: "Système" },
];

export const PERMISSION_KEYS = PERMISSION_CATALOG.map((entry) => entry.key);

export const DEFAULT_ROLE_PERMISSIONS: Record<string, Role[]> = {
  "users.ban": [Role.SUPER_ADMIN, Role.ADMIN, Role.MODERATOR],
  "users.role.update": [Role.SUPER_ADMIN, Role.ADMIN],
  "kyc.review": [Role.SUPER_ADMIN, Role.ADMIN],
  "professionals.verify": [Role.SUPER_ADMIN, Role.ADMIN],
  "content.author": [Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR, Role.PROFESSIONAL],
  "content.review": [Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR],
  "product.moderate": [Role.SUPER_ADMIN, Role.ADMIN],
  "forum.moderate": [Role.SUPER_ADMIN, Role.ADMIN, Role.MODERATOR],
  "forum.feature": [Role.SUPER_ADMIN, Role.ADMIN],
  "finance.refund.approve": [Role.SUPER_ADMIN, Role.ADMIN],
  "finance.dispute.resolve": [Role.SUPER_ADMIN, Role.ADMIN],
  "finance.config": [Role.SUPER_ADMIN],
  "system.config": [Role.SUPER_ADMIN],
  "marketing.newsletter.send": [Role.SUPER_ADMIN, Role.ADMIN],
  "support.triage": [Role.SUPER_ADMIN, Role.ADMIN, Role.MODERATOR, Role.EDITOR, Role.PROFESSIONAL],
  "audit.read": [Role.SUPER_ADMIN],
};

export type PermissionOverrides = { grant?: string[]; revoke?: string[] };
