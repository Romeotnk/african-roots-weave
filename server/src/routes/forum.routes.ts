import { Role } from "@prisma/client";
import { Router } from "express";
import {
  acceptAnswer,
  closeQuestion,
  createAnswer,
  createComment,
  createQuestion,
  featureQuestion,
  getQuestion,
  listMyQuestions,
  listQuestions,
  report,
  searchQuestions,
  updateAnswer,
  updateQuestion,
  vote,
} from "../controllers/forum.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { requireEmailVerified, roleMiddleware } from "../middlewares/role.middleware.js";

export const forumRouter = Router();

// Questions and answers.
forumRouter.get("/questions", listQuestions);
forumRouter.get("/questions/mine", authMiddleware, listMyQuestions);
forumRouter.get("/questions/:id", getQuestion);
forumRouter.post("/questions", authMiddleware, requireEmailVerified, createQuestion);
forumRouter.put("/questions/:id", authMiddleware, requireEmailVerified, updateQuestion);
forumRouter.post("/questions/:id/answers", authMiddleware, requireEmailVerified, createAnswer);
forumRouter.put("/answers/:id", authMiddleware, requireEmailVerified, updateAnswer);
forumRouter.post("/answers/:id/accept", authMiddleware, requireEmailVerified, acceptAnswer);

// Discussion moderation.
forumRouter.post("/comments", authMiddleware, requireEmailVerified, createComment);
forumRouter.post("/vote", authMiddleware, requireEmailVerified, vote);
forumRouter.post("/report", authMiddleware, requireEmailVerified, report);
forumRouter.post(
  "/questions/:id/feature",
  authMiddleware,
  requireEmailVerified,
  roleMiddleware([Role.SUPER_ADMIN, Role.ADMIN]),
  featureQuestion,
);
forumRouter.post(
  "/questions/:id/close",
  authMiddleware,
  requireEmailVerified,
  roleMiddleware([Role.SUPER_ADMIN, Role.ADMIN, Role.MODERATOR]),
  closeQuestion,
);
forumRouter.get("/search", searchQuestions);
