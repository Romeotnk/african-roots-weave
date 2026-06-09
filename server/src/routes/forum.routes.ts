import { Role } from '@prisma/client';
import { Router } from 'express';
import {
  acceptAnswer,
  closeQuestion,
  createAnswer,
  createComment,
  createQuestion,
  featureQuestion,
  getQuestion,
  listQuestions,
  report,
  searchQuestions,
  updateAnswer,
  updateQuestion,
  vote,
} from '../controllers/forum.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { roleMiddleware } from '../middlewares/role.middleware.js';

export const forumRouter = Router();

// Questions and answers.
forumRouter.get('/questions', listQuestions);
forumRouter.get('/questions/:id', getQuestion);
forumRouter.post('/questions', authMiddleware, createQuestion);
forumRouter.put('/questions/:id', authMiddleware, updateQuestion);
forumRouter.post('/questions/:id/answers', authMiddleware, createAnswer);
forumRouter.put('/answers/:id', authMiddleware, updateAnswer);
forumRouter.post('/answers/:id/accept', authMiddleware, acceptAnswer);

// Discussion moderation.
forumRouter.post('/comments', authMiddleware, createComment);
forumRouter.post('/vote', authMiddleware, vote);
forumRouter.post('/report', authMiddleware, report);
forumRouter.post('/questions/:id/feature', authMiddleware, roleMiddleware([Role.ADMIN]), featureQuestion);
forumRouter.post('/questions/:id/close', authMiddleware, roleMiddleware([Role.MODERATOR, Role.ADMIN]), closeQuestion);
forumRouter.get('/search', searchQuestions);
