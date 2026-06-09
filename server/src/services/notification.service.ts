import { prisma } from "../config/db.js";
import { emitNotification } from "./socket.service.js";

export const createNotification = async (input: {
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
}) => {
  const notification = await prisma.notification.create({ data: input });
  emitNotification(input.userId, notification);
  return notification;
};
