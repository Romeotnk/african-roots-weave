import type { NextFunction, Request, Response } from "express";
import { prisma } from "../config/db.js";
import { apiResponse } from "../utils/apiResponse.js";

// Routes that must keep working while the site is in maintenance mode:
// health checks, auth (so an admin can log in), site config/pages (so the
// frontend can render the maintenance banner and CMS pages), the admin panel
// itself (so an admin can turn maintenance back off), and payment webhooks
// (a provider callback must never be dropped just because the storefront is
// paused).
const allowedPrefixes = ["/api/health", "/api/auth", "/api/site", "/api/admin", "/api/webhooks"];

const CACHE_TTL_MS = 15_000;
let cache: { enabled: boolean; expiresAt: number } | null = null;

const isMaintenanceEnabled = async () => {
  const now = Date.now();
  if (cache && cache.expiresAt > now) return cache.enabled;

  const row = await prisma.siteConfig.findUnique({ where: { key: "maintenance.enabled" } });
  const enabled = row?.value === "true";
  cache = { enabled, expiresAt: now + CACHE_TTL_MS };
  return enabled;
};

export const maintenanceMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  if (allowedPrefixes.some((prefix) => req.path.startsWith(prefix))) {
    next();
    return;
  }

  if (await isMaintenanceEnabled()) {
    res.status(503).json(apiResponse(false, null, "Le site est actuellement en maintenance."));
    return;
  }

  next();
};
