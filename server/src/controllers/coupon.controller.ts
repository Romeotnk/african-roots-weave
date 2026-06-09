import { prisma } from '../config/db.js';
import { apiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/errors.js';
import { getPagination, paginationMeta } from '../utils/pagination.js';

export const validateCoupon = asyncHandler(async (req, res) => {
  const coupon = await prisma.coupon.findUnique({ where: { code: String(req.body.code).toUpperCase() } });
  const valid =
    coupon &&
    coupon.isActive &&
    (!coupon.expiresAt || coupon.expiresAt > new Date()) &&
    (!coupon.maxUses || coupon.usedCount < coupon.maxUses);

  res.json(apiResponse(true, valid ? coupon : null, valid ? 'Coupon valid' : 'Coupon invalid'));
});

export const listCoupons = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, 'Authentication required');
  const { page, limit, skip } = getPagination(req.query);
  const where = req.user.role === 'ADMIN' ? {} : { sellerId: req.user.id };

  const [coupons, total] = await prisma.$transaction([
    prisma.coupon.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.coupon.count({ where }),
  ]);

  res.json(apiResponse(true, coupons, 'Coupons retrieved', paginationMeta(page, limit, total)));
});

export const createCoupon = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, 'Authentication required');

  const coupon = await prisma.coupon.create({
    data: {
      code: String(req.body.code).toUpperCase(),
      discount: Number(req.body.discount),
      isPercentage: req.body.isPercentage ?? true,
      maxUses: req.body.maxUses,
      expiresAt: req.body.expiresAt ? new Date(req.body.expiresAt) : undefined,
      sellerId: req.user.role === 'ADMIN' ? req.body.sellerId : req.user.id,
    },
  });

  res.status(201).json(apiResponse(true, coupon, 'Coupon created'));
});
