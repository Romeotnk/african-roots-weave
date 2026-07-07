import { Prisma } from "@prisma/client";
import { prisma } from "../config/db.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/errors.js";

const participantSelect = {
  id: true,
  firstName: true,
  lastName: true,
  avatarUrl: true,
  role: true,
  professionalProfile: {
    select: {
      displayName: true,
      photos: true,
      specialty: true,
    },
  },
} satisfies Prisma.UserSelect;

const toParticipant = (user: {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  role: string;
  professionalProfile?: {
    displayName: string;
    photos: string[];
    specialty: string[];
  } | null;
}) => ({
  id: user.id,
  name:
    user.professionalProfile?.displayName ||
    `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
    "Utilisateur Iwosan",
  role: user.professionalProfile?.specialty?.[0] || user.role,
  avatar: user.avatarUrl || user.professionalProfile?.photos?.[0] || "",
});

export const listConversations = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");

  const messages = await prisma.message.findMany({
    where: {
      OR: [{ senderId: req.user.id }, { receiverId: req.user.id }],
    },
    orderBy: { createdAt: "asc" },
    take: 500,
    include: {
      sender: { select: participantSelect },
      receiver: { select: participantSelect },
    },
  });

  const grouped = new Map<string, (typeof messages)[number][]>();
  for (const message of messages) {
    const participantId = message.senderId === req.user.id ? message.receiverId : message.senderId;
    grouped.set(participantId, [...(grouped.get(participantId) ?? []), message]);
  }

  const conversations = [...grouped.entries()]
    .map(([participantId, thread]) => {
      const lastMessage = thread[thread.length - 1];
      const participant = lastMessage.senderId === req.user!.id ? lastMessage.receiver : lastMessage.sender;
      return {
        id: participantId,
        participant: toParticipant(participant),
        unreadCount: thread.filter((message) => message.receiverId === req.user!.id && !message.isRead).length,
        lastMessageAt: lastMessage.createdAt,
        messages: thread.map((message) => ({
          id: message.id,
          senderId: message.senderId,
          receiverId: message.receiverId,
          content: message.content,
          attachments: message.attachments,
          isRead: message.isRead,
          createdAt: message.createdAt,
        })),
      };
    })
    .sort((left, right) => new Date(right.lastMessageAt).getTime() - new Date(left.lastMessageAt).getTime());

  res.json(apiResponse(true, conversations, "Conversations retrieved"));
});

export const markConversationRead = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  await prisma.message.updateMany({
    where: {
      senderId: req.params.participantId,
      receiverId: req.user.id,
      isRead: false,
    },
    data: { isRead: true },
  });
  res.json(apiResponse(true, null, "Conversation marked as read"));
});
