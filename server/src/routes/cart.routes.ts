import { Router } from 'express';
import { addCartItem, deleteCartItem, getCart, updateCartItem } from '../controllers/cart.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { validateRequest } from '../middlewares/validation.middleware.js';
import { cartItemValidator, cartQuantityValidator } from '../validators/marketplace.validators.js';

export const cartRouter = Router();

// Cross-device authenticated cart.
cartRouter.use(authMiddleware);
cartRouter.get('/', getCart);
cartRouter.post('/', cartItemValidator, validateRequest, addCartItem);
cartRouter.put('/:itemId', cartQuantityValidator, validateRequest, updateCartItem);
cartRouter.delete('/:itemId', cartQuantityValidator.slice(0, 1), validateRequest, deleteCartItem);
