import { Role } from "@prisma/client";
import { Router } from "express";
import {
  createArticle,
  createMonograph,
  deleteArticle,
  getArticle,
  getMonograph,
  listArticles,
  listMyArticles,
  listMonographs,
  publishArticle,
  updateArticle,
  updateMonograph,
} from "../controllers/content.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { requireEmailVerified, roleMiddleware } from "../middlewares/role.middleware.js";

export const articleRouter = Router();
export const monographRouter = Router();

// Editorial spaces.
articleRouter.get("/", listArticles);
articleRouter.get("/mine", authMiddleware, listMyArticles);
articleRouter.get("/:slug", getArticle);
articleRouter.post(
  "/",
  authMiddleware,
  requireEmailVerified,
  roleMiddleware([Role.PROFESSIONAL, Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR]),
  createArticle,
);
articleRouter.put("/:id", authMiddleware, requireEmailVerified, updateArticle);
articleRouter.delete("/:id", authMiddleware, requireEmailVerified, deleteArticle);
articleRouter.post(
  "/:id/publish",
  authMiddleware,
  requireEmailVerified,
  roleMiddleware([Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR]),
  publishArticle,
);

// Pharmacopoeia monographs.
monographRouter.get("/", listMonographs);
monographRouter.get("/:id", getMonograph);
monographRouter.post(
  "/",
  authMiddleware,
  requireEmailVerified,
  roleMiddleware([Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR]),
  createMonograph,
);
monographRouter.put(
  "/:id",
  authMiddleware,
  requireEmailVerified,
  roleMiddleware([Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR]),
  updateMonograph,
);
