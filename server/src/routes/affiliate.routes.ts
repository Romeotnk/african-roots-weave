import { Router } from "express";
import {
  getMyAffiliateLink,
  myAffiliateCommissions,
  trackAffiliateClick,
} from "../controllers/affiliate.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

export const affiliateRouter = Router();

affiliateRouter.post("/track-click", trackAffiliateClick);
affiliateRouter.get("/me", authMiddleware, getMyAffiliateLink);
affiliateRouter.get("/commissions", authMiddleware, myAffiliateCommissions);
