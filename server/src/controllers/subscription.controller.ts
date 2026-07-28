import { Prisma } from "@prisma/client";
import { prisma } from "../config/db.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/errors.js";
import { isSubscriptionPlanKey, SUBSCRIPTION_PLANS } from "../utils/subscriptionPlans.js";

export const listPlans = asyncHandler(async (_req, res) => {
  res.json(apiResponse(true, SUBSCRIPTION_PLANS, "Plans retrieved"));
});

export const getMySubscription = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");

  let subscription = await prisma.subscription.findUnique({ where: { userId: req.user.id } });
  if (!subscription) {
    const free = SUBSCRIPTION_PLANS.FREE;
    subscription = await prisma.subscription.create({
      data: {
        userId: req.user.id,
        plan: "FREE",
        price: free.price,
        startDate: new Date(),
        maxListings: free.maxListings,
        maxDownloads: free.maxDownloads,
      },
    });
  }

  const activeListings = await prisma.product.count({
    where: {
      sellerId: req.user.id,
      isActive: true,
      OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
    },
  });

  res.json(apiResponse(true, { ...subscription, activeListings }, "Subscription retrieved"));
});

export const upgradeMySubscription = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");

  const planKey = String(req.body.plan ?? "");
  if (!isSubscriptionPlanKey(planKey)) throw new ApiError(400, "Forfait invalide");
  const plan = SUBSCRIPTION_PLANS[planKey];
  const autoRenew = Boolean(req.body.autoRenew ?? false);
  const startDate = new Date();
  const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const subscription = await prisma.$transaction(async (tx) => {
    if (plan.price > 0) {
      const amount = new Prisma.Decimal(plan.price);
      // Conditional update, same atomic-balance-check pattern used for
      // product boost purchases (see product.controller.ts).
      const decremented = await tx.user.updateMany({
        where: { id: req.user!.id, walletBalance: { gte: amount } },
        data: { walletBalance: { decrement: amount } },
      });
      if (decremented.count === 0) throw new ApiError(400, "Solde du portefeuille insuffisant");

      const buyer = await tx.user.findUnique({ where: { id: req.user!.id }, select: { walletBalance: true } });
      const balanceAfter = buyer?.walletBalance ?? new Prisma.Decimal(0);
      await tx.walletTransaction.create({
        data: {
          userId: req.user!.id,
          amount: amount.neg(),
          type: "PAYMENT",
          reference: `subscription:${req.user!.id}:${planKey}:${Date.now()}`,
          description: `Abonnement ${plan.label} (30 jours)`,
          balanceBefore: balanceAfter.plus(amount),
          balanceAfter,
        },
      });
    }

    return tx.subscription.upsert({
      where: { userId: req.user!.id },
      update: {
        plan: planKey,
        price: plan.price,
        startDate,
        endDate,
        isActive: true,
        maxListings: plan.maxListings,
        maxDownloads: plan.maxDownloads,
        autoRenew,
      },
      create: {
        userId: req.user!.id,
        plan: planKey,
        price: plan.price,
        startDate,
        endDate,
        maxListings: plan.maxListings,
        maxDownloads: plan.maxDownloads,
        autoRenew,
      },
    });
  });

  res.json(apiResponse(true, subscription, "Subscription updated"));
});
