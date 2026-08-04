import { prisma } from "../config/db.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/errors.js";

// Only these prefixes are ever exposed here — commission rates and other
// internal SiteConfig keys must never leak through this unauthenticated
// endpoint. "forum." carries only the posting-restriction flag/role list,
// which the frontend needs to hide post/answer/comment UI for disallowed roles.
// CMS pages live in the dedicated Page model (see getPublicPage below), not SiteConfig.
const publicPrefixes = ["site.", "maintenance.", "forum.", "homepage."];

// This endpoint is hit on literally every page load — it backs the root
// route's SSR loader (see src/routes/__root.tsx), which blocks the entire
// render on this response for the <title>/meta tags. Site config changes
// only when an admin edits it in the admin panel, so a short cache turns an
// unconditional DB round-trip on every navigation into a near-instant
// response almost all the time, without ever serving stale data for more
// than a few seconds after an actual change.
const CACHE_TTL_MS = 30_000;
let cache: { config: Record<string, string>; expiresAt: number } | null = null;

export const invalidatePublicSiteConfigCache = () => {
  cache = null;
};

export const getPublicSiteConfig = asyncHandler(async (_req, res) => {
  const now = Date.now();
  if (!cache || cache.expiresAt <= now) {
    const rows = await prisma.siteConfig.findMany({
      where: { OR: publicPrefixes.map((prefix) => ({ key: { startsWith: prefix } })) },
    });
    cache = { config: Object.fromEntries(rows.map((row) => [row.key, row.value])), expiresAt: now + CACHE_TTL_MS };
  }
  res.json(apiResponse(true, cache.config, "Site config retrieved"));
});

export const getPublicPage = asyncHandler(async (req, res) => {
  const page = await prisma.page.findFirst({ where: { slug: req.params.slug, isPublished: true } });
  if (!page) throw new ApiError(404, "Page not found");
  res.json(apiResponse(true, page, "Page retrieved"));
});

export const getPublicBanners = asyncHandler(async (_req, res) => {
  const banners = await prisma.homeBanner.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
    select: { id: true, imageUrl: true, title: true, link: true },
  });
  res.json(apiResponse(true, banners, "Banners retrieved"));
});

export const getPublicPartnerLogos = asyncHandler(async (_req, res) => {
  const logos = await prisma.partnerLogo.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
    select: { id: true, imageUrl: true, title: true, link: true },
  });
  res.json(apiResponse(true, logos, "Partner logos retrieved"));
});

export const getPublicAds = asyncHandler(async (req, res) => {
  const position = typeof req.query.position === "string" ? req.query.position : undefined;
  const ads = await prisma.adSpace.findMany({
    where: { isActive: true, position },
    select: { id: true, position: true, code: true },
  });
  res.json(apiResponse(true, ads, "Ads retrieved"));
});

const PUBLIC_TAXONOMY_SCOPES = ["PROFESSIONAL_SPECIALTY", "ARTICLE_CATEGORY"];

export const getPublicTaxonomy = asyncHandler(async (req, res) => {
  const scope = typeof req.query.scope === "string" ? req.query.scope : "";
  if (!PUBLIC_TAXONOMY_SCOPES.includes(scope)) throw new ApiError(400, "Invalid taxonomy scope");

  const items = await prisma.taxonomy.findMany({
    where: { scope },
    orderBy: [{ position: "asc" }, { name: "asc" }],
    select: { id: true, name: true, slug: true },
  });
  res.json(apiResponse(true, items, "Taxonomy retrieved"));
});
