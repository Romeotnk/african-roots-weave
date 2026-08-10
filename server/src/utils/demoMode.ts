import { prisma } from "../config/db.js";

// Same cached-SiteConfig-flag pattern as maintenanceMiddleware — a 15s TTL
// keeps every public listing/detail request from hitting the DB just to
// check this toggle, while still applying an admin's change quickly.
const CACHE_TTL_MS = 15_000;
let cache: { hidden: boolean; expiresAt: number } | null = null;

export const isDemoHidden = async (): Promise<boolean> => {
  const now = Date.now();
  if (cache && cache.expiresAt > now) return cache.hidden;

  const row = await prisma.siteConfig.findUnique({ where: { key: "demo.hidden" } });
  const hidden = row?.value === "true";
  cache = { hidden, expiresAt: now + CACHE_TTL_MS };
  return hidden;
};

// Spread into a Prisma `where` clause to exclude rows owned by prisma/seed.ts
// demo accounts when an admin has toggled demo content hidden (SiteConfig
// "demo.hidden"). `ownerRelation` is the relation field pointing at the
// owning User (e.g. "seller", "author", "createdBy", "user") — merge the
// returned object's keys into the caller's existing `where`.
export const demoOwnerFilter = async (ownerRelation: string): Promise<Record<string, unknown>> => {
  if (!(await isDemoHidden())) return {};
  return { [ownerRelation]: { isDemoAccount: false } };
};
