import { Prisma } from "@prisma/client";
import { prisma } from "../config/db.js";
import { createNotification } from "../services/notification.service.js";
import { getCommissionRates, resolveProductCommissionRate } from "../utils/commissionConfig.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/errors.js";

const MAX_MESSAGE_LENGTH = 2000;
const cleanMessage = (value: unknown) =>
  typeof value === "string" ? value.replace(/<[^>]*>/g, "").trim().slice(0, MAX_MESSAGE_LENGTH) : undefined;

const quoteSelect = {
  id: true,
  productId: true,
  buyerId: true,
  sellerId: true,
  status: true,
  proposedPrice: true,
  message: true,
  responseNote: true,
  orderId: true,
  createdAt: true,
  updatedAt: true,
  product: { select: { id: true, title: true, images: true, isQuoteOnly: true } },
  buyer: { select: { id: true, firstName: true, lastName: true } },
  seller: { select: { id: true, firstName: true, lastName: true } },
} satisfies Prisma.QuoteRequestSelect;

// Every quote step also drops a normal chat message into the buyer/seller
// conversation so the whole negotiation stays visible in the messaging
// thread they already use, per the spec's "reuses the messaging system".
const postThreadMessage = (senderId: string, receiverId: string, content: string) =>
  prisma.message.create({ data: { senderId, receiverId, content } });

export const createQuoteRequest = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const productId = String(req.body.productId ?? "");
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, sellerId: true, title: true, isQuoteOnly: true, isActive: true, isApproved: true },
  });
  if (!product || !product.isActive || !product.isApproved) throw new ApiError(404, "Product unavailable");
  if (!product.isQuoteOnly) throw new ApiError(400, "This listing does not use quote requests");
  if (product.sellerId === req.user.id) throw new ApiError(400, "Cannot request a quote on your own listing");

  const message = cleanMessage(req.body.message) ?? `Bonjour, pourriez-vous me faire un devis pour "${product.title}" ?`;

  const quote = await prisma.quoteRequest.create({
    data: { productId: product.id, buyerId: req.user.id, sellerId: product.sellerId, message },
    select: quoteSelect,
  });

  await postThreadMessage(req.user.id, product.sellerId, message);
  await createNotification({
    userId: product.sellerId,
    type: "QUOTE_REQUESTED",
    title: "Demande de devis",
    message: `Une demande de devis a ete recue pour "${product.title}".`,
    link: "/tableau-de-bord/devis",
  });

  res.status(201).json(apiResponse(true, quote, "Quote requested"));
});

export const proposeQuote = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const quote = await prisma.quoteRequest.findUnique({ where: { id: req.params.id } });
  if (!quote) throw new ApiError(404, "Quote request not found");
  if (quote.sellerId !== req.user.id) throw new ApiError(403, "Forbidden");
  if (quote.status === "ACCEPTED") throw new ApiError(400, "This quote was already accepted");

  const proposedPrice = new Prisma.Decimal(req.body.proposedPrice);
  if (proposedPrice.lte(0)) throw new ApiError(422, "proposedPrice must be positive");
  const note = cleanMessage(req.body.responseNote);

  const updated = await prisma.quoteRequest.update({
    where: { id: quote.id },
    data: { status: "PROPOSED", proposedPrice, responseNote: note },
    select: quoteSelect,
  });

  const priceLabel = `${proposedPrice.toString()} FCFA`;
  await postThreadMessage(req.user.id, quote.buyerId, note ? `Devis propose : ${priceLabel}. ${note}` : `Devis propose : ${priceLabel}.`);
  await createNotification({
    userId: quote.buyerId,
    type: "QUOTE_PROPOSED",
    title: "Devis recu",
    message: `Un devis de ${priceLabel} vous a ete propose.`,
    link: "/mon-compte/devis",
  });

  res.json(apiResponse(true, updated, "Quote proposed"));
});

export const declineQuote = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const quote = await prisma.quoteRequest.findUnique({ where: { id: req.params.id } });
  if (!quote) throw new ApiError(404, "Quote request not found");
  if (quote.sellerId !== req.user.id && quote.buyerId !== req.user.id) throw new ApiError(403, "Forbidden");
  if (quote.status === "ACCEPTED") throw new ApiError(400, "This quote was already accepted");

  const updated = await prisma.quoteRequest.update({
    where: { id: quote.id },
    data: { status: "DECLINED" },
    select: quoteSelect,
  });

  const otherPartyId = req.user.id === quote.sellerId ? quote.buyerId : quote.sellerId;
  await createNotification({
    userId: otherPartyId,
    type: "QUOTE_DECLINED",
    title: "Devis refuse",
    message: "Une demande de devis a ete refusee.",
    link: "/messages",
  });

  res.json(apiResponse(true, updated, "Quote declined"));
});

export const acceptQuote = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");

  const result = await prisma.$transaction(async (tx) => {
    const quote = await tx.quoteRequest.findUnique({
      where: { id: req.params.id },
      include: { product: { select: { id: true, category: true, commissionRate: true, type: true } } },
    });
    if (!quote) throw new ApiError(404, "Quote request not found");
    if (quote.buyerId !== req.user!.id) throw new ApiError(403, "Only the buyer can accept a quote");
    if (quote.status !== "PROPOSED" || !quote.proposedPrice) throw new ApiError(400, "This quote has no active proposal to accept");

    const rates = await getCommissionRates(tx);
    const sellerProfile = await tx.professionalProfile.findUnique({
      where: { userId: quote.sellerId },
      select: { defaultCommissionRate: true },
    });
    const commissionRate = resolveProductCommissionRate(rates, quote.product, sellerProfile?.defaultCommissionRate);
    const commissionAmount = quote.proposedPrice.mul(commissionRate);

    const order = await tx.order.create({
      data: {
        buyerId: quote.buyerId,
        sellerId: quote.sellerId,
        productId: quote.productId,
        quantity: 1,
        unitPrice: quote.proposedPrice,
        totalAmount: quote.proposedPrice,
        commissionAmount,
      },
    });

    const updatedQuote = await tx.quoteRequest.update({
      where: { id: quote.id },
      data: { status: "ACCEPTED", orderId: order.id },
      select: quoteSelect,
    });

    return { updatedQuote, order, sellerId: quote.sellerId };
  });

  await createNotification({
    userId: result.sellerId,
    type: "QUOTE_ACCEPTED",
    title: "Devis accepte",
    message: "Votre devis a ete accepte, une commande a ete creee.",
    link: `/tableau-de-bord/commandes`,
  });

  res.json(apiResponse(true, result.updatedQuote, "Quote accepted, order created"));
});

export const listMyQuotes = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const scope = String(req.query.scope ?? "buyer");
  const where = scope === "seller" ? { sellerId: req.user.id } : { buyerId: req.user.id };

  const quotes = await prisma.quoteRequest.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    take: 100,
    select: quoteSelect,
  });
  res.json(apiResponse(true, quotes, "Quotes retrieved"));
});
