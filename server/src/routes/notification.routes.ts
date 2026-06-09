import { Router } from 'express';
import {
  deleteNotification,
  listNotifications,
  readAllNotifications,
  readNotification,
  subscribeNewsletter,
  unsubscribeNewsletter,
} from '../controllers/notification.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

export const notificationRouter = Router();
export const newsletterRouter = Router();

notificationRouter.use(authMiddleware);
notificationRouter.get('/', listNotifications);
notificationRouter.put('/read-all', readAllNotifications);
notificationRouter.put('/:id/read', readNotification);
notificationRouter.delete('/:id', deleteNotification);

newsletterRouter.post('/subscribe', subscribeNewsletter);
newsletterRouter.post('/unsubscribe/:token', unsubscribeNewsletter);
