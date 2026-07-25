import { prisma } from "../config/db.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/errors.js";

// Only "site.", "cms." and "maintenance." keys are ever exposed here — commission
// rates and other internal SiteConfig keys must never leak through this
// unauthenticated endpoint.
const publicPrefixes = ["site.", "cms.", "maintenance."];

export const getPublicSiteConfig = asyncHandler(async (_req, res) => {
  const rows = await prisma.siteConfig.findMany({
    where: { OR: publicPrefixes.map((prefix) => ({ key: { startsWith: prefix } })) },
  });
  const config = Object.fromEntries(rows.map((row) => [row.key, row.value]));
  res.json(apiResponse(true, config, "Site config retrieved"));
});

export const getPublicPage = asyncHandler(async (req, res) => {
  const row = await prisma.siteConfig.findUnique({ where: { key: "cms.pages" } });
  const pages: Array<{ slug: string; isPublished: boolean }> = row ? JSON.parse(row.value) : [];
  const page = pages.find((item) => item.slug === req.params.slug && item.isPublished);
  if (!page) throw new ApiError(404, "Page not found");
  res.json(apiResponse(true, page, "Page retrieved"));
});
