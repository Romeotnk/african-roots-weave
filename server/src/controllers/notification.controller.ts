import { prisma } from "../config/db.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/errors.js";

export const listNotifications = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user.id },
    orderBy: [{ isRead: "asc" }, { createdAt: "desc" }],
    take: 100,
  });
  res.json(apiResponse(true, notifications, "Notifications retrieved"));
});

export const readNotification = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const isRead = typeof req.body?.read === "boolean" ? req.body.read : true;
  const notification = await prisma.notification.update({
    where: { id: req.params.id, userId: req.user.id },
    data: { isRead },
  });
  res.json(apiResponse(true, notification, isRead ? "Notification marked as read" : "Notification marked as unread"));
});

export const readAllNotifications = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  await prisma.notification.updateMany({
    where: { userId: req.user.id, isRead: false },
    data: { isRead: true },
  });
  res.json(apiResponse(true, null, "Notifications marked as read"));
});

export const deleteNotification = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  await prisma.notification.delete({ where: { id: req.params.id, userId: req.user.id } });
  res.json(apiResponse(true, null, "Notification deleted"));
});

export const subscribeNewsletter = asyncHandler(async (req, res) => {
  const subscriber = await prisma.newsletterSubscriber.upsert({
    where: { email: req.body.email },
    update: { isActive: true, language: req.body.language ?? "fr", unsubscribedAt: null },
    create: {
      email: req.body.email,
      language: req.body.language ?? "fr",
      unsubscribeToken: crypto.randomUUID(),
    },
  });
  res.status(201).json(apiResponse(true, subscriber, "Newsletter subscription saved"));
});

export const unsubscribeNewsletter = asyncHandler(async (req, res) => {
  const subscriber = await prisma.newsletterSubscriber.findUnique({ where: { unsubscribeToken: req.params.token } });
  if (!subscriber) throw new ApiError(404, "Lien de désabonnement invalide ou déjà utilisé");

  await prisma.newsletterSubscriber.update({
    where: { unsubscribeToken: req.params.token },
    data: { isActive: false, unsubscribedAt: new Date() },
  });
  res.json(apiResponse(true, null, "Newsletter unsubscribed"));
});
