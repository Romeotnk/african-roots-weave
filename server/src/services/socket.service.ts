import type { Server as HttpServer } from 'node:http';
import { Server } from 'socket.io';
import { prisma } from '../config/db.js';
import { env } from '../config/env.js';
import { redis } from '../config/redis.js';
import { verifyAccessToken } from '../utils/tokens.js';

let io: Server | null = null;

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: env.clientUrl,
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    let userId: string | null = null;

    socket.on('authenticate', async (token: string, ack?: (payload: unknown) => void) => {
      try {
        const payload = verifyAccessToken(token);
        const user = await prisma.user.findUnique({
          where: { id: payload.sub },
          select: { id: true, isActive: true, isBanned: true },
        });

        if (!user || !user.isActive || user.isBanned) {
          ack?.({ success: false, message: 'Account unavailable' });
          return;
        }

        userId = user.id;
        socket.join(user.id);
        if (redis) await redis.set(`presence:${user.id}`, 'online', 'EX', 60 * 5);
        socket.broadcast.emit('user:status', { userId: user.id, isOnline: true, lastSeen: null });
        ack?.({ success: true, userId: user.id });
      } catch {
        ack?.({ success: false, message: 'Invalid token' });
      }
    });

    socket.on('message:send', async (payload: { receiverId: string; content: string; attachments?: string[] }, ack?: (data: unknown) => void) => {
      if (!userId) {
        ack?.({ success: false, message: 'Socket not authenticated' });
        return;
      }

      const message = await prisma.message.create({
        data: {
          senderId: userId,
          receiverId: payload.receiverId,
          content: payload.content,
          attachments: payload.attachments ?? [],
        },
        include: { sender: { select: { id: true, firstName: true, lastName: true } } },
      });

      io?.to(payload.receiverId).emit('message:received', message);
      await prisma.notification.create({
        data: {
          userId: payload.receiverId,
          type: 'NEW_MESSAGE',
          title: 'Nouveau message',
          message: 'Vous avez recu un nouveau message.',
          link: `/messages/${userId}`,
        },
      });
      ack?.({ success: true, data: message });
    });

    socket.on('message:read', async (messageId: string) => {
      if (!userId) return;
      const message = await prisma.message.update({
        where: { id: messageId, receiverId: userId },
        data: { isRead: true },
      });
      io?.to(message.senderId).emit('message:read', { messageId });
    });

    socket.on('typing:start', (payload: { receiverId: string }) => {
      if (userId) io?.to(payload.receiverId).emit('typing:start', { userId });
    });

    socket.on('typing:stop', (payload: { receiverId: string }) => {
      if (userId) io?.to(payload.receiverId).emit('typing:stop', { userId });
    });

    socket.on('disconnect', async () => {
      if (!userId) return;
      const lastSeen = new Date().toISOString();
      if (redis) await redis.set(`presence:${userId}:lastSeen`, lastSeen, 'EX', 60 * 60 * 24 * 30);
      if (redis) await redis.del(`presence:${userId}`);
      socket.broadcast.emit('user:status', { userId, isOnline: false, lastSeen });
    });
  });

  return io;
};

export const emitNotification = (userId: string, notification: unknown) => {
  io?.to(userId).emit('notification:new', notification);
};
