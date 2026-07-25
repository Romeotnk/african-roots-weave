import { prisma } from "../config/db.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/errors.js";

export const listMySavedSearches = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const searches = await prisma.savedSearch.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: "desc" },
  });
  res.json(apiResponse(true, searches, "Saved searches retrieved"));
});

export const createSavedSearch = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const name = String(req.body.name ?? "").trim();
  if (!name) throw new ApiError(400, "Name is required");

  const search = await prisma.savedSearch.create({
    data: {
      userId: req.user.id,
      name,
      summary: req.body.summary,
      criteria: req.body.criteria,
      isActive: req.body.isActive ?? true,
    },
  });
  res.status(201).json(apiResponse(true, search, "Saved search created"));
});

export const updateSavedSearch = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const existing = await prisma.savedSearch.findUnique({ where: { id: req.params.id }, select: { userId: true } });
  if (!existing || existing.userId !== req.user.id) throw new ApiError(404, "Saved search not found");

  const search = await prisma.savedSearch.update({
    where: { id: req.params.id },
    data: { isActive: req.body.isActive, name: req.body.name, summary: req.body.summary, criteria: req.body.criteria },
  });
  res.json(apiResponse(true, search, "Saved search updated"));
});

export const deleteSavedSearch = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const existing = await prisma.savedSearch.findUnique({ where: { id: req.params.id }, select: { userId: true } });
  if (!existing || existing.userId !== req.user.id) throw new ApiError(404, "Saved search not found");

  await prisma.savedSearch.delete({ where: { id: req.params.id } });
  res.json(apiResponse(true, null, "Saved search deleted"));
});
