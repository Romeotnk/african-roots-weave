import { prisma } from '../config/db.js';
import { apiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/errors.js';

export const getCart = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, 'Authentication required');

  const items = await prisma.cartItem.findMany({
    where: { userId: req.user.id },
    orderBy: { addedAt: 'desc' },
    include: {
      product: {
        select: { id: true, title: true, slug: true, price: true, images: true, stock: true, type: true, sellerId: true },
      },
    },
  });

  res.json(apiResponse(true, items, 'Cart retrieved'));
});

export const addCartItem = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, 'Authentication required');

  const item = await prisma.cartItem.upsert({
    where: { userId_productId: { userId: req.user.id, productId: req.body.productId } },
    update: { quantity: { increment: Number(req.body.quantity ?? 1) } },
    create: { userId: req.user.id, productId: req.body.productId, quantity: Number(req.body.quantity ?? 1) },
  });

  res.status(201).json(apiResponse(true, item, 'Cart item added'));
});

export const updateCartItem = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, 'Authentication required');

  const item = await prisma.cartItem.update({
    where: { id: req.params.itemId, userId: req.user.id },
    data: { quantity: Number(req.body.quantity) },
  });

  res.json(apiResponse(true, item, 'Cart item updated'));
});

export const deleteCartItem = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, 'Authentication required');

  await prisma.cartItem.delete({ where: { id: req.params.itemId, userId: req.user.id } });
  res.json(apiResponse(true, null, 'Cart item removed'));
});
