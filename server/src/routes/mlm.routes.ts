import { Router } from "express";
import {
  affiliateLink,
  capturePage,
  earnings,
  myTree,
  stats,
  trackClick,
} from "../controllers/mlm.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validateRequest } from "../middlewares/validation.middleware.js";
import { captureCodeValidator, trackClickValidator } from "../validators/mlm.validators.js";

export const mlmRouter = Router();

// Authenticated network insights.
mlmRouter.get("/my-tree", authMiddleware, myTree);
mlmRouter.get("/earnings", authMiddleware, earnings);
mlmRouter.get("/stats", authMiddleware, stats);
mlmRouter.get("/affiliate-link", authMiddleware, affiliateLink);

// Public affiliate funnel.
mlmRouter.post("/track-click", trackClickValidator, validateRequest, trackClick);
mlmRouter.get("/capture-page/:code", captureCodeValidator, validateRequest, capturePage);
