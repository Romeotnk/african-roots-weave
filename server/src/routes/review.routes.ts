import { Router } from "express";
import { createReview, listTargetReviews, replyToReview } from "../controllers/review.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { requireEmailVerified } from "../middlewares/role.middleware.js";

export const reviewRouter = Router();

reviewRouter.get("/", listTargetReviews);
reviewRouter.post("/", authMiddleware, requireEmailVerified, createReview);
reviewRouter.post("/:id/reply", authMiddleware, requireEmailVerified, replyToReview);
