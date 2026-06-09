import { Router } from "express";
import {
  walletBalance,
  walletDeposit,
  walletTransactions,
  walletTransfer,
  walletWithdraw,
} from "../controllers/payment.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
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
walletRouter.post("/deposit", depositValidator, validateRequest, walletDeposit);
walletRouter.post("/withdraw", withdrawValidator, validateRequest, walletWithdraw);
walletRouter.post("/transfer", transferValidator, validateRequest, walletTransfer);
walletRouter.get("/transactions", walletTransactions);
