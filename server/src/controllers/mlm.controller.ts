import { prisma } from "../config/db.js";
import { env } from "../config/env.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/errors.js";
import { buildDownline, sumByCommissionType } from "../services/mlm.service.js";

export const myTree = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const node = await prisma.mLMNode.findUnique({
    where: { userId: req.user.id },
    select: { id: true },
  });
  if (!node) throw new ApiError(404, "MLM node not found");

  res.json(apiResponse(true, await buildDownline(node.id, 3), "MLM tree retrieved"));
});

export const earnings = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const data = await sumByCommissionType(req.user.id);
  res.json(apiResponse(true, data, "MLM earnings retrieved"));
});

export const stats = asyncHandler(async (_req, res) => {
  const [totalNodes, totalCommissions, totalClicks] = await prisma.$transaction([
    prisma.mLMNode.count(),
    prisma.commission.aggregate({ _sum: { amount: true }, _count: { id: true } }),
    prisma.mLMNode.aggregate({ _sum: { affiliateLinkClicks: true } }),
  ]);

  res.json(
    apiResponse(
      true,
      {
        totalNodes,
        commissionsCount: totalCommissions._count.id,
        commissionsAmount: totalCommissions._sum.amount,
        affiliateLinkClicks: totalClicks._sum.affiliateLinkClicks ?? 0,
      },
      "MLM stats retrieved",
    ),
  );
});

export const affiliateLink = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const node = await prisma.mLMNode.findUnique({ where: { userId: req.user.id } });
  if (!node) throw new ApiError(404, "MLM node not found");

  res.json(
    apiResponse(
      true,
      {
        code: node.affiliateCode,
        link: `${env.clientUrl}/inscription?ref=${node.affiliateCode}`,
      },
      "Affiliate link retrieved",
    ),
  );
});

export const trackClick = asyncHandler(async (req, res) => {
  const node = await prisma.mLMNode.update({
    where: { affiliateCode: req.body.code },
    data: { affiliateLinkClicks: { increment: 1 } },
    select: { affiliateCode: true, affiliateLinkClicks: true },
  });

  res.json(apiResponse(true, node, "Affiliate click tracked"));
});

export const capturePage = asyncHandler(async (req, res) => {
  const node = await prisma.mLMNode.findUnique({
    where: { affiliateCode: req.params.code },
    select: {
      affiliateCode: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
          country: true,
          professionalProfile: {
            select: {
              displayName: true,
              specialty: true,
              biography: true,
              photos: true,
              isVerified: true,
            },
          },
        },
      },
    },
  });

  if (!node) throw new ApiError(404, "Affiliate not found");
  res.json(apiResponse(true, node, "Capture page retrieved"));
});
