import { CommissionType, Prisma } from "@prisma/client";
import { prisma } from "../config/db.js";
import { getCommissionRates } from "../utils/commissionConfig.js";

export const calculateOrderCommissions = async (orderId: string) =>
  prisma.$transaction(async (tx) => {
    const rates = await getCommissionRates(tx);
    const mlmRates = [rates.level1, rates.level2, rates.level3];

    const order = await tx.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        sellerId: true,
        totalAmount: true,
        commissionAmount: true,
        commissions: { select: { id: true }, take: 1 },
      },
    });

    if (!order || order.commissions.length > 0) {
      return [];
    }

    const created = [];
    created.push(
      await tx.commission.create({
        data: {
          userId: order.sellerId,
          sourceOrderId: order.id,
          amount: order.totalAmount.minus(order.commissionAmount),
          type: CommissionType.DIRECT,
          status: "APPROVED",
        },
      }),
    );

    let node = await tx.mLMNode.findUnique({
      where: { userId: order.sellerId },
      select: { parentId: true },
    });

    for (let level = 0; level < mlmRates.length && node?.parentId; level += 1) {
      const parent = await tx.mLMNode.findUnique({
        where: { id: node.parentId },
        select: { id: true, userId: true, parentId: true, totalEarnings: true },
      });
      if (!parent) break;

      const amount = order.commissionAmount.mul(mlmRates[level]);
      const type = `MLM_LEVEL${level + 1}` as CommissionType;
      created.push(
        await tx.commission.create({
          data: {
            userId: parent.userId,
            sourceOrderId: order.id,
            amount,
            type,
            // APPROVED here means "calculated", not "paid": the wallet isn't
            // credited until payoutOrderCommissions runs at delivery
            // confirmation, so escrow actually holds the funds until then.
            status: "APPROVED",
          },
        }),
      );

      await tx.mLMNode.update({
        where: { id: parent.id },
        data: { totalEarnings: { increment: amount } },
      });
      await tx.notification.create({
        data: {
          userId: parent.userId,
          type: "COMMISSION_EARNED",
          title: "Commission calculee",
          message: `Une commission niveau ${level + 1} a ete calculee, elle sera versee a la confirmation de livraison.`,
          link: "/dashboard/mlm",
        },
      });

      node = parent;
    }

    return created;
  });

/**
 * Credits the MLM downline commissions for an order to their recipients'
 * wallets and marks them PAID. Called only once the order's escrow has
 * actually been released (buyer confirmed delivery) — calculateOrderCommissions
 * only calculates and approves them at payment time, it never credits a
 * wallet, so funds stay in escrow until the transaction is truly complete.
 */
export const payoutOrderCommissions = async (orderId: string) =>
  prisma.$transaction(async (tx) => {
    const commissions = await tx.commission.findMany({
      where: { sourceOrderId: orderId, status: "APPROVED", type: { not: CommissionType.DIRECT } },
    });

    for (const commission of commissions) {
      const recipient = await tx.user.findUnique({
        where: { id: commission.userId },
        select: { walletBalance: true },
      });
      const before = recipient?.walletBalance ?? new Prisma.Decimal(0);

      await tx.user.update({
        where: { id: commission.userId },
        data: { walletBalance: { increment: commission.amount } },
      });
      await tx.walletTransaction.create({
        data: {
          userId: commission.userId,
          amount: commission.amount,
          type: "COMMISSION",
          reference: `order:${orderId}:commission:${commission.id}`,
          description: "Commission MLM versee apres confirmation de livraison",
          balanceBefore: before,
          balanceAfter: before.plus(commission.amount),
        },
      });
      await tx.commission.update({
        where: { id: commission.id },
        data: { status: "PAID", paidAt: new Date() },
      });
      await tx.notification.create({
        data: {
          userId: commission.userId,
          type: "COMMISSION_EARNED",
          title: "Commission versee",
          message: "Une commission a ete versee sur votre portefeuille.",
          link: "/dashboard/mlm",
        },
      });
    }

    return commissions;
  });

export const buildDownline = async (nodeId: string, depth = 3): Promise<unknown> => {
  const node = await prisma.mLMNode.findUnique({
    where: { id: nodeId },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, country: true, role: true } },
      children: {
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, country: true, role: true },
          },
        },
      },
    },
  });

  if (!node || depth <= 1) {
    return node;
  }

  return {
    ...node,
    children: await Promise.all(node.children.map((child) => buildDownline(child.id, depth - 1))),
  };
};

export const sumByCommissionType = async (userId: string) =>
  prisma.commission.groupBy({
    by: ["type"],
    where: { userId },
    _sum: { amount: true },
    _count: { id: true },
  });
