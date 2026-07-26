import { Router } from "express";
import {
  walletBalance,
  walletDeposit,
  walletTransactions,
  walletTransfer,
  walletWithdraw,
} from "../controllers/payment.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { sensitiveActionRateLimit } from "../middlewares/rateLimit.middleware.js";
import { validateRequest } from "../middlewares/validation.middleware.js";
import {
  depositValidator,
  transferValidator,
  withdrawValidator,
} from "../validators/payment.validators.js";

export const walletRouter = Router();

// Wallet balance and money movements.
walletRouter.use(authMiddleware);
walletRouter.get("/balance", walletBalance);
walletRouter.post("/deposit", sensitiveActionRateLimit, depositValidator, validateRequest, walletDeposit);
walletRouter.post("/withdraw", sensitiveActionRateLimit, withdrawValidator, validateRequest, walletWithdraw);
walletRouter.post("/transfer", sensitiveActionRateLimit, transferValidator, validateRequest, walletTransfer);
walletRouter.get("/transactions", walletTransactions);
