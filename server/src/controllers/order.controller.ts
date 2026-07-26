import { Prisma } from "@prisma/client";
import { prisma } from "../config/db.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/errors.js";
import { getCommissionRates } from "../utils/commissionConfig.js";
import { payoutOrderCommissions } from "../services/mlm.service.js";

export const listMyOrders = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");

  const scope = String(req.query.scope ?? "all");
  const where: Prisma.OrderWhereInput =
    scope === "sales"
      ? { sellerId: req.user.id }
      : scope === "purchases"
        ? { buyerId: req.user.id }
        : { OR: [{ buyerId: req.user.id }, { sellerId: req.user.id }] };

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      product: { select: { id: true, title: true, slug: true, images: true } },
      buyer: { select: { id: true, firstName: true, lastName: true, email: true } },
      seller: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
  });

  res.json(apiResponse(true, orders, "My orders retrieved"));
});

export const createOrder = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");

  const quantity = Number(req.body.quantity ?? 1);
  if (quantity < 1) throw new ApiError(400, "Quantity must be positive");

  const order = await prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({
      where: { id: req.body.productId },
      select: {
        id: true,
        sellerId: true,
        price: true,
        stock: true,
        type: true,
        isActive: true,
        isApproved: true,
        commissionRate: true,
      },
    });

    if (!product || !product.isActive || !product.isApproved)
      throw new ApiError(404, "Product unavailable");
    if (product.sellerId === req.user!.id) throw new ApiError(400, "Cannot buy your own product");

    if (product.type !== "DIGITAL") {
      // Conditional update instead of read-then-write: the WHERE clause is
      // evaluated atomically by Postgres as part of the UPDATE, so two
      // concurrent buyers can't both pass a stale stock check and push the
      // stock negative.
      const decremented = await tx.product.updateMany({
        where: { id: product.id, stock: { gte: quantity } },
        data: { stock: { decrement: quantity } },
      });
      if (decremented.count === 0) throw new ApiError(400, "Insufficient stock");
    }

    const totalAmount = product.price.mul(quantity);
    const rates = await getCommissionRates(tx);
    const commissionRate = product.commissionRate ?? rates.global;
    const commissionAmount = totalAmount.mul(commissionRate);

    const created = await tx.order.create({
      data: {
        buyerId: req.user!.id,
        sellerId: product.sellerId,
        productId: product.id,
        quantity,
        unitPrice: product.price,
        totalAmount,
        commissionAmount,
      },
    });

    await tx.notification.create({
      data: {
        userId: product.sellerId,
        type: "ORDER_CREATED",
        title: "Nouvelle commande",
        message: "Une nouvelle commande a ete creee sur Iwosan.",
        link: `/orders/${created.id}`,
      },
    });

    return created;
  });

  res.status(201).json(apiResponse(true, order, "Order created. Payment can be initiated."));
});

export const markShipped = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");

  const order = await prisma.order.findUnique({ where: { id: req.params.id } });
  if (!order) throw new ApiError(404, "Order not found");
  if (order.sellerId !== req.user.id) throw new ApiError(403, "Forbidden");
  if (order.status !== "PAID") throw new ApiError(400, "Order must be paid before it can be shipped");

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: { status: "SHIPPED" },
  });

  await prisma.notification.create({
    data: {
      userId: order.buyerId,
      type: "ORDER_SHIPPED",
      title: "Commande expediee",
      message: "Votre commande a ete expediee par le vendeur.",
      link: `/orders/${order.id}`,
    },
  });

  res.json(apiResponse(true, updated, "Order marked as shipped"));
});

export const confirmDelivery = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");

  const order = await prisma.order.findUnique({ where: { id: req.params.id } });
  if (!order) throw new ApiError(404, "Order not found");
  if (order.buyerId !== req.user.id) throw new ApiError(403, "Forbidden");
  if (order.status !== "PAID" && order.status !== "SHIPPED")
    throw new ApiError(400, "Order cannot be delivered yet");

  const updated = await prisma.$transaction(async (tx) => {
    const next = await tx.order.update({
      where: { id: order.id },
      data: { status: "DELIVERED", escrowStatus: "RELEASED", deliveryConfirmedAt: new Date() },
    });
    const seller = await tx.user.findUnique({
      where: { id: order.sellerId },
      select: { walletBalance: true },
    });
    const netAmount = order.totalAmount.minus(order.commissionAmount);
    await tx.user.update({
      where: { id: order.sellerId },
      data: { walletBalance: { increment: netAmount } },
    });
    await tx.walletTransaction.create({
      data: {
        userId: order.sellerId,
        amount: netAmount,
        type: "PAYMENT",
        reference: `order:${order.id}:release`,
        description: "Escrow release after delivery confirmation",
        balanceBefore: seller?.walletBalance ?? new Prisma.Decimal(0),
        balanceAfter: (seller?.walletBalance ?? new Prisma.Decimal(0)).plus(netAmount),
      },
    });
    await tx.commission.updateMany({
      where: { sourceOrderId: order.id, type: "DIRECT", status: "APPROVED" },
      data: { status: "PAID", paidAt: new Date() },
    });

    return next;
  });

  await payoutOrderCommissions(order.id);

  res.json(apiResponse(true, updated, "Delivery confirmed"));
});

export const disputeOrder = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");

  const order = await prisma.order.findUnique({ where: { id: req.params.id } });
  if (!order) throw new ApiError(404, "Order not found");
  if (![order.buyerId, order.sellerId].includes(req.user.id)) throw new ApiError(403, "Forbidden");

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: { status: "DISPUTED", disputeReason: req.body.reason },
  });

  res.json(apiResponse(true, updated, "Dispute opened"));
});

export const requestRefund = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");

  const order = await prisma.order.findUnique({ where: { id: req.params.id } });
  if (!order) throw new ApiError(404, "Order not found");
  if (order.buyerId !== req.user.id) throw new ApiError(403, "Forbidden");

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: { refundStatus: "REQUESTED", disputeReason: req.body.reason },
  });

  res.json(apiResponse(true, updated, "Refund requested"));
});
