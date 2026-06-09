import { Prisma } from '@prisma/client';
import { prisma } from '../config/db.js';
import { initiateMonerooPayment, verifyMonerooSignature } from '../services/moneroo.service.js';
import { calculateOrderCommissions } from '../services/mlm.service.js';
import { apiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/errors.js';

export const initiatePayment = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, 'Authentication required');

  const order = await prisma.order.findUnique({
    where: { id: req.body.orderId },
    include: { buyer: { select: { id: true, email: true } } },
  });

  if (!order) throw new ApiError(404, 'Order not found');
  if (order.buyerId !== req.user.id) throw new ApiError(403, 'Forbidden');
  if (order.status !== 'PENDING') throw new ApiError(400, 'Order is not payable');

  if (req.body.method === 'wallet') {
    const paid = await prisma.$transaction(async (tx) => {
      const buyer = await tx.user.findUnique({ where: { id: req.user!.id }, select: { walletBalance: true } });
      if (!buyer || buyer.walletBalance.lt(order.totalAmount)) throw new ApiError(400, 'Insufficient wallet balance');

      await tx.user.update({ where: { id: req.user!.id }, data: { walletBalance: { decrement: order.totalAmount } } });
      await tx.walletTransaction.create({
        data: {
          userId: req.user!.id,
          amount: order.totalAmount.neg(),
          type: 'PAYMENT',
          reference: `order:${order.id}:wallet`,
          description: 'Wallet order payment',
          balanceBefore: buyer.walletBalance,
          balanceAfter: buyer.walletBalance.minus(order.totalAmount),
        },
      });
      return tx.order.update({
        where: { id: order.id },
        data: { status: 'PAID', paymentMethod: 'wallet', monerooTransactionId: `wallet_${order.id}` },
      });
    });

    res.json(apiResponse(true, { order: paid, checkoutUrl: null }, 'Wallet payment successful'));
    return;
  }

  const reference = `order_${order.id}_${Date.now()}`;
  const payment = await initiateMonerooPayment({
    amount: order.totalAmount.toString(),
    description: `Iwosan order ${order.id}`,
    customerEmail: order.buyer.email,
    reference,
    metadata: { orderId: order.id, method: req.body.method },
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { paymentMethod: req.body.method, monerooTransactionId: payment.transactionId },
  });

  res.json(apiResponse(true, payment, 'Payment initialized'));
});

export const monerooWebhook = asyncHandler(async (req, res) => {
  const rawBody = JSON.stringify(req.body);
  const signature = req.headers['x-moneroo-signature'] as string | undefined;

  if (!verifyMonerooSignature(rawBody, signature)) {
    throw new ApiError(401, 'Invalid webhook signature');
  }

  const event = req.body;
  const orderId = event?.data?.metadata?.orderId ?? event?.metadata?.orderId;
  const status = String(event?.data?.status ?? event?.status ?? '').toLowerCase();

  if (orderId && ['paid', 'success', 'successful', 'completed'].includes(status)) {
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: { id: orderId },
        data: { status: 'PAID' },
        select: { id: true, buyerId: true, sellerId: true, totalAmount: true, commissionAmount: true },
      });

      await tx.notification.createMany({
        data: [
          {
            userId: order.buyerId,
            type: 'ORDER_PAID',
            title: 'Paiement confirme',
            message: 'Votre paiement a ete confirme.',
            link: `/orders/${order.id}`,
          },
          {
            userId: order.sellerId,
            type: 'ORDER_PAID',
            title: 'Commande payee',
            message: 'Une commande a ete payee et les fonds sont en sequestre.',
            link: `/orders/${order.id}`,
          },
        ],
      });
    });

    await calculateOrderCommissions(orderId);
  }

  res.json(apiResponse(true, null, 'Webhook processed'));
});

export const walletBalance = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, 'Authentication required');
  const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { walletBalance: true } });
  res.json(apiResponse(true, { balance: user?.walletBalance ?? new Prisma.Decimal(0) }, 'Wallet balance retrieved'));
});

export const walletDeposit = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, 'Authentication required');
  const amount = new Prisma.Decimal(req.body.amount);
  const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { email: true } });
  if (!user) throw new ApiError(404, 'User not found');

  const reference = `deposit_${req.user.id}_${Date.now()}`;
  const payment = await initiateMonerooPayment({
    amount: amount.toString(),
    description: 'Iwosan wallet deposit',
    customerEmail: user.email,
    reference,
    metadata: { userId: req.user.id, type: 'wallet_deposit' },
  });

  res.json(apiResponse(true, payment, 'Deposit initialized'));
});

export const walletWithdraw = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, 'Authentication required');
  const amount = new Prisma.Decimal(req.body.amount);
  const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { walletBalance: true } });
  if (!user || user.walletBalance.lt(amount)) throw new ApiError(400, 'Insufficient wallet balance');

  const ticket = await prisma.ticket.create({
    data: {
      authorId: req.user.id,
      subject: `Withdrawal request ${amount.toString()}`,
      category: 'WITHDRAWAL',
    },
  });

  res.status(201).json(apiResponse(true, ticket, 'Withdrawal request submitted for admin approval'));
});

export const walletTransfer = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, 'Authentication required');
  const amount = new Prisma.Decimal(req.body.amount);

  const result = await prisma.$transaction(async (tx) => {
    const sender = await tx.user.findUnique({ where: { id: req.user!.id }, select: { walletBalance: true } });
    const receiver = await tx.user.findUnique({ where: { id: req.body.receiverId }, select: { walletBalance: true } });
    if (!sender || sender.walletBalance.lt(amount)) throw new ApiError(400, 'Insufficient wallet balance');
    if (!receiver) throw new ApiError(404, 'Receiver not found');

    await tx.user.update({ where: { id: req.user!.id }, data: { walletBalance: { decrement: amount } } });
    await tx.user.update({ where: { id: req.body.receiverId }, data: { walletBalance: { increment: amount } } });

    const reference = `transfer_${Date.now()}_${req.user!.id}_${req.body.receiverId}`;
    await tx.walletTransaction.createMany({
      data: [
        {
          userId: req.user!.id,
          amount: amount.neg(),
          type: 'TRANSFER',
          reference: `${reference}_out`,
          balanceBefore: sender.walletBalance,
          balanceAfter: sender.walletBalance.minus(amount),
        },
        {
          userId: req.body.receiverId,
          amount,
          type: 'TRANSFER',
          reference: `${reference}_in`,
          balanceBefore: receiver.walletBalance,
          balanceAfter: receiver.walletBalance.plus(amount),
        },
      ],
    });

    return { reference };
  });

  res.json(apiResponse(true, result, 'Transfer completed'));
});

export const walletTransactions = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, 'Authentication required');
  const transactions = await prisma.walletTransaction.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  res.json(apiResponse(true, transactions, 'Wallet transactions retrieved'));
});
