import { prisma } from "../config/db.js";
import { writeAuditLog } from "../services/audit.service.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/errors.js";
import { getPagination, paginationMeta } from "../utils/pagination.js";
import { makeSlug } from "../utils/slug.js";

// Reports (signalements).
export const listReports = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const where = {
    status: typeof req.query.status === "string" ? (req.query.status as never) : undefined,
    targetType: typeof req.query.targetType === "string" ? req.query.targetType : undefined,
  };

  const [reports, total] = await prisma.$transaction([
    prisma.report.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { reporter: { select: { id: true, firstName: true, lastName: true, email: true } } },
    }),
    prisma.report.count({ where }),
  ]);

  res.json(apiResponse(true, reports, "Reports retrieved", paginationMeta(page, limit, total)));
});

const hideTarget = async (targetType: string, targetId: string, hidden: boolean, reason?: string) => {
  if (targetType === "QUESTION") {
    await prisma.question.update({ where: { id: targetId }, data: { isHidden: hidden } });
  } else if (targetType === "ANSWER") {
    await prisma.answer.update({ where: { id: targetId }, data: { isHidden: hidden } });
  } else if (targetType === "COMMENT") {
    await prisma.forumComment.update({ where: { id: targetId }, data: { isHidden: hidden } });
  } else if (targetType === "REVIEW") {
    await prisma.review.update({
      where: { id: targetId },
      data: { isHidden: hidden, hiddenReason: hidden ? reason : null },
    });
  } else if (targetType === "PRODUCT") {
    await prisma.product.update({ where: { id: targetId }, data: { isActive: !hidden } });
  } else {
    throw new ApiError(400, `Unsupported report targetType: ${targetType}`);
  }
};

export const resolveReport = asyncHandler(async (req, res) => {
  const action = req.body.action as "DISMISS" | "ACTION";
  const report = await prisma.report.findUnique({ where: { id: req.params.id } });
  if (!report) throw new ApiError(404, "Report not found");

  if (action === "ACTION") {
    await hideTarget(report.targetType, report.targetId, true, req.body.reason);
  }

  const updated = await prisma.report.update({
    where: { id: report.id },
    data: { status: action === "ACTION" ? "ACTIONED" : "DISMISSED" },
  });

  await writeAuditLog(req, {
    action: action === "ACTION" ? "REPORT_ACTIONED" : "REPORT_DISMISSED",
    targetId: report.targetId,
    targetType: report.targetType,
    metadata: { reportId: report.id, reason: req.body.reason },
  });

  res.json(apiResponse(true, updated, "Report resolved"));
});

// Forum moderation.
export const listAdminQuestions = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const where = {
    isHidden: req.query.hidden === "true" ? true : req.query.hidden === "false" ? false : undefined,
  };
  const [questions, total] = await prisma.$transaction([
    prisma.question.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { author: { select: { id: true, firstName: true, lastName: true } } },
    }),
    prisma.question.count({ where }),
  ]);
  res.json(apiResponse(true, questions, "Questions retrieved", paginationMeta(page, limit, total)));
});

export const hideQuestion = asyncHandler(async (req, res) => {
  const question = await prisma.question.update({
    where: { id: req.params.id },
    data: { isHidden: Boolean(req.body.hidden) },
  });
  await writeAuditLog(req, {
    action: question.isHidden ? "QUESTION_HIDDEN" : "QUESTION_UNHIDDEN",
    targetId: question.id,
    targetType: "Question",
  });
  res.json(apiResponse(true, question, "Question updated"));
});

export const hideAnswer = asyncHandler(async (req, res) => {
  const answer = await prisma.answer.update({
    where: { id: req.params.id },
    data: { isHidden: Boolean(req.body.hidden) },
  });
  await writeAuditLog(req, {
    action: answer.isHidden ? "ANSWER_HIDDEN" : "ANSWER_UNHIDDEN",
    targetId: answer.id,
    targetType: "Answer",
  });
  res.json(apiResponse(true, answer, "Answer updated"));
});

export const listAdminComments = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const where = {
    isHidden: req.query.hidden === "true" ? true : req.query.hidden === "false" ? false : undefined,
  };
  const [comments, total] = await prisma.$transaction([
    prisma.forumComment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { author: { select: { id: true, firstName: true, lastName: true } } },
    }),
    prisma.forumComment.count({ where }),
  ]);
  res.json(apiResponse(true, comments, "Comments retrieved", paginationMeta(page, limit, total)));
});

export const hideComment = asyncHandler(async (req, res) => {
  const comment = await prisma.forumComment.update({
    where: { id: req.params.id },
    data: { isHidden: Boolean(req.body.hidden) },
  });
  await writeAuditLog(req, {
    action: comment.isHidden ? "COMMENT_HIDDEN" : "COMMENT_UNHIDDEN",
    targetId: comment.id,
    targetType: "ForumComment",
  });
  res.json(apiResponse(true, comment, "Comment updated"));
});

// Forum category management (hierarchical, one level of nesting).
export const listAdminForumCategories = asyncHandler(async (_req, res) => {
  const categories = await prisma.forumCategory.findMany({
    orderBy: [{ position: "asc" }, { name: "asc" }],
    include: { _count: { select: { questions: true } } },
  });
  res.json(apiResponse(true, categories, "Forum categories retrieved"));
});

export const createForumCategory = asyncHandler(async (req, res) => {
  const name = String(req.body.name ?? "").trim();
  if (!name) throw new ApiError(400, "Category name is required");
  const parentId = typeof req.body.parentId === "string" && req.body.parentId ? req.body.parentId : undefined;
  const slugBase = makeSlug(name);
  const slug = parentId ? `${parentId.slice(0, 6)}-${slugBase}` : slugBase;

  const category = await prisma.forumCategory.create({
    data: { name, slug, parentId, position: Number(req.body.position ?? 0) },
  });
  await writeAuditLog(req, { action: "FORUM_CATEGORY_CREATED", targetId: category.id, targetType: "ForumCategory" });
  res.status(201).json(apiResponse(true, category, "Category created"));
});

export const updateForumCategory = asyncHandler(async (req, res) => {
  const category = await prisma.forumCategory.update({
    where: { id: req.params.id },
    data: {
      name: req.body.name,
      position: req.body.position !== undefined ? Number(req.body.position) : undefined,
    },
  });
  await writeAuditLog(req, { action: "FORUM_CATEGORY_UPDATED", targetId: category.id, targetType: "ForumCategory" });
  res.json(apiResponse(true, category, "Category updated"));
});

export const deleteForumCategory = asyncHandler(async (req, res) => {
  const childCount = await prisma.forumCategory.count({ where: { parentId: req.params.id } });
  if (childCount > 0) throw new ApiError(400, "Supprimez d'abord les sous-catégories.");
  await prisma.forumCategory.delete({ where: { id: req.params.id } });
  await writeAuditLog(req, { action: "FORUM_CATEGORY_DELETED", targetId: req.params.id, targetType: "ForumCategory" });
  res.json(apiResponse(true, null, "Category deleted"));
});

// Review moderation.
export const listAdminReviews = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const where = {
    isHidden: req.query.hidden === "true" ? true : req.query.hidden === "false" ? false : undefined,
    targetType: typeof req.query.targetType === "string" ? (req.query.targetType as never) : undefined,
  };
  const [reviews, total] = await prisma.$transaction([
    prisma.review.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { author: { select: { id: true, firstName: true, lastName: true } } },
    }),
    prisma.review.count({ where }),
  ]);
  res.json(apiResponse(true, reviews, "Reviews retrieved", paginationMeta(page, limit, total)));
});

export const hideReview = asyncHandler(async (req, res) => {
  const hidden = Boolean(req.body.hidden);
  const review = await prisma.review.update({
    where: { id: req.params.id },
    data: { isHidden: hidden, hiddenReason: hidden ? req.body.reason : null },
  });
  await writeAuditLog(req, {
    action: hidden ? "REVIEW_HIDDEN" : "REVIEW_UNHIDDEN",
    targetId: review.id,
    targetType: "Review",
    metadata: { reason: req.body.reason },
  });
  res.json(apiResponse(true, review, "Review updated"));
});
