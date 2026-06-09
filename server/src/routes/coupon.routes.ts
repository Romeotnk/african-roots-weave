import { Role } from "@prisma/client";
import { Router } from "express";
import { createCoupon, listCoupons, validateCoupon } from "../controllers/coupon.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";
import { validateRequest } from "../middlewares/validation.middleware.js";
import { couponValidateValidator, couponValidator } from "../validators/marketplace.validators.js";

export const couponRouter = Router();

// Coupon validation and seller/admin management.
couponRouter.post("/validate", couponValidateValidator, validateRequest, validateCoupon);
couponRouter.get("/", authMiddleware, roleMiddleware([Role.ADMIN, Role.PROFESSIONAL]), listCoupons);
couponRouter.post(
  "/",
  authMiddleware,
  roleMiddleware([Role.ADMIN, Role.PROFESSIONAL]),
  couponValidator,
  validateRequest,
  createCoupon,
);
