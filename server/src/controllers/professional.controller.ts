import { Prisma } from "@prisma/client";
import { prisma } from "../config/db.js";
import { uploadBufferToCloudinary } from "../services/cloudinary.service.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { isDemoHidden } from "../utils/demoMode.js";
import { ApiError } from "../utils/errors.js";
import { getPagination, paginationMeta } from "../utils/pagination.js";

export const listProfessionals = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const search = typeof req.query.search === "string" ? req.query.search : undefined;
  const location = typeof req.query.location === "string" ? req.query.location : undefined;
  const specialty = typeof req.query.specialty === "string" ? req.query.specialty : undefined;
  const verifiedOnly = req.query.verified === "true";
  const portraitOfWeekOnly = req.query.portraitOfWeek === "true";
  const now = new Date();
  const hideDemo = await isDemoHidden();

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
    user: { isActive: true, isBanned: false, ...(hideDemo ? { isDemoAccount: false } : {}) },
    ...(portraitOfWeekOnly
      ? {
          isPortraitOfWeek: true,
          portraitStartDate: { lte: now },
          portraitEndDate: { gte: now },
        }
      : {}),
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
  // :id is the User.id — the same identity used by Product.sellerId and by
  // messaging (Message.senderId/receiverId) — so a product card, a seller
  // profile link, and "start a conversation" all resolve to one identity.
  const professional = await prisma.professionalProfile.findUnique({
    where: { userId: req.params.id },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          country: true,
          role: true,
          createdAt: true,
          isDemoAccount: true,
        },
      },
    },
  });

  if (!professional || (professional.user.isDemoAccount && (await isDemoHidden()))) {
    throw new ApiError(404, "Professional not found");
  }

  const { isDemoAccount: _isDemoAccount, ...user } = professional.user;
  res.json(apiResponse(true, { ...professional, user }, "Professional retrieved"));
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

export const getMyProfile = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");

  const profile = await prisma.professionalProfile.findUnique({ where: { userId: req.user.id } });
  res.json(apiResponse(true, profile, "Professional profile retrieved"));
});

export const upsertMyProfile = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");

  const {
    displayName,
    specialty,
    biography,
    initiationPath,
    therapeuticSuccessRate,
    innovations,
    communityImpact,
    philosophy,
    location,
    latitude,
    longitude,
    availabilitySchedule,
    serviceBookingEnabled,
    socialLinks,
  } = req.body as {
    displayName: string;
    specialty?: string[];
    biography: string;
    initiationPath?: string;
    therapeuticSuccessRate?: number;
    innovations?: string;
    communityImpact?: string;
    philosophy?: string;
    location: string;
    latitude?: number;
    longitude?: number;
    availabilitySchedule?: Prisma.InputJsonValue;
    serviceBookingEnabled?: boolean;
    socialLinks?: Prisma.InputJsonValue;
  };

  const data: Prisma.ProfessionalProfileUncheckedCreateInput = {
    userId: req.user.id,
    displayName,
    specialty: specialty ?? [],
    biography,
    initiationPath: initiationPath || null,
    therapeuticSuccessRate: therapeuticSuccessRate ?? null,
    innovations: innovations || null,
    communityImpact: communityImpact || null,
    philosophy: philosophy || null,
    location,
    latitude: typeof latitude === "number" ? latitude : null,
    longitude: typeof longitude === "number" ? longitude : null,
    availabilitySchedule: availabilitySchedule ?? Prisma.JsonNull,
    serviceBookingEnabled: Boolean(serviceBookingEnabled),
    socialLinks: socialLinks ?? Prisma.JsonNull,
  };

  const [profile] = await prisma.$transaction([
    prisma.professionalProfile.upsert({
      where: { userId: req.user.id },
      create: data,
      update: data,
    }),
    // Submitting a professional profile is literally "devenir professionnel" —
    // grant the role so the pro dashboard/selling routes unlock immediately.
    // Only USER is promoted: ADMIN/etc already have a role they were
    // deliberately given and shouldn't be silently downgraded to it.
    prisma.user.updateMany({ where: { id: req.user.id, role: "USER" }, data: { role: "PROFESSIONAL" } }),
  ]);

  res.json(apiResponse(true, profile, "Professional profile saved"));
});

export const uploadMyProfilePhotos = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");

  const profile = await prisma.professionalProfile.findUnique({ where: { userId: req.user.id }, select: { photos: true } });
  if (!profile) throw new ApiError(404, "Créez votre profil avant d'ajouter des photos");

  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  if (files.length === 0) throw new ApiError(400, "Aucun fichier fourni");

  const urls = await Promise.all(
    files.map((file) => uploadBufferToCloudinary(file.buffer, "iwosan/professionals", "image")),
  );

  const updated = await prisma.professionalProfile.update({
    where: { userId: req.user.id },
    data: { photos: [...profile.photos, ...urls] },
  });

  res.json(apiResponse(true, updated, "Photos ajoutées"));
});

export const uploadMyVerificationDocs = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");

  const profile = await prisma.professionalProfile.findUnique({
    where: { userId: req.user.id },
    select: { verificationDocs: true },
  });
  if (!profile) throw new ApiError(404, "Créez votre profil avant d'ajouter des documents");

  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  if (files.length === 0) throw new ApiError(400, "Aucun fichier fourni");

  const urls = await Promise.all(
    files.map((file) => uploadBufferToCloudinary(file.buffer, "iwosan/professional-docs", "auto")),
  );

  const existing = Array.isArray(profile.verificationDocs) ? (profile.verificationDocs as string[]) : [];

  const updated = await prisma.professionalProfile.update({
    where: { userId: req.user.id },
    data: { verificationDocs: [...existing, ...urls] },
  });

  res.json(apiResponse(true, updated, "Documents ajoutés"));
});
