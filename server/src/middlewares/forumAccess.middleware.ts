import type { NextFunction, Request, Response } from "express";
import { prisma } from "../config/db.js";
import { ApiError } from "../utils/errors.js";

const CACHE_TTL_MS = 15_000;
let cache: { restricted: boolean; allowedRoles: string[]; expiresAt: number } | null = null;

const getForumPostingConfig = async () => {
  const now = Date.now();
  if (cache && cache.expiresAt > now) return cache;

  const rows = await prisma.siteConfig.findMany({
    where: { key: { in: ["forum.restrictPosting", "forum.allowedRoles"] } },
  });
  const byKey = new Map(rows.map((row) => [row.key, row.value]));
  const restricted = byKey.get("forum.restrictPosting") === "true";
  const allowedRoles = (byKey.get("forum.allowedRoles") ?? "")
    .split(",")
    .map((role) => role.trim())
    .filter(Boolean);

  cache = { restricted, allowedRoles, expiresAt: now + CACHE_TTL_MS };
  return cache;
};

// Gates question/answer/comment creation behind an admin-configurable
// SiteConfig flag ("forum.restrictPosting" + "forum.allowedRoles"). Off by
// default so the forum stays open to any verified user, matching current
// behavior; admins can restrict posting to specific roles without a deploy.
export const forumPostingAccess = async (req: Request, _res: Response, next: NextFunction) => {
  const { restricted, allowedRoles } = await getForumPostingConfig();
  if (!restricted || allowedRoles.length === 0) {
    next();
    return;
  }

  if (!req.user || !allowedRoles.includes(req.user.role)) {
    next(new ApiError(403, "La publication sur le forum est actuellement restreinte."));
    return;
  }

  next();
};
