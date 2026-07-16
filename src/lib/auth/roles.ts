import type { AppRole } from "@/lib/auth/AuthContext";

export const USER_ACCOUNT_ROLES: AppRole[] = ["user", "researcher", "professional", "admin", "super_admin"];
export const PROFESSIONAL_ACCOUNT_ROLES: AppRole[] = ["professional", "researcher", "admin", "super_admin"];
export const ADMIN_ACCOUNT_ROLES: AppRole[] = ["super_admin", "admin", "moderator", "editor"];

export const isProfessionalAccount = (roles: AppRole[]) =>
  roles.some((role) => PROFESSIONAL_ACCOUNT_ROLES.includes(role));

export const getAccountHomePath = (roles: AppRole[]) =>
  isProfessionalAccount(roles) ? "/tableau-de-bord" : "/mon-compte";
