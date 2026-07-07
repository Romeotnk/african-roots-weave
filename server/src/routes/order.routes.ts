import { Router } from "express";
import {
  confirmDelivery,
  createOrder,
  disputeOrder,
  listMyOrders,
  requestRefund,
} from "../controllers/order.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validateRequest } from "../middlewares/validation.middleware.js";
import {
  idParamValidator,
  orderValidator,
  reasonValidator,
} from "../validators/marketplace.validators.js";

export const orderRouter = Router();

// Orders and escrow lifecycle.
orderRouter.use(authMiddleware);
orderRouter.get("/mine", listMyOrders);
orderRouter.post("/", orderValidator, validateRequest, createOrder);
orderRouter.post("/:id/confirm-delivery", idParamValidator, validateRequest, confirmDelivery);
orderRouter.post("/:id/dispute", reasonValidator, validateRequest, disputeOrder);
orderRouter.post("/:id/refund-request", reasonValidator, validateRequest, requestRefund);
