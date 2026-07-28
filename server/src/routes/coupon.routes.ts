import { Role } from "@prisma/client";
import { Router } from "express";
import { createCoupon, listCoupons, updateCoupon, validateCoupon } from "../controllers/coupon.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { requireEmailVerified, roleMiddleware } from "../middlewares/role.middleware.js";
import { validateRequest } from "../middlewares/validation.middleware.js";
import { couponValidateValidator, couponValidator, idParamValidator } from "../validators/marketplace.validators.js";

export const couponRouter = Router();

// Coupon validation and seller/admin management.
couponRouter.post("/validate", couponValidateValidator, validateRequest, validateCoupon);
couponRouter.get("/", authMiddleware, roleMiddleware([Role.SUPER_ADMIN, Role.ADMIN, Role.PROFESSIONAL]), listCoupons);
couponRouter.post(
  "/",
  authMiddleware,
  requireEmailVerified,
  roleMiddleware([Role.SUPER_ADMIN, Role.ADMIN, Role.PROFESSIONAL]),
  couponValidator,
  validateRequest,
  createCoupon,
);
couponRouter.put(
  "/:id",
  authMiddleware,
  requireEmailVerified,
  roleMiddleware([Role.SUPER_ADMIN, Role.ADMIN, Role.PROFESSIONAL]),
  idParamValidator,
  validateRequest,
  updateCoupon,
);
