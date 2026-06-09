import cron from 'node-cron';
import { prisma } from '../config/db.js';
import { createNotification } from '../services/notification.service.js';

export const startCronJobs = () => {
  cron.schedule('*/5 * * * *', async () => {
    const auctions = await prisma.product.findMany({
      where: {
        auctionEnabled: true,
        auctionEndDate: { lte: new Date() },
        isActive: true,
      },
      include: { bids: { orderBy: { amount: 'desc' }, take: 1 } },
    });

    await Promise.all(
      auctions.map(async (product) => {
        await prisma.product.update({ where: { id: product.id }, data: { auctionEnabled: false } });
        const winner = product.bids[0];
        if (winner) {
          await createNotification({
            userId: winner.bidderId,
            type: 'AUCTION_WON',
            title: 'Enchere remportee',
            message: `Vous avez remporte ${product.title}.`,
            link: `/products/${product.slug}`,
          });
          await createNotification({
            userId: product.sellerId,
            type: 'AUCTION_CLOSED',
            title: 'Enchere cloturee',
            message: `Votre enchere ${product.title} est terminee.`,
            link: `/products/${product.slug}`,
          });
        }
      }),
    );
  });

  cron.schedule('0 0 * * *', async () => {
    await prisma.subscription.updateMany({
      where: { isActive: true, endDate: { lt: new Date() }, autoRenew: false },
      data: { plan: 'FREE', isActive: false, maxListings: 5, maxDownloads: 10 },
    });

    await prisma.commission.updateMany({
      where: { status: 'APPROVED' },
      data: { status: 'PAID', paidAt: new Date() },
    });
  });

  cron.schedule('0 8 * * 1', async () => {
    const manual = await prisma.professionalProfile.findFirst({
      where: { isPortraitOfWeek: true, portraitEndDate: { gte: new Date() } },
    });

    if (manual) return;

    await prisma.professionalProfile.updateMany({ where: { isPortraitOfWeek: true }, data: { isPortraitOfWeek: false } });
    const candidate = await prisma.professionalProfile.findFirst({
      where: { isVerified: true },
      orderBy: [{ averageRating: 'desc' }, { totalReviews: 'desc' }],
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
  });
};
