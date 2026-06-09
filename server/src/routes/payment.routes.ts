import { Router } from "express";
import { initiatePayment, monerooWebhook } from "../controllers/payment.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validateRequest } from "../middlewares/validation.middleware.js";
import { initiatePaymentValidator } from "../validators/payment.validators.js";

export const paymentRouter = Router();
export const webhookRouter = Router();

// Payment initialization.
paymentRouter.post(
  "/initiate",
  authMiddleware,
  initiatePaymentValidator,
  validateRequest,
  initiatePayment,
);

// Provider webhooks.
webhookRouter.post("/moneroo", monerooWebhook);
