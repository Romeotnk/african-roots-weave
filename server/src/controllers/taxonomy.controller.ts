import { prisma } from "../config/db.js";
import { writeAuditLog } from "../services/audit.service.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/errors.js";
import { makeSlug } from "../utils/slug.js";

export const TAXONOMY_SCOPES = ["PROFESSIONAL_SPECIALTY", "ARTICLE_CATEGORY"] as const;

const assertScope = (value: unknown): (typeof TAXONOMY_SCOPES)[number] => {
  if (typeof value !== "string" || !(TAXONOMY_SCOPES as readonly string[]).includes(value)) {
    throw new ApiError(400, "Invalid taxonomy scope");
  }
  return value as (typeof TAXONOMY_SCOPES)[number];
};

export const listAdminTaxonomy = asyncHandler(async (req, res) => {
  const scope = assertScope(req.query.scope);
  const items = await prisma.taxonomy.findMany({ where: { scope }, orderBy: [{ position: "asc" }, { name: "asc" }] });
  res.json(apiResponse(true, items, "Taxonomy retrieved"));
});

export const createTaxonomy = asyncHandler(async (req, res) => {
  const scope = assertScope(req.body.scope);
  const name = String(req.body.name ?? "").trim();
  if (!name) throw new ApiError(400, "Name is required");

  const item = await prisma.taxonomy.create({
    data: { scope, name, slug: makeSlug(name), position: Number(req.body.position ?? 0) || 0 },
  });
  await writeAuditLog(req, { action: "TAXONOMY_CREATED", targetId: item.id, targetType: "Taxonomy" });
  res.status(201).json(apiResponse(true, item, "Taxonomy created"));
});

export const updateTaxonomy = asyncHandler(async (req, res) => {
  const data: { name?: string; slug?: string; position?: number } = {};
  if (typeof req.body.name === "string" && req.body.name.trim()) {
    const name = req.body.name.trim();
    data.name = name;
    data.slug = makeSlug(name);
  }
  if (req.body.position !== undefined) data.position = Number(req.body.position) || 0;

  const item = await prisma.taxonomy.update({ where: { id: req.params.id }, data });
  await writeAuditLog(req, { action: "TAXONOMY_UPDATED", targetId: item.id, targetType: "Taxonomy" });
  res.json(apiResponse(true, item, "Taxonomy updated"));
});

export const deleteTaxonomy = asyncHandler(async (req, res) => {
  await prisma.taxonomy.delete({ where: { id: req.params.id } });
  await writeAuditLog(req, { action: "TAXONOMY_DELETED", targetId: req.params.id, targetType: "Taxonomy" });
  res.json(apiResponse(true, null, "Taxonomy deleted"));
});
