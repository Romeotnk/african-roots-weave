import { Prisma } from "@prisma/client";
import { prisma } from "../config/db.js";
import { initiateMonerooPayment, verifyMonerooSignature } from "../services/moneroo.service.js";
import { calculateOrderCommissions } from "../services/mlm.service.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/errors.js";

export const initiatePayment = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");

  const order = await prisma.order.findUnique({
    where: { id: req.body.orderId },
    include: { buyer: { select: { id: true, email: true } } },
  });

  if (!order) throw new ApiError(404, "Order not found");
  if (order.buyerId !== req.user.id) throw new ApiError(403, "Forbidden");
  if (order.status !== "PENDING") throw new ApiError(400, "Order is not payable");

  if (req.body.method === "wallet") {
    const paid = await prisma.$transaction(async (tx) => {
      // Conditional update instead of read-then-write: the WHERE clause is
      // evaluated atomically by Postgres as part of the UPDATE, so two
      // concurrent debits can't both pass a stale balance check and push
      // the wallet negative.
      const decremented = await tx.user.updateMany({
        where: { id: req.user!.id, walletBalance: { gte: order.totalAmount } },
        data: { walletBalance: { decrement: order.totalAmount } },
      });
      if (decremented.count === 0) throw new ApiError(400, "Insufficient wallet balance");

      const buyer = await tx.user.findUnique({
        where: { id: req.user!.id },
        select: { walletBalance: true },
      });
      const balanceAfter = buyer?.walletBalance ?? new Prisma.Decimal(0);
      await tx.walletTransaction.create({
        data: {
          userId: req.user!.id,
          amount: order.totalAmount.neg(),
          type: "PAYMENT",
          reference: `order:${order.id}:wallet`,
          description: "Wallet order payment",
          balanceBefore: balanceAfter.plus(order.totalAmount),
          balanceAfter,
        },
      });
      return tx.order.update({
        where: { id: order.id },
        data: {
          status: "PAID",
          paymentMethod: "wallet",
          monerooTransactionId: `wallet_${order.id}`,
        },
      });
    }, { timeout: 20000, maxWait: 10000 });

    await calculateOrderCommissions(paid.id);

    res.json(apiResponse(true, { order: paid, checkoutUrl: null }, "Wallet payment successful"));
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

  res.json(apiResponse(true, payment, "Payment initialized"));
});

export const monerooWebhook = asyncHandler(async (req, res) => {
  // req.rawBody is the exact byte buffer express.json()'s verify hook
  // captured (see app.ts) — Moneroo signs those bytes, not a re-serialized
  // JSON.stringify(req.body), which can differ (key order, number
  // formatting) and cause a legitimate webhook to fail verification.
  const rawBody = (req.rawBody ?? Buffer.from(JSON.stringify(req.body))).toString("utf8");
  const signature = req.headers["x-moneroo-signature"] as string | undefined;

  if (!verifyMonerooSignature(rawBody, signature)) {
    throw new ApiError(401, "Invalid webhook signature");
  }

  const event = req.body;
  const metadata = event?.data?.metadata ?? event?.metadata ?? {};
  const orderId = metadata?.orderId;
  const status = String(event?.data?.status ?? event?.status ?? "").toLowerCase();
  const isPaid = ["paid", "success", "successful", "completed"].includes(status);
  const reference: string | undefined = event?.data?.reference ?? event?.reference;

  if (orderId && isPaid) {
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: { id: orderId },
        data: { status: "PAID" },
        select: {
          id: true,
          buyerId: true,
          sellerId: true,
          totalAmount: true,
          commissionAmount: true,
        },
      });

      await tx.notification.createMany({
        data: [
          {
            userId: order.buyerId,
            type: "ORDER_PAID",
            title: "Paiement confirme",
            message: "Votre paiement a ete confirme.",
            link: `/orders/${order.id}`,
          },
          {
            userId: order.sellerId,
            type: "ORDER_PAID",
            title: "Commande payee",
            message: "Une commande a ete payee et les fonds sont en sequestre.",
            link: `/orders/${order.id}`,
          },
        ],
      });
    });

    await calculateOrderCommissions(orderId);
  } else if (metadata?.type === "wallet_deposit" && metadata?.userId && isPaid) {
    // Idempotent on webhook replay: WalletTransaction.reference is unique,
    // so a duplicate delivery of the same event hits a P2002 conflict on
    // the create below (caught and ignored) instead of crediting twice.
    const depositReference = `deposit:${reference ?? `${metadata.userId}:${orderId ?? "unknown"}`}`;
    try {
      await prisma.$transaction(async (tx) => {
        const updated = await tx.user.update({
          where: { id: metadata.userId },
          data: { walletBalance: { increment: event?.data?.amount ?? event?.amount } },
          select: { walletBalance: true },
        });
        await tx.walletTransaction.create({
          data: {
            userId: metadata.userId,
            amount: new Prisma.Decimal(event?.data?.amount ?? event?.amount ?? 0),
            type: "DEPOSIT",
            reference: depositReference,
            description: "Wallet deposit via Moneroo",
            balanceBefore: updated.walletBalance.minus(event?.data?.amount ?? event?.amount ?? 0),
            balanceAfter: updated.walletBalance,
          },
        });
        await tx.notification.create({
          data: {
            userId: metadata.userId,
            type: "WALLET_DEPOSIT",
            title: "Depot confirme",
            message: "Votre depot a ete credite sur votre portefeuille Iwosan.",
            link: "/mon-compte/portefeuille",
          },
        });
      });
    } catch (error) {
      if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") {
        throw error;
      }
      // Duplicate webhook delivery for an already-credited deposit — no-op.
    }
  }

  res.json(apiResponse(true, null, "Webhook processed"));
});

export const walletBalance = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { walletBalance: true },
  });
  res.json(
    apiResponse(
      true,
      { balance: user?.walletBalance ?? new Prisma.Decimal(0) },
      "Wallet balance retrieved",
    ),
  );
});

export const walletDeposit = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const amount = new Prisma.Decimal(req.body.amount);
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { email: true },
  });
  if (!user) throw new ApiError(404, "User not found");

  const reference = `deposit_${req.user.id}_${Date.now()}`;
  const payment = await initiateMonerooPayment({
    amount: amount.toString(),
    description: "Iwosan wallet deposit",
    customerEmail: user.email,
    reference,
    metadata: { userId: req.user.id, type: "wallet_deposit" },
  });

  res.json(apiResponse(true, payment, "Deposit initialized"));
});

export const walletWithdraw = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const amount = new Prisma.Decimal(req.body.amount);
  if (amount.lte(0)) throw new ApiError(400, "Invalid withdrawal amount");

  // Reserve the funds immediately (same conditional-update pattern as the
  // other debit paths above) instead of only checking the balance: without
  // this, nothing stopped a user from filing several withdrawal tickets
  // against the same balance, each independently passing the check, leaving
  // an admin to unknowingly approve payouts that exceed what's actually in
  // the wallet. There is currently no automated admin "reject" action that
  // refunds this — a rejected request needs a manual wallet credit until
  // that flow exists.
  const ticket = await prisma.$transaction(async (tx) => {
    const decremented = await tx.user.updateMany({
      where: { id: req.user!.id, walletBalance: { gte: amount } },
      data: { walletBalance: { decrement: amount } },
    });
    if (decremented.count === 0) throw new ApiError(400, "Insufficient wallet balance");

    const user = await tx.user.findUnique({
      where: { id: req.user!.id },
      select: { walletBalance: true },
    });
    const balanceAfter = user?.walletBalance ?? new Prisma.Decimal(0);

    const createdTicket = await tx.ticket.create({
      data: {
        authorId: req.user!.id,
        subject: `Withdrawal request ${amount.toString()}`,
        category: "WITHDRAWAL",
      },
    });

    await tx.walletTransaction.create({
      data: {
        userId: req.user!.id,
        amount: amount.neg(),
        type: "WITHDRAWAL",
        reference: `withdrawal:${createdTicket.id}`,
        description: "Withdrawal request pending admin processing",
        balanceBefore: balanceAfter.plus(amount),
        balanceAfter,
      },
    });

    return createdTicket;
  });

  res
    .status(201)
    .json(apiResponse(true, ticket, "Withdrawal request submitted for admin approval"));
});

export const walletTransfer = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const amount = new Prisma.Decimal(req.body.amount);
  const receiverWhere = req.body.receiverEmail
    ? { email: req.body.receiverEmail }
    : { id: req.body.receiverId };

  const result = await prisma.$transaction(async (tx) => {
    const receiver = await tx.user.findUnique({
      where: receiverWhere,
      select: { id: true, walletBalance: true },
    });
    if (!receiver) throw new ApiError(404, "Receiver not found");
    if (receiver.id === req.user!.id) throw new ApiError(400, "Cannot transfer to yourself");

    // Conditional update instead of read-then-write, same reasoning as the
    // wallet payment path above — prevents a negative balance from two
    // concurrent transfers/payments both passing a stale balance check.
    const decremented = await tx.user.updateMany({
      where: { id: req.user!.id, walletBalance: { gte: amount } },
      data: { walletBalance: { decrement: amount } },
    });
    if (decremented.count === 0) throw new ApiError(400, "Insufficient wallet balance");

    const sender = await tx.user.findUnique({
      where: { id: req.user!.id },
      select: { walletBalance: true },
    });
    const senderBalanceAfter = sender?.walletBalance ?? new Prisma.Decimal(0);

    await tx.user.update({
      where: { id: receiver.id },
      data: { walletBalance: { increment: amount } },
    });

    const reference = `transfer_${Date.now()}_${req.user!.id}_${receiver.id}`;
    await tx.walletTransaction.createMany({
      data: [
        {
          userId: req.user!.id,
          amount: amount.neg(),
          type: "TRANSFER",
          reference: `${reference}_out`,
          balanceBefore: senderBalanceAfter.plus(amount),
          balanceAfter: senderBalanceAfter,
        },
        {
          userId: receiver.id,
          amount,
          type: "TRANSFER",
          reference: `${reference}_in`,
          balanceBefore: receiver.walletBalance,
          balanceAfter: receiver.walletBalance.plus(amount),
        },
      ],
    });

    return { reference };
  });

  res.json(apiResponse(true, result, "Transfer completed"));
});

export const walletTransactions = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const transactions = await prisma.walletTransaction.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  res.json(apiResponse(true, transactions, "Wallet transactions retrieved"));
});
