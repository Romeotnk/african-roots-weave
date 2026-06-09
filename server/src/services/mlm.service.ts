import { CommissionType, Prisma } from '@prisma/client';
import { prisma } from '../config/db.js';

const mlmRates = [0.03, 0.02, 0.01] as const;

export const calculateOrderCommissions = async (orderId: string) =>
  prisma.$transaction(async (tx) => {
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
          status: 'APPROVED',
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
            status: 'APPROVED',
          },
        }),
      );

      await tx.user.update({ where: { id: parent.userId }, data: { walletBalance: { increment: amount } } });
      await tx.mLMNode.update({ where: { id: parent.id }, data: { totalEarnings: { increment: amount } } });
      await tx.notification.create({
        data: {
          userId: parent.userId,
          type: 'COMMISSION_EARNED',
          title: 'Commission gagnee',
          message: `Vous avez gagne une commission niveau ${level + 1}.`,
          link: '/dashboard/mlm',
        },
      });

      node = parent;
    }

    return created;
  });

export const buildDownline = async (nodeId: string, depth = 3): Promise<unknown> => {
  const node = await prisma.mLMNode.findUnique({
    where: { id: nodeId },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, country: true, role: true } },
      children: {
        include: {
          user: { select: { id: true, firstName: true, lastName: true, country: true, role: true } },
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
    by: ['type'],
    where: { userId },
    _sum: { amount: true },
    _count: { id: true },
  });
