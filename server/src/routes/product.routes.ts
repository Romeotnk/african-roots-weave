import { Role } from "@prisma/client";
import { Router } from "express";
import { listBids, placeBid } from "../controllers/bid.controller.js";
import {
  createProduct,
  deleteProduct,
  getProductBySlug,
  listMyProducts,
  listProducts,
  updateProduct,
  uploadProductImages,
} from "../controllers/product.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { kycMiddleware } from "../middlewares/kyc.middleware.js";
import { requireEmailVerified, roleMiddleware } from "../middlewares/role.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";
import { validateRequest } from "../middlewares/validation.middleware.js";
import {
  bidValidator,
  createProductValidator,
  idParamValidator,
  productListValidator,
  slugParamValidator,
  updateProductValidator,
} from "../validators/marketplace.validators.js";

export const productRouter = Router();

// Product catalog.
productRouter.get("/", productListValidator, validateRequest, listProducts);
productRouter.get("/mine", authMiddleware, listMyProducts);
productRouter.get("/:slug", slugParamValidator, validateRequest, getProductBySlug);
productRouter.post(
  "/",
  authMiddleware,
  requireEmailVerified,
  roleMiddleware([Role.PROFESSIONAL, Role.SUPER_ADMIN, Role.ADMIN]),
  kycMiddleware,
  createProductValidator,
  validateRequest,
  createProduct,
);
productRouter.put("/:id", authMiddleware, requireEmailVerified, updateProductValidator, validateRequest, updateProduct);
productRouter.delete("/:id", authMiddleware, requireEmailVerified, idParamValidator, validateRequest, deleteProduct);
productRouter.post(
  "/:id/upload-images",
  authMiddleware,
  requireEmailVerified,
  idParamValidator,
  validateRequest,
  upload.array("images", 8),
  uploadProductImages,
);

// Auction bids.
productRouter.get("/:id/bids", idParamValidator, validateRequest, listBids);
productRouter.post("/:id/bids", authMiddleware, requireEmailVerified, bidValidator, validateRequest, placeBid);
