import { prisma } from "../config/db.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/errors.js";
import { getPagination, paginationMeta } from "../utils/pagination.js";

export const validateCoupon = asyncHandler(async (req, res) => {
  const coupon = await prisma.coupon.findUnique({
    where: { code: String(req.body.code).toUpperCase() },
  });
  const valid =
    coupon &&
    coupon.isActive &&
    (!coupon.expiresAt || coupon.expiresAt > new Date()) &&
    (!coupon.maxUses || coupon.usedCount < coupon.maxUses);

  res.json(apiResponse(true, valid ? coupon : null, valid ? "Coupon valid" : "Coupon invalid"));
});

export const listCoupons = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const { page, limit, skip } = getPagination(req.query);
  const canManageAllCoupons = req.user.role === "SUPER_ADMIN" || req.user.role === "ADMIN";
  const where = canManageAllCoupons ? {} : { sellerId: req.user.id };

  const [coupons, total] = await prisma.$transaction([
    prisma.coupon.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" } }),
    prisma.coupon.count({ where }),
  ]);

  res.json(apiResponse(true, coupons, "Coupons retrieved", paginationMeta(page, limit, total)));
});

export const createCoupon = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const canAssignSeller = req.user.role === "SUPER_ADMIN" || req.user.role === "ADMIN";

  const coupon = await prisma.coupon.create({
    data: {
      code: String(req.body.code).toUpperCase(),
      discount: Number(req.body.discount),
      isPercentage: req.body.isPercentage ?? true,
      maxUses: req.body.maxUses,
      expiresAt: req.body.expiresAt ? new Date(req.body.expiresAt) : undefined,
      sellerId: canAssignSeller ? req.body.sellerId : req.user.id,
    },
  });

  res.status(201).json(apiResponse(true, coupon, "Coupon created"));
});

export const updateCoupon = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");

  const existing = await prisma.coupon.findUnique({ where: { id: req.params.id }, select: { sellerId: true } });
  if (!existing) throw new ApiError(404, "Coupon not found");
  const canManageAllCoupons = req.user.role === "SUPER_ADMIN" || req.user.role === "ADMIN";
  if (existing.sellerId !== req.user.id && !canManageAllCoupons) throw new ApiError(403, "Forbidden");

  const coupon = await prisma.coupon.update({
    where: { id: req.params.id },
    data: {
      isActive: typeof req.body.isActive === "boolean" ? req.body.isActive : undefined,
      discount: req.body.discount !== undefined ? Number(req.body.discount) : undefined,
      maxUses: req.body.maxUses,
      expiresAt: req.body.expiresAt ? new Date(req.body.expiresAt) : undefined,
    },
  });

  res.json(apiResponse(true, coupon, "Coupon updated"));
});
