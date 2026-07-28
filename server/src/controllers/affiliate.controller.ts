import crypto from "node:crypto";
import { prisma } from "../config/db.js";
import { env } from "../config/env.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/errors.js";

const generateCode = () => crypto.randomBytes(4).toString("hex").toUpperCase();

export const getMyAffiliateLink = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");

  let link = await prisma.affiliateLink.findUnique({ where: { userId: req.user.id } });
  if (!link) {
    let code = generateCode();
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const exists = await prisma.affiliateLink.findUnique({ where: { code }, select: { id: true } });
      if (!exists) break;
      code = generateCode();
    }
    link = await prisma.affiliateLink.create({ data: { userId: req.user.id, code } });
  }

  res.json(
    apiResponse(
      true,
      { code: link.code, link: `${env.clientUrl}/?aff=${link.code}`, clicks: link.clicks },
      "Affiliate link retrieved",
    ),
  );
});

// Public: fired by the frontend as soon as it sees ?aff=CODE in the URL,
// regardless of whether the visitor ever signs up or buys anything.
export const trackAffiliateClick = asyncHandler(async (req, res) => {
  const code = String(req.body.code ?? "").trim();
  if (!code) throw new ApiError(400, "code is required");
  await prisma.affiliateLink.updateMany({ where: { code }, data: { clicks: { increment: 1 } } });
  res.json(apiResponse(true, null, "Click tracked"));
});

export const myAffiliateCommissions = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const commissions = await prisma.commission.findMany({
    where: { userId: req.user.id, type: "AFFILIATE" },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { sourceOrder: { select: { id: true, product: { select: { title: true } } } } },
  });
  res.json(apiResponse(true, commissions, "Affiliate commissions retrieved"));
});
