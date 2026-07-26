import cron from "node-cron";
import { prisma } from "../config/db.js";
import { createNotification } from "../services/notification.service.js";
import { getCommissionRates } from "../utils/commissionConfig.js";
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
        include: { bids: { orderBy: { amount: "desc" }, take: 1 } },
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
            const commissionRate = product.commissionRate ?? rates.global;
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
      await prisma.subscription.updateMany({
        where: { isActive: true, endDate: { lt: new Date() }, autoRenew: false },
        data: { plan: "FREE", isActive: false, maxListings: 5, maxDownloads: 10 },
      });
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
