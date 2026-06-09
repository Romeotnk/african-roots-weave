import { MedCategory, Prisma, ProductType, Role } from "@prisma/client";
import { prisma } from "../config/db.js";
import { uploadBufferToCloudinary } from "../services/cloudinary.service.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/errors.js";
import { getPagination, paginationMeta } from "../utils/pagination.js";
import { makeSlug } from "../utils/slug.js";
import { optimizeAndWatermarkImage } from "../utils/watermark.js";

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
  auctionEnabled: true,
  auctionEndDate: true,
  currentBid: true,
  viewCount: true,
  createdAt: true,
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
        },
      },
    },
  },
} satisfies Prisma.ProductSelect;

export const listProducts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const minPrice = req.query.minPrice ? new Prisma.Decimal(String(req.query.minPrice)) : undefined;
  const maxPrice = req.query.maxPrice ? new Prisma.Decimal(String(req.query.maxPrice)) : undefined;
  const sort = String(req.query.sort ?? "newest");

  const where: Prisma.ProductWhereInput = {
    isActive: true,
    isApproved: true,
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

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === "price_asc"
      ? { price: "asc" }
      : sort === "price_desc"
        ? { price: "desc" }
        : sort === "rating"
          ? { seller: { professionalProfile: { averageRating: "desc" } } }
          : { createdAt: "desc" };

  const [products, total] = await prisma.$transaction([
    prisma.product.findMany({ where, orderBy, skip, take: limit, select: productSelect }),
    prisma.product.count({ where }),
  ]);

  res.json(apiResponse(true, products, "Products retrieved", paginationMeta(page, limit, total)));
});

export const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await prisma.product.update({
    where: { slug: req.params.slug },
    data: { viewCount: { increment: 1 } },
    select: productSelect,
  });

  res.json(apiResponse(true, product, "Product retrieved"));
});

export const createProduct = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");

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
      downloadLimit: req.body.downloadLimit,
      fileUrl: req.body.fileUrl,
      isApproved: req.user.role === Role.ADMIN,
    },
    select: productSelect,
  });

  res.status(201).json(apiResponse(true, product, "Product created"));
});

export const updateProduct = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");

  const existing = await prisma.product.findUnique({
    where: { id: req.params.id },
    select: { sellerId: true },
  });
  if (!existing) throw new ApiError(404, "Product not found");
  if (existing.sellerId !== req.user.id && req.user.role !== Role.ADMIN)
    throw new ApiError(403, "Forbidden");

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
      downloadLimit: req.body.downloadLimit,
      fileUrl: req.body.fileUrl,
      isApproved: req.user.role === Role.ADMIN ? req.body.isApproved : false,
    },
    select: productSelect,
  });

  res.json(apiResponse(true, product, "Product updated"));
});

export const deleteProduct = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");

  const existing = await prisma.product.findUnique({
    where: { id: req.params.id },
    select: { sellerId: true },
  });
  if (!existing) throw new ApiError(404, "Product not found");
  if (existing.sellerId !== req.user.id && req.user.role !== Role.ADMIN)
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
  if (product.sellerId !== req.user.id && req.user.role !== Role.ADMIN)
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
