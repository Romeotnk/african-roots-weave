import { Prisma, Role } from "@prisma/client";
import { prisma } from "../config/db.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/errors.js";
import { getCommissionRates, resolveProductCommissionRate } from "../utils/commissionConfig.js";
import { payoutOrderCommissions } from "../services/mlm.service.js";
import { createNotification } from "../services/notification.service.js";

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
        category: true,
        isActive: true,
        isApproved: true,
        commissionRate: true,
        seller: { select: { professionalProfile: { select: { defaultCommissionRate: true } } } },
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

    const grossAmount = product.price.mul(quantity);

    // Coupons are validated and consumed atomically here (not just at the
    // /coupons/validate preview step) so a stale client-side check can never
    // apply a discount the coupon no longer allows (expired, exhausted,
    // deactivated, or scoped to a different seller since the preview).
    let discountAmount = new Prisma.Decimal(0);
    const couponCode = typeof req.body.couponCode === "string" ? req.body.couponCode.trim().toUpperCase() : "";
    if (couponCode) {
      const coupon = await tx.coupon.findUnique({ where: { code: couponCode } });
      const isUsable =
        coupon &&
        coupon.isActive &&
        (!coupon.expiresAt || coupon.expiresAt > new Date()) &&
        (!coupon.maxUses || coupon.usedCount < coupon.maxUses) &&
        (!coupon.sellerId || coupon.sellerId === product.sellerId);
      if (!isUsable) throw new ApiError(400, "Ce code coupon n'est plus valide pour cet achat.");

      const consumed = await tx.coupon.updateMany({
        where: { id: coupon.id, usedCount: coupon.usedCount },
        data: { usedCount: { increment: 1 } },
      });
      if (consumed.count === 0) throw new ApiError(409, "Ce coupon vient d'être utilisé, réessayez.");

      discountAmount = coupon.isPercentage
        ? grossAmount.mul(coupon.discount).div(100)
        : new Prisma.Decimal(coupon.discount);
      if (discountAmount.greaterThan(grossAmount)) discountAmount = grossAmount;
    }

    const totalAmount = grossAmount.minus(discountAmount);
    const rates = await getCommissionRates(tx);
    const commissionRate = resolveProductCommissionRate(rates, product, product.seller.professionalProfile?.defaultCommissionRate);
    const commissionAmount = totalAmount.mul(commissionRate);

    // An affiliate link only counts if it belongs to neither party in this
    // sale — otherwise a seller (or the buyer themselves) could self-credit.
    let affiliateLinkId: string | undefined;
    const affiliateCode = typeof req.body.affiliateCode === "string" ? req.body.affiliateCode.trim() : "";
    if (affiliateCode) {
      const affiliateLink = await tx.affiliateLink.findUnique({ where: { code: affiliateCode }, select: { id: true, userId: true } });
      if (affiliateLink && affiliateLink.userId !== req.user!.id && affiliateLink.userId !== product.sellerId) {
        affiliateLinkId = affiliateLink.id;
      }
    }

    const created = await tx.order.create({
      data: {
        buyerId: req.user!.id,
        sellerId: product.sellerId,
        productId: product.id,
        quantity,
        unitPrice: product.price,
        totalAmount,
        commissionAmount,
        discountAmount,
        affiliateLinkId,
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

// Lets the seller acknowledge a refund/dispute request without granting them
// any approval power — final decision (fund movement) stays admin-only via
// adminFinance.controller.ts's approveRefund/resolveDispute.
export const acknowledgeRefund = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");

  const order = await prisma.order.findUnique({ where: { id: req.params.id } });
  if (!order) throw new ApiError(404, "Order not found");
  if (order.sellerId !== req.user.id) throw new ApiError(403, "Forbidden");
  if (!order.refundStatus && order.status !== "DISPUTED")
    throw new ApiError(400, "Aucun remboursement ou litige en cours sur cette commande");

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: {
      sellerAcknowledgedAt: new Date(),
      sellerRefundNote: typeof req.body.note === "string" ? req.body.note.slice(0, 1000) : undefined,
    },
  });

  const admins = await prisma.user.findMany({
    where: { role: { in: [Role.ADMIN, Role.SUPER_ADMIN] } },
    select: { id: true },
  });
  await Promise.allSettled(
    admins.map((admin) =>
      createNotification({
        userId: admin.id,
        type: "SYSTEM",
        title: "Vendeur : accusé de réception",
        message: `Le vendeur a pris connaissance de la demande de remboursement pour la commande ${order.id}.`,
        link: "/admin/finances/remboursements",
      }),
    ),
  );

  res.json(apiResponse(true, updated, "Refund acknowledged"));
});
