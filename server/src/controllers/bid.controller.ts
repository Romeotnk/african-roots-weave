import { Prisma } from '@prisma/client';
import { prisma } from '../config/db.js';
import { apiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/errors.js';

export const listBids = asyncHandler(async (req, res) => {
  const bids = await prisma.bid.findMany({
    where: { productId: req.params.id },
    orderBy: { amount: 'desc' },
    include: { bidder: { select: { id: true, firstName: true, lastName: true, country: true } } },
  });

  res.json(apiResponse(true, bids, 'Bids retrieved'));
});

export const placeBid = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, 'Authentication required');
  const amount = new Prisma.Decimal(req.body.amount);

  const bid = await prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        sellerId: true,
        auctionEnabled: true,
        auctionEndDate: true,
        currentBid: true,
        price: true,
        isActive: true,
        isApproved: true,
      },
    });
    if (!product || !product.isActive || !product.isApproved || !product.auctionEnabled) {
      throw new ApiError(404, 'Auction unavailable');
    }
    if (product.sellerId === req.user!.id) throw new ApiError(400, 'Cannot bid on your own product');
    if (product.auctionEndDate && product.auctionEndDate <= new Date()) throw new ApiError(400, 'Auction closed');

    const minimum = product.currentBid ?? product.price;
    if (amount.lte(minimum)) throw new ApiError(400, 'Bid must be higher than current price');

    const bidder = await tx.user.findUnique({ where: { id: req.user!.id }, select: { walletBalance: true } });
    if (!bidder || bidder.walletBalance.lt(amount)) throw new ApiError(400, 'Insufficient wallet balance');

    const previousBid = await tx.bid.findFirst({ where: { productId: product.id }, orderBy: { amount: 'desc' } });
    const created = await tx.bid.create({ data: { productId: product.id, bidderId: req.user!.id, amount } });
    await tx.product.update({ where: { id: product.id }, data: { currentBid: amount } });

    if (previousBid && previousBid.bidderId !== req.user!.id) {
      await tx.notification.create({
        data: {
          userId: previousBid.bidderId,
          type: 'BID_OUTBID',
          title: 'Enchere depassee',
          message: 'Votre enchere a ete depassee.',
          link: `/products/${product.id}`,
        },
      });
    }

    return created;
  });

  res.status(201).json(apiResponse(true, bid, 'Bid placed'));
});
