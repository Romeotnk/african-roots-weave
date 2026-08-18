import { Router } from "express";
import { createCoupon, listCoupons, updateCoupon, validateCoupon } from "../controllers/coupon.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { checkPermission, requireEmailVerified } from "../middlewares/role.middleware.js";
import { validateRequest } from "../middlewares/validation.middleware.js";
import { couponUpdateValidator, couponValidateValidator, couponValidator, idParamValidator } from "../validators/marketplace.validators.js";

export const couponRouter = Router();

// Coupon validation and seller/admin management.
couponRouter.post("/validate", couponValidateValidator, validateRequest, validateCoupon);
couponRouter.get("/", authMiddleware, checkPermission("coupons.manage"), listCoupons);
couponRouter.post(
  "/",
  authMiddleware,
  requireEmailVerified,
  checkPermission("coupons.manage"),
  couponValidator,
  validateRequest,
  createCoupon,
);
couponRouter.put(
  "/:id",
  authMiddleware,
  requireEmailVerified,
  checkPermission("coupons.manage"),
  idParamValidator,
  couponUpdateValidator,
  validateRequest,
  updateCoupon,
);
