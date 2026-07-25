import { ReviewTarget } from "@prisma/client";
import { prisma } from "../config/db.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/errors.js";

const recomputeProfessionalRating = async (professionalProfileId: string) => {
  const agg = await prisma.review.aggregate({
    where: { targetId: professionalProfileId, targetType: "PROFESSIONAL", isHidden: false },
    _avg: { rating: true },
    _count: { id: true },
  });
  await prisma.professionalProfile.update({
    where: { id: professionalProfileId },
    data: { averageRating: agg._avg.rating ?? 0, totalReviews: agg._count.id },
  });
};

// Resolves the target's owning userId (for self-review blocking) and confirms it exists.
const resolveTargetOwner = async (targetType: ReviewTarget, targetId: string): Promise<string | null> => {
  if (targetType === "PRODUCT") {
    const product = await prisma.product.findUnique({ where: { id: targetId }, select: { sellerId: true } });
    if (!product) throw new ApiError(404, "Product not found");
    return product.sellerId;
  }
  if (targetType === "PROFESSIONAL") {
    const profile = await prisma.professionalProfile.findUnique({ where: { id: targetId }, select: { userId: true } });
    if (!profile) throw new ApiError(404, "Professional profile not found");
    return profile.userId;
  }
  if (targetType === "FORMATION") {
    const formation = await prisma.formation.findUnique({ where: { id: targetId }, select: { createdById: true } });
    if (!formation) throw new ApiError(404, "Formation not found");
    return formation.createdById;
  }
  return null;
};

export const createReview = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const targetType = req.body.targetType as ReviewTarget;
  const targetId = req.body.targetId as string;
  const rating = Number(req.body.rating);

  if (!Object.values(ReviewTarget).includes(targetType)) throw new ApiError(400, "Invalid targetType");
  if (!targetId) throw new ApiError(400, "targetId is required");
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new ApiError(400, "Rating must be between 1 and 5");

  const ownerId = await resolveTargetOwner(targetType, targetId);
  if (ownerId && ownerId === req.user.id) {
    throw new ApiError(400, "You cannot review your own listing or profile");
  }

  const review = await prisma.review.upsert({
    where: { authorId_targetId_targetType: { authorId: req.user.id, targetId, targetType } },
    update: { rating, comment: req.body.comment },
    create: { authorId: req.user.id, targetId, targetType, rating, comment: req.body.comment },
  });

  if (targetType === "PROFESSIONAL") {
    await recomputeProfessionalRating(targetId);
  }

  res.status(201).json(apiResponse(true, review, "Review saved"));
});

export const listTargetReviews = asyncHandler(async (req, res) => {
  const targetType = req.query.targetType as ReviewTarget;
  const targetId = req.query.targetId as string;
  if (!Object.values(ReviewTarget).includes(targetType) || !targetId) {
    throw new ApiError(400, "targetType and targetId are required");
  }

  const reviews = await prisma.review.findMany({
    where: { targetId, targetType, isHidden: false },
    orderBy: { createdAt: "desc" },
    include: { author: { select: { id: true, firstName: true, lastName: true } } },
  });
  res.json(apiResponse(true, reviews, "Reviews retrieved"));
});
