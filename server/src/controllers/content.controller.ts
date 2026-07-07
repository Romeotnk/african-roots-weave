import { ArticleSpace, Role } from "@prisma/client";
import { prisma } from "../config/db.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/errors.js";
import { getPagination, paginationMeta } from "../utils/pagination.js";
import { makeSlug } from "../utils/slug.js";

const adminOnlySpaces: ArticleSpace[] = ["PHARMACOPEE", "RITES_CULTURES"];
const editorialRoles: Role[] = [Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR];

const canPublishContent = (role: Role) => editorialRoles.includes(role);

export const listArticles = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const where = {
    isPublished: true,
    isApproved: true,
    space: req.query.space as ArticleSpace | undefined,
    category: req.query.category as string | undefined,
    authorId: req.query.author as string | undefined,
    tags: req.query.tag ? { has: String(req.query.tag) } : undefined,
  };
  const [articles, total] = await prisma.$transaction([
    prisma.article.findMany({
      where,
      skip,
      take: limit,
      orderBy: { publishedAt: "desc" },
      include: { author: { select: { id: true, firstName: true, lastName: true, role: true } } },
    }),
    prisma.article.count({ where }),
  ]);
  res.json(apiResponse(true, articles, "Articles retrieved", paginationMeta(page, limit, total)));
});

export const listMyArticles = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const { page, limit, skip } = getPagination(req.query);
  const where = { authorId: req.user.id };

  const [articles, total] = await prisma.$transaction([
    prisma.article.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { author: { select: { id: true, firstName: true, lastName: true, role: true } } },
    }),
    prisma.article.count({ where }),
  ]);

  res.json(apiResponse(true, articles, "My articles retrieved", paginationMeta(page, limit, total)));
});

export const getArticle = asyncHandler(async (req, res) => {
  const article = await prisma.article.update({
    where: { slug: req.params.slug },
    data: { views: { increment: 1 } },
    include: { author: { select: { id: true, firstName: true, lastName: true, role: true } } },
  });
  res.json(apiResponse(true, article, "Article retrieved"));
});

export const createArticle = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const space = req.body.space as ArticleSpace;
  if (adminOnlySpaces.includes(space) && !canPublishContent(req.user.role)) {
    throw new ApiError(403, "Editorial space only");
  }

  const article = await prisma.article.create({
    data: {
      authorId: req.user.id,
      space,
      title: req.body.title,
      slug: `${makeSlug(req.body.title)}-${Date.now().toString(36)}`,
      content: req.body.content,
      coverImage: req.body.coverImage,
      category: req.body.category,
      tags: req.body.tags ?? [],
      isApproved: canPublishContent(req.user.role),
      isPublished: canPublishContent(req.user.role) && Boolean(req.body.isPublished),
      publishedAt: canPublishContent(req.user.role) && req.body.isPublished ? new Date() : undefined,
    },
  });
  res.status(201).json(apiResponse(true, article, "Article created"));
});

export const updateArticle = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const existing = await prisma.article.findUnique({
    where: { id: req.params.id },
    select: { authorId: true },
  });
  if (!existing) throw new ApiError(404, "Article not found");
  if (existing.authorId !== req.user.id && !canPublishContent(req.user.role))
    throw new ApiError(403, "Forbidden");

  const article = await prisma.article.update({
    where: { id: req.params.id },
    data: {
      title: req.body.title,
      content: req.body.content,
      coverImage: req.body.coverImage,
      category: req.body.category,
      tags: req.body.tags,
      isApproved: canPublishContent(req.user.role) ? req.body.isApproved : false,
    },
  });
  res.json(apiResponse(true, article, "Article updated"));
});

export const deleteArticle = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const existing = await prisma.article.findUnique({
    where: { id: req.params.id },
    select: { authorId: true },
  });
  if (!existing) throw new ApiError(404, "Article not found");
  if (existing.authorId !== req.user.id && !canPublishContent(req.user.role))
    throw new ApiError(403, "Forbidden");
  await prisma.article.delete({ where: { id: req.params.id } });
  res.json(apiResponse(true, null, "Article deleted"));
});

export const publishArticle = asyncHandler(async (req, res) => {
  const article = await prisma.article.update({
    where: { id: req.params.id },
    data: { isApproved: true, isPublished: true, publishedAt: new Date() },
  });
  res.json(apiResponse(true, article, "Article published"));
});

export const listMonographs = asyncHandler(async (_req, res) => {
  const monographs = await prisma.plantMonograph.findMany({
    where: { isPublished: true },
    orderBy: { scientificName: "asc" },
  });
  res.json(apiResponse(true, monographs, "Monographs retrieved"));
});

export const getMonograph = asyncHandler(async (req, res) => {
  const monograph = await prisma.plantMonograph.findUnique({ where: { id: req.params.id } });
  if (!monograph) throw new ApiError(404, "Monograph not found");
  res.json(apiResponse(true, monograph, "Monograph retrieved"));
});

export const createMonograph = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const monograph = await prisma.plantMonograph.create({
    data: { ...req.body, createdById: req.user.id },
  });
  res.status(201).json(apiResponse(true, monograph, "Monograph created"));
});

export const updateMonograph = asyncHandler(async (req, res) => {
  const monograph = await prisma.plantMonograph.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.json(apiResponse(true, monograph, "Monograph updated"));
});
