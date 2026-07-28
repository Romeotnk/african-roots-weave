import { Router } from "express";
import { getMySubscription, listPlans, upgradeMySubscription } from "../controllers/subscription.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

export const subscriptionRouter = Router();

subscriptionRouter.get("/plans", listPlans);
subscriptionRouter.get("/me", authMiddleware, getMySubscription);
subscriptionRouter.post("/me/upgrade", authMiddleware, upgradeMySubscription);
