import { Role } from '@prisma/client';
import { Router } from 'express';
import {
  createArticle,
  createMonograph,
  deleteArticle,
  getArticle,
  getMonograph,
  listArticles,
  listMonographs,
  publishArticle,
  updateArticle,
  updateMonograph,
} from '../controllers/content.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { roleMiddleware } from '../middlewares/role.middleware.js';

export const articleRouter = Router();
export const monographRouter = Router();

// Editorial spaces.
articleRouter.get('/', listArticles);
articleRouter.get('/:slug', getArticle);
articleRouter.post('/', authMiddleware, roleMiddleware([Role.PROFESSIONAL, Role.ADMIN]), createArticle);
articleRouter.put('/:id', authMiddleware, updateArticle);
articleRouter.delete('/:id', authMiddleware, deleteArticle);
articleRouter.post('/:id/publish', authMiddleware, roleMiddleware([Role.ADMIN]), publishArticle);

// Pharmacopoeia monographs.
monographRouter.get('/', listMonographs);
monographRouter.get('/:id', getMonograph);
monographRouter.post('/', authMiddleware, roleMiddleware([Role.ADMIN]), createMonograph);
monographRouter.put('/:id', authMiddleware, roleMiddleware([Role.ADMIN]), updateMonograph);
