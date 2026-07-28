import { Router } from "express";
import {
  acceptAnswer,
  closeQuestion,
  createAnswer,
  createComment,
  createQuestion,
  featureQuestion,
  getQuestion,
  listForumCategories,
  listMyFavorites,
  listMyQuestions,
  listQuestions,
  report,
  searchQuestions,
  toggleFavorite,
  updateAnswer,
  updateComment,
  updateQuestion,
  uploadForumAttachments,
  vote,
} from "../controllers/forum.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { forumPostingAccess } from "../middlewares/forumAccess.middleware.js";
import { checkPermission, requireEmailVerified } from "../middlewares/role.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";

export const forumRouter = Router();

// Questions and answers.
forumRouter.get("/categories", listForumCategories);
forumRouter.get("/questions", listQuestions);
forumRouter.get("/questions/mine", authMiddleware, listMyQuestions);
forumRouter.get("/questions/:id", getQuestion);
forumRouter.post("/questions", authMiddleware, requireEmailVerified, forumPostingAccess, createQuestion);
forumRouter.put("/questions/:id", authMiddleware, requireEmailVerified, updateQuestion);
forumRouter.post("/questions/:id/answers", authMiddleware, requireEmailVerified, forumPostingAccess, createAnswer);
forumRouter.put("/answers/:id", authMiddleware, requireEmailVerified, updateAnswer);
forumRouter.post("/answers/:id/accept", authMiddleware, requireEmailVerified, acceptAnswer);

// Discussion moderation.
forumRouter.post("/comments", authMiddleware, requireEmailVerified, forumPostingAccess, createComment);
forumRouter.put("/comments/:id", authMiddleware, requireEmailVerified, updateComment);
forumRouter.post("/vote", authMiddleware, requireEmailVerified, vote);
forumRouter.post("/favorites", authMiddleware, requireEmailVerified, toggleFavorite);
forumRouter.get("/favorites/mine", authMiddleware, listMyFavorites);
forumRouter.post("/report", authMiddleware, requireEmailVerified, report);
forumRouter.post(
  "/questions/:id/feature",
  authMiddleware,
  requireEmailVerified,
  checkPermission("forum.feature"),
  featureQuestion,
);
forumRouter.post(
  "/questions/:id/close",
  authMiddleware,
  requireEmailVerified,
  checkPermission("forum.moderate"),
  closeQuestion,
);
forumRouter.get("/search", searchQuestions);
forumRouter.post("/attachments", authMiddleware, requireEmailVerified, upload.array("files", 5), uploadForumAttachments);
