import { ReportReasonCategory, Role } from "@prisma/client";
import { prisma } from "../config/db.js";
import { uploadBufferToCloudinary } from "../services/cloudinary.service.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { demoOwnerFilter, isDemoHidden } from "../utils/demoMode.js";
import { ApiError } from "../utils/errors.js";
import { getPagination, paginationMeta } from "../utils/pagination.js";
import { sanitizeRichText } from "../utils/sanitizeRichText.js";

const moderatorRoles: Role[] = [Role.SUPER_ADMIN, Role.ADMIN];

// Custom fields are stored as a flat JSON object on Question (e.g. {difficulty: "Facile"}).
// Filtering on them arrives as repeated `cf_<key>=<value>` query params and is translated
// into Postgres JSON-path equality filters, ANDed together.
const buildCustomFieldFilters = (query: Record<string, unknown>) =>
  Object.entries(query)
    .filter(([key]) => key.startsWith("cf_"))
    .map(([key, value]) => ({
      customFields: { path: [key.slice(3)], equals: String(value) },
    }));

export const listQuestions = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const customFieldFilters = buildCustomFieldFilters(req.query as Record<string, unknown>);
  const where = {
    category: req.query.category as string | undefined,
    categoryId: req.query.categoryId as string | undefined,
    tags: req.query.tag ? { has: String(req.query.tag) } : undefined,
    isClosed:
      req.query.status === "closed" ? true : req.query.status === "open" ? false : undefined,
    isHidden: false,
    ...(customFieldFilters.length > 0 ? { AND: customFieldFilters } : {}),
    ...(await demoOwnerFilter("author")),
  };
  const [questions, total] = await prisma.$transaction([
    prisma.question.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, reputationScore: true, avatarUrl: true } },
        categoryRef: true,
        _count: { select: { answers: true } },
      },
    }),
    prisma.question.count({ where }),
  ]);
  res.json(apiResponse(true, questions, "Questions retrieved", paginationMeta(page, limit, total)));
});

export const listForumCategories = asyncHandler(async (_req, res) => {
  const categories = await prisma.forumCategory.findMany({
    orderBy: [{ position: "asc" }, { name: "asc" }],
  });
  const roots = categories.filter((category) => !category.parentId);
  const tree = roots.map((root) => ({
    ...root,
    children: categories.filter((category) => category.parentId === root.id),
  }));
  res.json(apiResponse(true, tree, "Forum categories retrieved"));
});

export const listMyQuestions = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const { page, limit, skip } = getPagination(req.query);

  const where = { authorId: req.user.id };
  const [questions, total] = await prisma.$transaction([
    prisma.question.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { answers: true } } },
    }),
    prisma.question.count({ where }),
  ]);

  res.json(apiResponse(true, questions, "My questions retrieved", paginationMeta(page, limit, total)));
});

export const getQuestion = asyncHandler(async (req, res) => {
  const question = await prisma.question.update({
    where: { id: req.params.id },
    data: { viewCount: { increment: 1 } },
    include: {
      answers: {
        where: { isHidden: false },
        orderBy: [{ isAccepted: "desc" }, { voteCount: "desc" }],
        include: { author: { select: { id: true, firstName: true, lastName: true, reputationScore: true, avatarUrl: true } } },
      },
      author: { select: { id: true, firstName: true, lastName: true, reputationScore: true, avatarUrl: true, isDemoAccount: true } },
      categoryRef: { include: { parent: true } },
    },
  });
  if (question.isHidden || (question.author.isDemoAccount && (await isDemoHidden()))) {
    throw new ApiError(404, "Question not found");
  }
  const comments = await prisma.forumComment.findMany({
    where: { targetId: question.id, targetType: "QUESTION", isHidden: false },
    include: { author: { select: { id: true, firstName: true, lastName: true } } },
    orderBy: { createdAt: "asc" },
  });
  const { isDemoAccount: _isDemoAccount, ...author } = question.author;
  res.json(apiResponse(true, { ...question, author, comments }, "Question retrieved"));
});

// A categoryId always wins over a free-text category name: the flat `category`
// string is kept as a denormalized copy of the leaf category's name so every
// existing reader of `question.category` keeps working unchanged.
const resolveCategory = async (categoryId: unknown, fallbackName: unknown) => {
  if (typeof categoryId === "string" && categoryId) {
    const category = await prisma.forumCategory.findUnique({ where: { id: categoryId } });
    if (category) return { categoryId: category.id, category: category.name };
  }
  return { categoryId: undefined, category: fallbackName as string | undefined };
};

export const createQuestion = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const resolvedCategory = await resolveCategory(req.body.categoryId, req.body.category);
  if (!resolvedCategory.category) throw new ApiError(400, "Category is required");
  const question = await prisma.question.create({
    data: {
      authorId: req.user.id,
      title: req.body.title,
      content: sanitizeRichText(req.body.content ?? ""),
      category: resolvedCategory.category,
      categoryId: resolvedCategory.categoryId,
      customFields: req.body.customFields ?? undefined,
      tags: req.body.tags ?? [],
      attachments: req.body.attachments ?? [],
    },
  });
  res.status(201).json(apiResponse(true, question, "Question created"));
});

export const updateQuestion = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const q = await prisma.question.findUnique({
    where: { id: req.params.id },
    select: { authorId: true },
  });
  if (!q) throw new ApiError(404, "Question not found");
  if (q.authorId !== req.user.id && !moderatorRoles.includes(req.user.role))
    throw new ApiError(403, "Forbidden");
  const resolvedCategory =
    req.body.categoryId !== undefined || req.body.category !== undefined
      ? await resolveCategory(req.body.categoryId, req.body.category)
      : { categoryId: undefined, category: undefined };
  const question = await prisma.question.update({
    where: { id: req.params.id },
    data: {
      title: req.body.title,
      content: req.body.content !== undefined ? sanitizeRichText(req.body.content) : undefined,
      category: resolvedCategory.category,
      categoryId: resolvedCategory.categoryId,
      customFields: req.body.customFields ?? undefined,
      tags: req.body.tags,
    },
  });
  res.json(apiResponse(true, question, "Question updated"));
});

export const createAnswer = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const answer = await prisma.answer.create({
    data: {
      questionId: req.params.id,
      authorId: req.user.id,
      content: sanitizeRichText(req.body.content ?? ""),
      attachments: req.body.attachments ?? [],
    },
  });
  res.status(201).json(apiResponse(true, answer, "Answer created"));
});

export const updateAnswer = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const a = await prisma.answer.findUnique({
    where: { id: req.params.id },
    select: { authorId: true },
  });
  if (!a) throw new ApiError(404, "Answer not found");
  if (a.authorId !== req.user.id && !moderatorRoles.includes(req.user.role))
    throw new ApiError(403, "Forbidden");
  const answer = await prisma.answer.update({
    where: { id: req.params.id },
    data: { content: sanitizeRichText(req.body.content ?? "") },
  });
  res.json(apiResponse(true, answer, "Answer updated"));
});

export const acceptAnswer = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const answer = await prisma.answer.findUnique({
    where: { id: req.params.id },
    include: { question: true },
  });
  if (!answer) throw new ApiError(404, "Answer not found");
  if (answer.question.authorId !== req.user.id)
    throw new ApiError(403, "Only the question author can accept an answer");

  await prisma.$transaction([
    prisma.answer.updateMany({
      where: { questionId: answer.questionId },
      data: { isAccepted: false },
    }),
    prisma.answer.update({ where: { id: answer.id }, data: { isAccepted: true } }),
    prisma.question.update({
      where: { id: answer.questionId },
      data: { acceptedAnswerId: answer.id },
    }),
  ]);
  res.json(apiResponse(true, null, "Answer accepted"));
});

export const createComment = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const content = String(req.body.content ?? "").trim();
  if (!content) throw new ApiError(400, "Comment content is required");
  const comment = await prisma.forumComment.create({
    data: {
      authorId: req.user.id,
      targetId: req.body.targetId,
      targetType: req.body.targetType,
      content,
    },
  });
  res.status(201).json(apiResponse(true, comment, "Comment created"));
});

export const updateComment = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const content = String(req.body.content ?? "").trim();
  if (!content) throw new ApiError(400, "Comment content is required");
  const existing = await prisma.forumComment.findUnique({
    where: { id: req.params.id },
    select: { authorId: true },
  });
  if (!existing) throw new ApiError(404, "Comment not found");
  if (existing.authorId !== req.user.id && !moderatorRoles.includes(req.user.role))
    throw new ApiError(403, "Forbidden");
  const comment = await prisma.forumComment.update({
    where: { id: req.params.id },
    data: { content },
  });
  res.json(apiResponse(true, comment, "Comment updated"));
});

export const vote = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const value = Number(req.body.value);
  const result = await prisma.$transaction(async (tx) => {
    const previous = await tx.vote.findUnique({
      where: {
        userId_targetId_targetType: {
          userId: req.user!.id,
          targetId: req.body.targetId,
          targetType: req.body.targetType,
        },
      },
    });
    const delta = previous ? value - previous.value : value;
    const saved = await tx.vote.upsert({
      where: {
        userId_targetId_targetType: {
          userId: req.user!.id,
          targetId: req.body.targetId,
          targetType: req.body.targetType,
        },
      },
      update: { value },
      create: {
        userId: req.user!.id,
        targetId: req.body.targetId,
        targetType: req.body.targetType,
        value,
      },
    });
    if (req.body.targetType === "QUESTION") {
      const q = await tx.question.update({
        where: { id: req.body.targetId },
        data: { voteCount: { increment: delta } },
        select: { authorId: true },
      });
      await tx.user.update({
        where: { id: q.authorId },
        data: { reputationScore: { increment: delta > 0 ? 5 : -2 } },
      });
    }
    if (req.body.targetType === "ANSWER") {
      const a = await tx.answer.update({
        where: { id: req.body.targetId },
        data: { voteCount: { increment: delta } },
        select: { authorId: true },
      });
      await tx.user.update({
        where: { id: a.authorId },
        data: { reputationScore: { increment: delta > 0 ? 5 : -2 } },
      });
    }
    if (req.body.targetType === "COMMENT") {
      const c = await tx.forumComment.update({
        where: { id: req.body.targetId },
        data: { voteCount: { increment: delta } },
        select: { authorId: true },
      });
      await tx.user.update({
        where: { id: c.authorId },
        data: { reputationScore: { increment: delta > 0 ? 5 : -2 } },
      });
    }
    return saved;
  });
  res.json(apiResponse(true, result, "Vote saved"));
});

export const toggleFavorite = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const targetId = String(req.body.targetId ?? "");
  const targetType = String(req.body.targetType ?? "QUESTION");
  if (!targetId) throw new ApiError(400, "targetId is required");

  const existing = await prisma.favorite.findUnique({
    where: { userId_targetId_targetType: { userId: req.user.id, targetId, targetType } },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    res.json(apiResponse(true, { favorited: false }, "Favorite removed"));
    return;
  }

  await prisma.favorite.create({ data: { userId: req.user.id, targetId, targetType } });
  res.status(201).json(apiResponse(true, { favorited: true }, "Favorite added"));
});

export const listMyFavorites = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const targetType = typeof req.query.targetType === "string" ? req.query.targetType : "QUESTION";
  const favorites = await prisma.favorite.findMany({
    where: { userId: req.user.id, targetType },
    orderBy: { createdAt: "desc" },
  });

  if (targetType === "QUESTION") {
    const questions = await prisma.question.findMany({
      where: { id: { in: favorites.map((favorite) => favorite.targetId) }, isHidden: false },
      include: { author: { select: { id: true, firstName: true, lastName: true, reputationScore: true, avatarUrl: true } } },
    });
    const byId = new Map(questions.map((question) => [question.id, question]));
    const ordered = favorites.map((favorite) => byId.get(favorite.targetId)).filter(Boolean);
    res.json(apiResponse(true, ordered, "Favorites retrieved"));
    return;
  }

  if (targetType === "ANSWER") {
    const answers = await prisma.answer.findMany({
      where: { id: { in: favorites.map((favorite) => favorite.targetId) }, isHidden: false },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, reputationScore: true, avatarUrl: true } },
        question: { select: { id: true, title: true } },
      },
    });
    const byId = new Map(answers.map((answer) => [answer.id, answer]));
    const ordered = favorites.map((favorite) => byId.get(favorite.targetId)).filter(Boolean);
    res.json(apiResponse(true, ordered, "Favorites retrieved"));
    return;
  }

  res.json(apiResponse(true, favorites, "Favorites retrieved"));
});

// Admin-configurable via SiteConfig ("forum.autoHideReportThreshold", see the
// forum admin "Réglages" panel) — defaults to 3 reports to match the
// threshold this project has always used, without a deploy to change it.
const DEFAULT_AUTO_HIDE_THRESHOLD = 3;

const getAutoHideThreshold = async () => {
  const row = await prisma.siteConfig.findUnique({ where: { key: "forum.autoHideReportThreshold" } });
  const parsed = row ? Number(row.value) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_AUTO_HIDE_THRESHOLD;
};

export const report = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const targetId = String(req.body.targetId ?? "");
  const targetType = String(req.body.targetType ?? "");
  const reason = String(req.body.reason ?? "");
  const reasonCategoryRaw = typeof req.body.reasonCategory === "string" ? req.body.reasonCategory : undefined;
  const reasonCategory = Object.values(ReportReasonCategory).includes(reasonCategoryRaw as ReportReasonCategory)
    ? (reasonCategoryRaw as ReportReasonCategory)
    : undefined;
  // A predefined category or a free-text reason must be present — kept permissive
  // (not requiring reasonCategory outright) so this shared endpoint (products,
  // questions, answers, comments) doesn't break for any caller that only sends `reason`.
  if (!targetId || !targetType || (!reason && !reasonCategory)) {
    throw new ApiError(422, "targetId, targetType and a reason or reasonCategory are required");
  }

  const reportItem = await prisma.report.create({
    data: { targetId, targetType, reason, reasonCategory, reporterId: req.user.id },
  });
  const count = await prisma.report.count({
    where: { targetId, targetType },
  });
  const threshold = await getAutoHideThreshold();
  if (count >= threshold && targetType === "QUESTION")
    await prisma.question.update({ where: { id: targetId }, data: { isHidden: true } });
  if (count >= threshold && targetType === "ANSWER")
    await prisma.answer.update({ where: { id: targetId }, data: { isHidden: true } });
  if (count >= threshold && targetType === "COMMENT")
    await prisma.forumComment.update({ where: { id: targetId }, data: { isHidden: true } });
  res.status(201).json(apiResponse(true, reportItem, "Report submitted"));
});

export const featureQuestion = asyncHandler(async (req, res) => {
  const isFeatured = typeof req.body.isFeatured === "boolean" ? req.body.isFeatured : true;
  const question = await prisma.question.update({
    where: { id: req.params.id },
    data: { isFeatured },
  });
  res.json(apiResponse(true, question, isFeatured ? "Question featured" : "Question unfeatured"));
});

export const closeQuestion = asyncHandler(async (req, res) => {
  const isClosed = typeof req.body.isClosed === "boolean" ? req.body.isClosed : true;
  const question = await prisma.question.update({
    where: { id: req.params.id },
    data: { isClosed },
  });
  res.json(apiResponse(true, question, isClosed ? "Question closed" : "Question reopened"));
});

export const uploadForumAttachments = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  if (files.length === 0) throw new ApiError(400, "Aucun fichier fourni");

  const urls = await Promise.all(
    files.map((file) => uploadBufferToCloudinary(file.buffer, "iwosan/forum-attachments", "auto")),
  );
  res.json(apiResponse(true, { urls }, "Attachments uploaded"));
});

export const searchQuestions = asyncHandler(async (req, res) => {
  const q = String(req.query.q ?? "");
  const questions = await prisma.question.findMany({
    where: {
      isHidden: false,
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { content: { contains: q, mode: "insensitive" } },
      ],
    },
    take: 10,
    select: { id: true, title: true, category: true, tags: true },
  });
  res.json(apiResponse(true, questions, "Search results retrieved"));
});
