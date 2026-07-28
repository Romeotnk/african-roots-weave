import { Prisma } from "@prisma/client";
import cron from "node-cron";
import { prisma } from "../config/db.js";
import { createNotification } from "../services/notification.service.js";
import { getCommissionRates, resolveProductCommissionRate } from "../utils/commissionConfig.js";
import { SUBSCRIPTION_PLANS, type SubscriptionPlanKey } from "../utils/subscriptionPlans.js";
import { withDistributedLock } from "../utils/distributedLock.js";

/**
 * Wraps a cron task body so a single failure (transient DB error, bad data)
 * logs and moves on instead of producing an unhandled rejection that could
 * take down the whole process. Also takes a Redis lock (when Redis is
 * configured) so a multi-instance deployment runs each tick exactly once
 * instead of once per instance.
 */
const runJob = (name: string, task: () => Promise<void>, lockTtlMs = 4 * 60 * 1000) => async () => {
  try {
    await withDistributedLock(name, lockTtlMs, task);
  } catch (error) {
    console.error(`[cron:${name}] job failed:`, error);
  }
};

export const startCronJobs = () => {
  cron.schedule(
    "*/5 * * * *",
    runJob("close-auctions", async () => {
      const auctions = await prisma.product.findMany({
        where: {
          auctionEnabled: true,
          auctionEndDate: { lte: new Date() },
          isActive: true,
        },
        include: {
          bids: { orderBy: { amount: "desc" }, take: 1 },
          seller: { select: { professionalProfile: { select: { defaultCommissionRate: true } } } },
        },
      });

      const results = await Promise.allSettled(
        auctions.map(async (product) => {
          const winner = product.bids[0];

          if (!winner) {
            await prisma.product.update({ where: { id: product.id }, data: { auctionEnabled: false } });
            return;
          }

          const order = await prisma.$transaction(async (tx) => {
            await tx.product.update({ where: { id: product.id }, data: { auctionEnabled: false } });
            const rates = await getCommissionRates(tx);
            const commissionRate = resolveProductCommissionRate(rates, product, product.seller.professionalProfile?.defaultCommissionRate);
            const commissionAmount = winner.amount.mul(commissionRate);
            const created = await tx.order.create({
              data: {
                buyerId: winner.bidderId,
                sellerId: product.sellerId,
                productId: product.id,
                quantity: 1,
                unitPrice: winner.amount,
                totalAmount: winner.amount,
                commissionAmount,
              },
            });
            await tx.notification.create({
              data: {
                userId: product.sellerId,
                type: "ORDER_CREATED",
                title: "Nouvelle commande",
                message: "Une nouvelle commande a ete creee suite a une enchere remportee.",
                link: `/orders/${created.id}`,
              },
            });
            return created;
          });

          await createNotification({
            userId: winner.bidderId,
            type: "AUCTION_WON",
            title: "Enchere remportee",
            message: `Vous avez remporte ${product.title}. Finalisez le paiement pour recevoir votre commande.`,
            link: `/orders/${order.id}`,
          });
          await createNotification({
            userId: product.sellerId,
            type: "AUCTION_CLOSED",
            title: "Enchere cloturee",
            message: `Votre enchere ${product.title} est terminee.`,
            link: `/products/${product.slug}`,
          });
        }),
      );

      results.forEach((result, index) => {
        if (result.status === "rejected") {
          console.error(`[cron:close-auctions] product ${auctions[index]?.id} failed:`, result.reason);
        }
      });
    }),
  );

  cron.schedule(
    "0 0 * * *",
    runJob("nightly-billing", async () => {
      const expired = await prisma.subscription.findMany({
        where: { isActive: true, endDate: { lt: new Date() } },
      });

      for (const subscription of expired) {
        const plan = SUBSCRIPTION_PLANS[subscription.plan as SubscriptionPlanKey];

        if (subscription.autoRenew && plan.price > 0) {
          const amount = new Prisma.Decimal(plan.price);
          const renewed = await prisma.$transaction(async (tx) => {
            const decremented = await tx.user.updateMany({
              where: { id: subscription.userId, walletBalance: { gte: amount } },
              data: { walletBalance: { decrement: amount } },
            });
            if (decremented.count === 0) return false;

            const buyer = await tx.user.findUnique({ where: { id: subscription.userId }, select: { walletBalance: true } });
            const balanceAfter = buyer?.walletBalance ?? new Prisma.Decimal(0);
            await tx.walletTransaction.create({
              data: {
                userId: subscription.userId,
                amount: amount.neg(),
                type: "PAYMENT",
                reference: `subscription:${subscription.userId}:${subscription.plan}:${Date.now()}`,
                description: `Renouvellement automatique — abonnement ${plan.label}`,
                balanceBefore: balanceAfter.plus(amount),
                balanceAfter,
              },
            });
            await tx.subscription.update({
              where: { id: subscription.id },
              data: { endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
            });
            return true;
          });

          if (renewed) {
            await createNotification({
              userId: subscription.userId,
              type: "SYSTEM",
              title: "Abonnement renouvele",
              message: `Votre abonnement ${plan.label} a ete renouvele automatiquement.`,
              link: "/tableau-de-bord/abonnement",
            });
            continue;
          }
        }

        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { plan: "FREE", isActive: false, autoRenew: false, maxListings: 5, maxDownloads: 10 },
        });
        await createNotification({
          userId: subscription.userId,
          type: "SYSTEM",
          title: "Abonnement expire",
          message: subscription.autoRenew
            ? "Votre abonnement a expire : solde insuffisant pour le renouvellement automatique. Vous etes repasse au forfait Free."
            : "Votre abonnement a expire et vous etes repasse au forfait Free.",
          link: "/tableau-de-bord/abonnement",
        });
      }
      // Commissions are paid out at delivery confirmation (payoutOrderCommissions),
      // not on a timer — escrow must actually be released first.
    }),
  );

  cron.schedule(
    "0 8 * * 1",
    runJob("portrait-of-week", async () => {
      const manual = await prisma.professionalProfile.findFirst({
        where: { isPortraitOfWeek: true, portraitEndDate: { gte: new Date() } },
      });

      if (manual) return;

      await prisma.professionalProfile.updateMany({
        where: { isPortraitOfWeek: true },
        data: { isPortraitOfWeek: false },
      });
      const candidate = await prisma.professionalProfile.findFirst({
        where: { isVerified: true },
        orderBy: [{ averageRating: "desc" }, { totalReviews: "desc" }],
      });

      if (candidate) {
        await prisma.professionalProfile.update({
          where: { id: candidate.id },
          data: {
            isPortraitOfWeek: true,
            portraitStartDate: new Date(),
            portraitEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });
      }
    }),
  );

  cron.schedule(
    "*/15 * * * *",
    runJob("expire-product-boosts", async () => {
      await prisma.product.updateMany({
        where: { isFeatured: true, featuredUntil: { lte: new Date() } },
        data: { isFeatured: false },
      });
      await prisma.product.updateMany({
        where: { isUrgent: true, urgentUntil: { lte: new Date() } },
        data: { isUrgent: false },
      });
    }),
  );

  // Temporary bans already lift lazily at next login (auth.middleware.ts,
  // auth.controller.ts) — this is just a proactive sweep so a banned user's
  // account doesn't visibly stay "Banni" in the admin panel long after their
  // ban expired, if they simply haven't logged back in.
  cron.schedule(
    "*/15 * * * *",
    runJob("lift-expired-bans", async () => {
      await prisma.user.updateMany({
        where: { isBanned: true, banExpiresAt: { lte: new Date() } },
        data: { isBanned: false, banReason: null, banExpiresAt: null },
      });
    }),
  );
};
