import type { Conversation } from "@/types";
import { apiRequest } from "@/lib/api/client";

type BackendConversation = {
  id: string;
  participant: {
    id: string;
    name: string;
    role: string;
    avatar: string;
  };
  unreadCount: number;
  messages: {
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
    isRead: boolean;
    createdAt: string;
    attachments?: string[];
  }[];
};

const fallbackAvatar = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=160&q=80&auto=format&fit=crop";

export const listConversations = async () => {
  const response = await apiRequest<BackendConversation[]>("/messages/conversations");
  return (response.data ?? []).map(
    (conversation): Conversation => ({
      id: conversation.id,
      participantName: conversation.participant.name,
      participantRole: conversation.participant.role,
      avatar: conversation.participant.avatar || fallbackAvatar,
      online: false,
      unreadCount: conversation.unreadCount,
      messages: conversation.messages.map((message) => ({
        id: message.id,
        sender: message.senderId === conversation.id ? "them" : "me",
        content: message.content,
        createdAt: message.createdAt,
        read: message.isRead,
        attachment: message.attachments?.[0],
      })),
    }),
  );
};

export const markConversationRead = (participantId: string) =>
  apiRequest<null>(`/messages/conversations/${participantId}/read`, { method: "PUT" });

export const uploadMessageAttachments = async (files: File[]) => {
  const body = new FormData();
  files.forEach((file) => body.append("files", file));
  const response = await apiRequest<{ urls: string[] }>("/messages/attachments", {
    method: "POST",
    body,
  });
  return response.data?.urls ?? [];
};
