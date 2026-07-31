import type { Server as HttpServer } from "node:http";
import { Server, type Socket } from "socket.io";
import { prisma } from "../config/db.js";
import { allowedOrigins } from "../config/corsOrigins.js";
import { redisDel, redisSet } from "../config/redis.js";
import { verifyAccessToken } from "../utils/tokens.js";

let io: Server | null = null;

const MAX_MESSAGE_LENGTH = 4000;

/** Strips HTML tags: chat content is stored and rendered as plain text. */
const stripHtml = (value: string) => value.replace(/<[^>]*>/g, "");

const REDACTION_PLACEHOLDER = "[coordonnees masquees]";
const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const CONTACT_LINK_PATTERN =
  /\b(?:https?:\/\/)?(?:www\.)?(?:wa\.me|t\.me|api\.whatsapp\.com|chat\.whatsapp\.com|instagram\.com|facebook\.com|m\.me)\/\S+/gi;
const PHONE_CANDIDATE_PATTERN = /(?:\+\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?){2,6}\d{2,4}/g;

/**
 * Marketplace buyers/sellers must transact through the platform (escrow,
 * commission) — letting them swap phone numbers/emails/social links in chat
 * is a direct path to circumventing that. Redact rather than block outright
 * so a conversation can continue with the rest of the message intact.
 */
const redactContactInfo = (value: string) => {
  let redacted = false;
  let text = value.replace(EMAIL_PATTERN, () => {
    redacted = true;
    return REDACTION_PLACEHOLDER;
  });
  text = text.replace(CONTACT_LINK_PATTERN, () => {
    redacted = true;
    return REDACTION_PLACEHOLDER;
  });
  text = text.replace(PHONE_CANDIDATE_PATTERN, (match) => {
    const digits = match.replace(/\D/g, "");
    if (digits.length >= 7 && digits.length <= 15) {
      redacted = true;
      return REDACTION_PLACEHOLDER;
    }
    return match;
  });
  return { text, redacted };
};

const sanitizeMessageContent = (content: unknown) => {
  if (typeof content !== "string") return null;
  const cleaned = stripHtml(content).trim().slice(0, MAX_MESSAGE_LENGTH);
  if (cleaned.length === 0) return null;
  const { text, redacted } = redactContactInfo(cleaned);
  return { text, redacted };
};

type AuthenticatedSocket = Socket & { data: { userId: string } };

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });

  // Reject the connection itself if the JWT is missing/invalid — no socket
  // is ever accepted in an unauthenticated state.
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token as string | undefined;
      if (!token) {
        next(new Error("Authentication required"));
        return;
      }

      const payload = verifyAccessToken(token);
      const user = await prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, isActive: true, isBanned: true },
      });

      if (!user || !user.isActive || user.isBanned) {
        next(new Error("Account unavailable"));
        return;
      }

      socket.data.userId = user.id;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (rawSocket) => {
    const socket = rawSocket as AuthenticatedSocket;
    const userId = socket.data.userId;

    socket.join(userId);
    redisSet(`presence:${userId}`, "online", "EX", 60 * 5).catch((error) =>
      console.error("[socket] presence set failed:", error),
    );
    socket.broadcast.emit("user:status", { userId, isOnline: true, lastSeen: null });

    socket.on(
      "message:send",
      async (
        payload: { receiverId?: string; content?: string; attachments?: string[] },
        ack?: (data: unknown) => void,
      ) => {
        try {
          const receiverId = typeof payload?.receiverId === "string" ? payload.receiverId : null;
          const sanitized = sanitizeMessageContent(payload?.content);

          if (!receiverId || receiverId === userId || !sanitized) {
            ack?.({ success: false, message: "Invalid message payload" });
            return;
          }

          const receiver = await prisma.user.findUnique({
            where: { id: receiverId },
            select: { id: true },
          });
          if (!receiver) {
            ack?.({ success: false, message: "Recipient not found" });
            return;
          }

          const attachments = Array.isArray(payload?.attachments)
            ? payload.attachments.filter((url): url is string => typeof url === "string").slice(0, 10)
            : [];

          const message = await prisma.message.create({
            data: { senderId: userId, receiverId, content: sanitized.text, attachments },
            include: { sender: { select: { id: true, firstName: true, lastName: true } } },
          });

          io?.to(receiverId).emit("message:received", message);
          const notification = await prisma.notification.create({
            data: {
              userId: receiverId,
              type: "NEW_MESSAGE",
              title: "Nouveau message",
              message: "Vous avez recu un nouveau message.",
              link: `/messages/${userId}`,
            },
          });
          io?.to(receiverId).emit("notification:new", notification);
          ack?.({ success: true, data: message, contactInfoRedacted: sanitized.redacted });
        } catch (error) {
          console.error("[socket] message:send failed:", error);
          ack?.({ success: false, message: "Message could not be sent" });
        }
      },
    );

    socket.on("message:read", async (messageId: string, ack?: (data: unknown) => void) => {
      try {
        if (typeof messageId !== "string") {
          ack?.({ success: false });
          return;
        }
        const message = await prisma.message.update({
          where: { id: messageId, receiverId: userId },
          data: { isRead: true },
        });
        io?.to(message.senderId).emit("message:read", { messageId });
        ack?.({ success: true });
      } catch (error) {
        console.error("[socket] message:read failed:", error);
        ack?.({ success: false });
      }
    });

    socket.on("typing:start", (payload: { receiverId?: string }) => {
      if (typeof payload?.receiverId === "string") io?.to(payload.receiverId).emit("typing:start", { userId });
    });

    socket.on("typing:stop", (payload: { receiverId?: string }) => {
      if (typeof payload?.receiverId === "string") io?.to(payload.receiverId).emit("typing:stop", { userId });
    });

    socket.on("disconnect", async () => {
      try {
        const lastSeen = new Date().toISOString();
        await redisSet(`presence:${userId}:lastSeen`, lastSeen, "EX", 60 * 60 * 24 * 30);
        await redisDel(`presence:${userId}`);
        socket.broadcast.emit("user:status", { userId, isOnline: false, lastSeen });
      } catch (error) {
        console.error("[socket] disconnect cleanup failed:", error);
      }
    });
  });

  return io;
};

export const emitNotification = (userId: string, notification: unknown) => {
  io?.to(userId).emit("notification:new", notification);
};
