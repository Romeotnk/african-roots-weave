import { Router } from "express";
import {
  createArticle,
  createMonograph,
  deleteArticle,
  deleteMonograph,
  getArticle,
  getMonograph,
  listAllMonographsForAdmin,
  listArticles,
  listArticlesForAdmin,
  listMyArticles,
  listMonographs,
  publishArticle,
  updateArticle,
  updateMonograph,
} from "../controllers/content.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { checkPermission, requireEmailVerified } from "../middlewares/role.middleware.js";

export const articleRouter = Router();
export const monographRouter = Router();

// Editorial spaces.
articleRouter.get("/", listArticles);
articleRouter.get("/mine", authMiddleware, listMyArticles);
articleRouter.get(
  "/admin/all",
  authMiddleware,
  requireEmailVerified,
  checkPermission("content.review"),
  listArticlesForAdmin,
);
articleRouter.get("/:slug", getArticle);
articleRouter.post(
  "/",
  authMiddleware,
  requireEmailVerified,
  checkPermission("content.author"),
  createArticle,
);
articleRouter.put("/:id", authMiddleware, requireEmailVerified, updateArticle);
articleRouter.delete("/:id", authMiddleware, requireEmailVerified, deleteArticle);
articleRouter.post(
  "/:id/publish",
  authMiddleware,
  requireEmailVerified,
  checkPermission("content.review"),
  publishArticle,
);

// Pharmacopoeia monographs — exclusivement geres par l'administrateur
// principal per the cahier des charges, unlike the other editorial spaces.
monographRouter.get("/", listMonographs);
monographRouter.get(
  "/admin/all",
  authMiddleware,
  requireEmailVerified,
  checkPermission("content.monographs.manage"),
  listAllMonographsForAdmin,
);
monographRouter.get("/:id", getMonograph);
monographRouter.post(
  "/",
  authMiddleware,
  requireEmailVerified,
  checkPermission("content.monographs.manage"),
  createMonograph,
);
monographRouter.put(
  "/:id",
  authMiddleware,
  requireEmailVerified,
  checkPermission("content.monographs.manage"),
  updateMonograph,
);
monographRouter.delete(
  "/:id",
  authMiddleware,
  requireEmailVerified,
  checkPermission("content.monographs.manage"),
  deleteMonograph,
);
