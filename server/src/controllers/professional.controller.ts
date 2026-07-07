import { Prisma } from "@prisma/client";
import { prisma } from "../config/db.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/errors.js";
import { getPagination, paginationMeta } from "../utils/pagination.js";

export const listProfessionals = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const search = typeof req.query.search === "string" ? req.query.search : undefined;
  const location = typeof req.query.location === "string" ? req.query.location : undefined;
  const specialty = typeof req.query.specialty === "string" ? req.query.specialty : undefined;
  const verifiedOnly = req.query.verified === "true";

  const where = {
    isVerified: verifiedOnly ? true : undefined,
    location: location ? { contains: location, mode: "insensitive" as const } : undefined,
    specialty: specialty ? { has: specialty } : undefined,
    OR: search
      ? [
          { displayName: { contains: search, mode: "insensitive" as const } },
          { biography: { contains: search, mode: "insensitive" as const } },
          { location: { contains: search, mode: "insensitive" as const } },
        ]
      : undefined,
    user: { isActive: true, isBanned: false },
  };

  const [professionals, total] = await prisma.$transaction([
    prisma.professionalProfile.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ isVerified: "desc" }, { averageRating: "desc" }],
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            country: true,
          },
        },
      },
    }),
    prisma.professionalProfile.count({ where }),
  ]);

  res.json(apiResponse(true, professionals, "Professionals retrieved", paginationMeta(page, limit, total)));
});

export const getProfessional = asyncHandler(async (req, res) => {
  const professional = await prisma.professionalProfile.findUnique({
    where: { id: req.params.id },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          country: true,
          role: true,
          createdAt: true,
        },
      },
    },
  });

  if (!professional) {
    throw new ApiError(404, "Professional not found");
  }

  res.json(apiResponse(true, professional, "Professional retrieved"));
});

export const listReceivedReviews = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");

  const [products, profile] = await prisma.$transaction([
    prisma.product.findMany({ where: { sellerId: req.user.id }, select: { id: true } }),
    prisma.professionalProfile.findUnique({ where: { userId: req.user.id }, select: { id: true } }),
  ]);
  const productIds = products.map((product) => product.id);
  const targets: Prisma.ReviewWhereInput[] = [];

  if (profile) {
    targets.push({ targetId: profile.id, targetType: "PROFESSIONAL" });
  }
  if (productIds.length > 0) {
    targets.push({ targetId: { in: productIds }, targetType: "PRODUCT" });
  }

  const reviews = await prisma.review.findMany({
    where: targets.length > 0 ? { OR: targets } : { id: "__none__" },
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  res.json(apiResponse(true, reviews, "Received reviews retrieved"));
});
