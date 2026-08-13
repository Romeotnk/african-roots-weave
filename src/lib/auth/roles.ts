import type { AppRole } from "@/lib/auth/AuthContext";

export const USER_ACCOUNT_ROLES: AppRole[] = ["user", "professional", "admin", "super_admin"];
// Authorization axis: who is allowed to open the seller tools. Admin/super
// admin are included here because the role merge gave them every
// professional-tier permission. This is NOT the same question as "is this
// account a merchant with a storefront" — see isStaffAccount/isPureProfessional
// below, which the UI uses to decide what to *show by default*.
export const PROFESSIONAL_ACCOUNT_ROLES: AppRole[] = ["professional", "admin", "super_admin"];
export const ADMIN_ACCOUNT_ROLES: AppRole[] = ["super_admin", "admin"];
export const STAFF_ROLES: AppRole[] = ["admin", "super_admin"];

export const isProfessionalAccount = (roles: AppRole[]) =>
  roles.some((role) => PROFESSIONAL_ACCOUNT_ROLES.includes(role));

export const isStaffAccount = (roles: AppRole[]) => roles.some((role) => STAFF_ROLES.includes(role));

// True only for accounts that are commercially a professional (a real
// seller/practitioner), as opposed to staff who merely inherited
// professional-tier permissions through the role merge. Drives whether
// commerce-only UI (storefront, KYC self-submission, "become a pro" CTA,
// products/orders/subscription tiles) is shown by default.
export const isPureProfessional = (roles: AppRole[]) => isProfessionalAccount(roles) && !isStaffAccount(roles);

export const getAccountHomePath = (roles: AppRole[]) =>
  isStaffAccount(roles) ? "/admin" : isProfessionalAccount(roles) ? "/tableau-de-bord" : "/mon-compte";
