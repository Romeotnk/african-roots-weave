import { prisma } from "../config/db.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const mlmOverview = asyncHandler(async (_req, res) => {
  const [totalsByType, totalNodes, topEarners] = await prisma.$transaction([
    prisma.commission.groupBy({ by: ["type"], orderBy: { type: "asc" }, _sum: { amount: true }, _count: { id: true } }),
    prisma.mLMNode.count(),
    prisma.mLMNode.findMany({
      orderBy: { totalEarnings: "desc" },
      take: 10,
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
    }),
  ]);

  res.json(apiResponse(true, { totalsByType, totalNodes, topEarners }, "MLM overview retrieved"));
});
