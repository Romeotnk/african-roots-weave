import { Prisma } from "@prisma/client";
import { prisma } from "../config/db.js";
import { writeAuditLog } from "../services/audit.service.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/errors.js";
import { getPagination, paginationMeta } from "../utils/pagination.js";

type TxClient = Prisma.TransactionClient;

// Reverses whatever payouts already happened for an order (MLM commissions credited
// at payment time, seller escrow release at delivery time), then credits the buyer's
// wallet for the full amount. There is no payment gateway integration yet, so refunds
// settle as wallet balance movements rather than a real money transfer.
const reverseOrderPayout = async (tx: TxClient, order: Prisma.OrderGetPayload<Record<string, never>>) => {
  const commissions = await tx.commission.findMany({
    where: { sourceOrderId: order.id, status: { in: ["APPROVED", "PAID"] } },
  });

  for (const commission of commissions) {
    if (commission.type !== "DIRECT") {
      const recipient = await tx.user.findUnique({
        where: { id: commission.userId },
        select: { walletBalance: true },
      });
      const before = recipient?.walletBalance ?? new Prisma.Decimal(0);
      await tx.user.update({
        where: { id: commission.userId },
        data: { walletBalance: { decrement: commission.amount } },
      });
      await tx.walletTransaction.create({
        data: {
          userId: commission.userId,
          amount: commission.amount.neg(),
          type: "REFUND",
          reference: `order:${order.id}:commission-reversal:${commission.id}`,
          description: "Commission annulée suite à un remboursement",
          balanceBefore: before,
          balanceAfter: before.minus(commission.amount),
        },
      });
    }
    await tx.commission.update({ where: { id: commission.id }, data: { status: "CANCELLED" } });
  }

  if (order.escrowStatus === "RELEASED") {
    const netAmount = order.totalAmount.minus(order.commissionAmount);
    const seller = await tx.user.findUnique({ where: { id: order.sellerId }, select: { walletBalance: true } });
    const before = seller?.walletBalance ?? new Prisma.Decimal(0);
    await tx.user.update({ where: { id: order.sellerId }, data: { walletBalance: { decrement: netAmount } } });
    await tx.walletTransaction.create({
      data: {
        userId: order.sellerId,
        amount: netAmount.neg(),
        type: "REFUND",
        reference: `order:${order.id}:seller-reversal`,
        description: "Reversement vendeur suite à un remboursement",
        balanceBefore: before,
        balanceAfter: before.minus(netAmount),
      },
    });
  }

  const buyer = await tx.user.findUnique({ where: { id: order.buyerId }, select: { walletBalance: true } });
  const buyerBefore = buyer?.walletBalance ?? new Prisma.Decimal(0);
  await tx.user.update({ where: { id: order.buyerId }, data: { walletBalance: { increment: order.totalAmount } } });
  await tx.walletTransaction.create({
    data: {
      userId: order.buyerId,
      amount: order.totalAmount,
      type: "REFUND",
      reference: `order:${order.id}:buyer-refund`,
      description: "Remboursement de commande",
      balanceBefore: buyerBefore,
      balanceAfter: buyerBefore.plus(order.totalAmount),
    },
  });

  await tx.notification.create({
    data: {
      userId: order.buyerId,
      type: "ORDER_REFUNDED",
      title: "Remboursement effectué",
      message: "Votre commande a été remboursée sur votre portefeuille Iwosan.",
      link: `/orders/${order.id}`,
    },
  });
};

export const listRefundRequests = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const where = {
    refundStatus:
      typeof req.query.status === "string" ? (req.query.status as never) : { not: null },
  };
  const [orders, total] = await prisma.$transaction([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: { updatedAt: "desc" },
      include: {
        product: { select: { id: true, title: true, slug: true } },
        buyer: { select: { id: true, firstName: true, lastName: true, email: true } },
        seller: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);
  res.json(apiResponse(true, orders, "Refund requests retrieved", paginationMeta(page, limit, total)));
});

export const approveRefund = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");

  const updated = await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: req.params.id } });
    if (!order) throw new ApiError(404, "Order not found");
    if (order.refundStatus === "PROCESSED") throw new ApiError(400, "Refund already processed");

    await reverseOrderPayout(tx, order);

    return tx.order.update({
      where: { id: order.id },
      data: {
        status: "REFUNDED",
        refundStatus: "PROCESSED",
        escrowStatus: "REFUNDED",
        refundApprovedById: req.user!.id,
      },
    });
  });

  await writeAuditLog(req, {
    action: "REFUND_APPROVED",
    targetId: updated.id,
    targetType: "Order",
    metadata: { reason: req.body.reason },
  });
  res.json(apiResponse(true, updated, "Refund approved and processed"));
});

export const rejectRefund = asyncHandler(async (req, res) => {
  const order = await prisma.order.update({
    where: { id: req.params.id },
    data: { refundStatus: "REJECTED" },
  });
  await writeAuditLog(req, {
    action: "REFUND_REJECTED",
    targetId: order.id,
    targetType: "Order",
    metadata: { reason: req.body.reason },
  });
  res.json(apiResponse(true, order, "Refund request rejected"));
});

export const listDisputes = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const where = { status: "DISPUTED" as const };
  const [orders, total] = await prisma.$transaction([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: { updatedAt: "desc" },
      include: {
        product: { select: { id: true, title: true, slug: true } },
        buyer: { select: { id: true, firstName: true, lastName: true, email: true } },
        seller: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);
  res.json(apiResponse(true, orders, "Disputes retrieved", paginationMeta(page, limit, total)));
});

export const resolveDispute = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const resolution = req.body.resolution as "REFUND_BUYER" | "RELEASE_SELLER";

  const updated = await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: req.params.id } });
    if (!order) throw new ApiError(404, "Order not found");
    if (order.status !== "DISPUTED") throw new ApiError(400, "Order is not under dispute");

    if (resolution === "REFUND_BUYER") {
      await reverseOrderPayout(tx, order);
      return tx.order.update({
        where: { id: order.id },
        data: {
          status: "REFUNDED",
          refundStatus: "PROCESSED",
          escrowStatus: "REFUNDED",
          refundApprovedById: req.user!.id,
        },
      });
    }

    if (order.escrowStatus === "HELD") {
      const seller = await tx.user.findUnique({ where: { id: order.sellerId }, select: { walletBalance: true } });
      const netAmount = order.totalAmount.minus(order.commissionAmount);
      const before = seller?.walletBalance ?? new Prisma.Decimal(0);
      await tx.user.update({ where: { id: order.sellerId }, data: { walletBalance: { increment: netAmount } } });
      await tx.walletTransaction.create({
        data: {
          userId: order.sellerId,
          amount: netAmount,
          type: "PAYMENT",
          reference: `order:${order.id}:dispute-release`,
          description: "Libération séquestre après résolution de litige",
          balanceBefore: before,
          balanceAfter: before.plus(netAmount),
        },
      });
    }

    return tx.order.update({
      where: { id: order.id },
      data: { status: "DELIVERED", escrowStatus: "RELEASED", deliveryConfirmedAt: new Date() },
    });
  });

  await writeAuditLog(req, {
    action: "DISPUTE_RESOLVED",
    targetId: updated.id,
    targetType: "Order",
    metadata: { resolution, reason: req.body.reason },
  });
  res.json(apiResponse(true, updated, "Dispute resolved"));
});

export const listWalletTransactions = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const where = {
    userId: typeof req.query.userId === "string" ? req.query.userId : undefined,
    type: typeof req.query.type === "string" ? (req.query.type as never) : undefined,
  };
  const [transactions, total] = await prisma.$transaction([
    prisma.walletTransaction.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
    }),
    prisma.walletTransaction.count({ where }),
  ]);
  res.json(apiResponse(true, transactions, "Transactions retrieved", paginationMeta(page, limit, total)));
});
