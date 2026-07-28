import { MedCategory, Prisma, ProductType, Role } from "@prisma/client";
import { prisma } from "../config/db.js";
import { uploadBufferToCloudinary } from "../services/cloudinary.service.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/errors.js";
import { getPagination, paginationMeta } from "../utils/pagination.js";
import { makeSlug } from "../utils/slug.js";
import { SUBSCRIPTION_PLANS } from "../utils/subscriptionPlans.js";
import { optimizeAndWatermarkImage } from "../utils/watermark.js";

const LISTING_DURATION_DAYS = 60;
const listingExpiryFromNow = () => new Date(Date.now() + LISTING_DURATION_DAYS * 24 * 60 * 60 * 1000);
const notExpired = (): Prisma.ProductWhereInput => ({
  OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
});

const FEATURED_BOOST_PRICE = new Prisma.Decimal(2000);
const FEATURED_BOOST_DAYS = 7;
const URGENT_BADGE_PRICE = new Prisma.Decimal(1000);
const URGENT_BADGE_DAYS = 3;

const productSelect = {
  id: true,
  title: true,
  slug: true,
  description: true,
  price: true,
  category: true,
  type: true,
  images: true,
  stock: true,
  isActive: true,
  isApproved: true,
  isFeatured: true,
  featuredUntil: true,
  isUrgent: true,
  urgentUntil: true,
  isQuoteOnly: true,
  auctionEnabled: true,
  auctionEndDate: true,
  currentBid: true,
  viewCount: true,
  expiresAt: true,
  createdAt: true,
  updatedAt: true,
  seller: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      country: true,
      professionalProfile: {
        select: {
          displayName: true,
          averageRating: true,
          totalReviews: true,
          location: true,
          isVerified: true,
          latitude: true,
          longitude: true,
        },
      },
    },
  },
} satisfies Prisma.ProductSelect;

const canModerateProducts = (role: Role) => role === Role.SUPER_ADMIN || role === Role.ADMIN;

export const listProducts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const minPrice = req.query.minPrice ? new Prisma.Decimal(String(req.query.minPrice)) : undefined;
  const maxPrice = req.query.maxPrice ? new Prisma.Decimal(String(req.query.maxPrice)) : undefined;
  const sort = String(req.query.sort ?? "newest");

  const where: Prisma.ProductWhereInput = {
    isActive: true,
    isApproved: true,
    ...notExpired(),
    category: Object.values(MedCategory).includes(req.query.category as MedCategory)
      ? (req.query.category as MedCategory)
      : undefined,
    type: Object.values(ProductType).includes(req.query.type as ProductType)
      ? (req.query.type as ProductType)
      : undefined,
    sellerId: typeof req.query.sellerId === "string" ? req.query.sellerId : undefined,
    price: minPrice || maxPrice ? { gte: minPrice, lte: maxPrice } : undefined,
    seller:
      typeof req.query.location === "string"
        ? {
            professionalProfile: {
              location: { contains: req.query.location, mode: "insensitive" },
            },
          }
        : undefined,
  };

  const secondaryOrderBy: Prisma.ProductOrderByWithRelationInput =
    sort === "price_asc"
      ? { price: "asc" }
      : sort === "price_desc"
        ? { price: "desc" }
        : sort === "rating"
          ? { seller: { professionalProfile: { averageRating: "desc" } } }
          : { createdAt: "desc" };

  // Boosted listings ("mise en avant") always float to the top regardless of
  // the chosen sort — that's the entire point of the paid option.
  const orderBy: Prisma.ProductOrderByWithRelationInput[] = [{ isFeatured: "desc" }, secondaryOrderBy];

  const [products, total] = await prisma.$transaction([
    prisma.product.findMany({ where, orderBy, skip, take: limit, select: productSelect }),
    prisma.product.count({ where }),
  ]);

  res.json(apiResponse(true, products, "Products retrieved", paginationMeta(page, limit, total)));
});

export const listMyProducts = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");

  const { page, limit, skip } = getPagination(req.query);
  const [products, total] = await prisma.$transaction([
    prisma.product.findMany({
      where: { sellerId: req.user.id },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: productSelect,
    }),
    prisma.product.count({ where: { sellerId: req.user.id } }),
  ]);

  res.json(apiResponse(true, products, "My products retrieved", paginationMeta(page, limit, total)));
});

export const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await prisma.product.findFirst({
    where: { slug: req.params.slug, isActive: true, isApproved: true, ...notExpired() },
    select: productSelect,
  });
  if (!product) throw new ApiError(404, "Product not found");

  await prisma.product.update({ where: { id: product.id }, data: { viewCount: { increment: 1 } } });

  res.json(apiResponse(true, { ...product, viewCount: product.viewCount + 1 }, "Product retrieved"));
});

// Sellers without a Subscription row are on the implicit FREE plan.
const getSubscriptionLimits = async (userId: string) => {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    select: { maxListings: true, maxDownloads: true },
  });
  return subscription ?? { maxListings: SUBSCRIPTION_PLANS.FREE.maxListings, maxDownloads: SUBSCRIPTION_PLANS.FREE.maxDownloads };
};

export const createProduct = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");

  const limits = await getSubscriptionLimits(req.user.id);
  const activeListings = await prisma.product.count({
    where: { sellerId: req.user.id, isActive: true, ...notExpired() },
  });
  if (activeListings >= limits.maxListings) {
    throw new ApiError(
      403,
      `Limite d'annonces actives atteinte (${limits.maxListings}) pour votre forfait. Passez à un forfait supérieur pour publier davantage.`,
    );
  }

  let downloadLimit = req.body.downloadLimit;
  if (req.body.type === ProductType.DIGITAL && downloadLimit != null) {
    downloadLimit = Math.min(Number(downloadLimit), limits.maxDownloads);
  }

  const baseSlug = makeSlug(req.body.title);
  const slug = `${baseSlug}-${Date.now().toString(36)}`;

  const product = await prisma.product.create({
    data: {
      sellerId: req.user.id,
      title: req.body.title,
      slug,
      description: req.body.description,
      price: new Prisma.Decimal(req.body.price),
      category: req.body.category,
      type: req.body.type,
      images: req.body.images ?? [],
      stock: Number(req.body.stock ?? 0),
      auctionEnabled: Boolean(req.body.auctionEnabled ?? false),
      auctionEndDate: req.body.auctionEndDate ? new Date(req.body.auctionEndDate) : undefined,
      commissionRate: req.body.commissionRate,
      downloadLimit,
      fileUrl: req.body.fileUrl,
      isQuoteOnly: Boolean(req.body.isQuoteOnly ?? false),
      isApproved: canModerateProducts(req.user.role),
      expiresAt: listingExpiryFromNow(),
    },
    select: productSelect,
  });

  res.status(201).json(apiResponse(true, product, "Product created"));
});

export const updateProduct = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");

  const existing = await prisma.product.findUnique({
    where: { id: req.params.id },
    select: { sellerId: true, type: true },
  });
  if (!existing) throw new ApiError(404, "Product not found");
  if (existing.sellerId !== req.user.id && !canModerateProducts(req.user.role))
    throw new ApiError(403, "Forbidden");

  let downloadLimit = req.body.downloadLimit;
  if ((req.body.type ?? existing.type) === ProductType.DIGITAL && downloadLimit != null) {
    const limits = await getSubscriptionLimits(existing.sellerId);
    downloadLimit = Math.min(Number(downloadLimit), limits.maxDownloads);
  }

  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: {
      title: req.body.title,
      description: req.body.description,
      price: req.body.price ? new Prisma.Decimal(req.body.price) : undefined,
      category: req.body.category,
      type: req.body.type,
      stock: req.body.stock,
      isActive: req.body.isActive,
      auctionEnabled: req.body.auctionEnabled,
      auctionEndDate: req.body.auctionEndDate ? new Date(req.body.auctionEndDate) : undefined,
      commissionRate: req.body.commissionRate,
      downloadLimit,
      fileUrl: req.body.fileUrl,
      isQuoteOnly: typeof req.body.isQuoteOnly === "boolean" ? req.body.isQuoteOnly : undefined,
      isApproved: canModerateProducts(req.user.role) ? req.body.isApproved : false,
    },
    select: productSelect,
  });

  res.json(apiResponse(true, product, "Product updated"));
});

export const renewProduct = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");

  const existing = await prisma.product.findUnique({
    where: { id: req.params.id },
    select: { sellerId: true },
  });
  if (!existing) throw new ApiError(404, "Product not found");
  if (existing.sellerId !== req.user.id && !canModerateProducts(req.user.role))
    throw new ApiError(403, "Forbidden");

  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: { expiresAt: listingExpiryFromNow(), isActive: true },
    select: productSelect,
  });

  res.json(apiResponse(true, product, "Listing renewed"));
});

const debitWalletForOption = async (userId: string, amount: Prisma.Decimal, reference: string, description: string) =>
  prisma.$transaction(async (tx) => {
    // Conditional update instead of read-then-write, same reasoning as the
    // stock decrement above: a single atomic WHERE clause prevents two
    // concurrent purchases from both passing a stale balance check.
    const decremented = await tx.user.updateMany({
      where: { id: userId, walletBalance: { gte: amount } },
      data: { walletBalance: { decrement: amount } },
    });
    if (decremented.count === 0) throw new ApiError(400, "Solde du portefeuille insuffisant");

    const buyer = await tx.user.findUnique({ where: { id: userId }, select: { walletBalance: true } });
    const balanceAfter = buyer?.walletBalance ?? new Prisma.Decimal(0);
    await tx.walletTransaction.create({
      data: {
        userId,
        amount: amount.neg(),
        type: "PAYMENT",
        reference,
        description,
        balanceBefore: balanceAfter.plus(amount),
        balanceAfter,
      },
    });
  });

export const boostProduct = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const existing = await prisma.product.findUnique({ where: { id: req.params.id }, select: { sellerId: true } });
  if (!existing) throw new ApiError(404, "Product not found");
  if (existing.sellerId !== req.user.id) throw new ApiError(403, "Forbidden");

  await debitWalletForOption(
    req.user.id,
    FEATURED_BOOST_PRICE,
    `product:${req.params.id}:boost:${Date.now()}`,
    "Mise en avant d'une annonce (7 jours)",
  );

  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: { isFeatured: true, featuredUntil: new Date(Date.now() + FEATURED_BOOST_DAYS * 24 * 60 * 60 * 1000) },
    select: productSelect,
  });

  res.json(apiResponse(true, product, "Listing featured"));
});

export const markProductUrgent = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const existing = await prisma.product.findUnique({ where: { id: req.params.id }, select: { sellerId: true } });
  if (!existing) throw new ApiError(404, "Product not found");
  if (existing.sellerId !== req.user.id) throw new ApiError(403, "Forbidden");

  await debitWalletForOption(
    req.user.id,
    URGENT_BADGE_PRICE,
    `product:${req.params.id}:urgent:${Date.now()}`,
    "Badge urgent sur une annonce (3 jours)",
  );

  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: { isUrgent: true, urgentUntil: new Date(Date.now() + URGENT_BADGE_DAYS * 24 * 60 * 60 * 1000) },
    select: productSelect,
  });

  res.json(apiResponse(true, product, "Listing marked urgent"));
});

export const deleteProduct = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");

  const existing = await prisma.product.findUnique({
    where: { id: req.params.id },
    select: { sellerId: true },
  });
  if (!existing) throw new ApiError(404, "Product not found");
  if (existing.sellerId !== req.user.id && !canModerateProducts(req.user.role))
    throw new ApiError(403, "Forbidden");

  await prisma.product.update({ where: { id: req.params.id }, data: { isActive: false } });
  res.json(apiResponse(true, null, "Product deleted"));
});

export const uploadProductImages = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");

  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
    select: { sellerId: true, images: true },
  });
  if (!product) throw new ApiError(404, "Product not found");
  if (product.sellerId !== req.user.id && !canModerateProducts(req.user.role))
    throw new ApiError(403, "Forbidden");

  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  const urls = await Promise.all(
    files.map(async (file) => {
      const watermarked = await optimizeAndWatermarkImage(file.buffer);
      return uploadBufferToCloudinary(watermarked, "iwosan/products", "image");
    }),
  );

  const updated = await prisma.product.update({
    where: { id: req.params.id },
    data: { images: [...product.images, ...urls], watermarked: true },
    select: { id: true, images: true, watermarked: true },
  });

  res.json(apiResponse(true, updated, "Images uploaded"));
});
