import { Role } from "@prisma/client";
import { prisma } from "../config/db.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/errors.js";
import { getPagination, paginationMeta } from "../utils/pagination.js";

const moderatorRoles: Role[] = [Role.MODERATOR, Role.ADMIN];

export const listQuestions = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const where = {
    category: req.query.category as string | undefined,
    tags: req.query.tag ? { has: String(req.query.tag) } : undefined,
    isClosed:
      req.query.status === "closed" ? true : req.query.status === "open" ? false : undefined,
    isHidden: false,
  };
  const [questions, total] = await prisma.$transaction([
    prisma.question.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" } }),
    prisma.question.count({ where }),
  ]);
  res.json(apiResponse(true, questions, "Questions retrieved", paginationMeta(page, limit, total)));
});

export const getQuestion = asyncHandler(async (req, res) => {
  const question = await prisma.question.update({
    where: { id: req.params.id },
    data: { viewCount: { increment: 1 } },
    include: {
      answers: { orderBy: [{ isAccepted: "desc" }, { voteCount: "desc" }] },
      author: { select: { id: true, firstName: true, lastName: true } },
    },
  });
  res.json(apiResponse(true, question, "Question retrieved"));
});

export const createQuestion = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const question = await prisma.question.create({
    data: {
      authorId: req.user.id,
      title: req.body.title,
      content: req.body.content,
      category: req.body.category,
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
  const question = await prisma.question.update({ where: { id: req.params.id }, data: req.body });
  res.json(apiResponse(true, question, "Question updated"));
});

export const createAnswer = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const answer = await prisma.answer.create({
    data: {
      questionId: req.params.id,
      authorId: req.user.id,
      content: req.body.content,
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
    data: { content: req.body.content },
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
  const comment = await prisma.forumComment.create({
    data: { ...req.body, authorId: req.user.id },
  });
  res.status(201).json(apiResponse(true, comment, "Comment created"));
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
    return saved;
  });
  res.json(apiResponse(true, result, "Vote saved"));
});

export const report = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const reportItem = await prisma.report.create({ data: { ...req.body, reporterId: req.user.id } });
  const count = await prisma.report.count({
    where: { targetId: req.body.targetId, targetType: req.body.targetType },
  });
  if (count >= 3 && req.body.targetType === "QUESTION")
    await prisma.question.update({ where: { id: req.body.targetId }, data: { isHidden: true } });
  if (count >= 3 && req.body.targetType === "ANSWER")
    await prisma.answer.update({ where: { id: req.body.targetId }, data: { isHidden: true } });
  res.status(201).json(apiResponse(true, reportItem, "Report submitted"));
});

export const featureQuestion = asyncHandler(async (req, res) => {
  const question = await prisma.question.update({
    where: { id: req.params.id },
    data: { isFeatured: true },
  });
  res.json(apiResponse(true, question, "Question featured"));
});

export const closeQuestion = asyncHandler(async (req, res) => {
  const question = await prisma.question.update({
    where: { id: req.params.id },
    data: { isClosed: true },
  });
  res.json(apiResponse(true, question, "Question closed"));
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
