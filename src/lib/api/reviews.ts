import { apiRequest } from "./client";

export type ReviewTargetType = "PRODUCT" | "PROFESSIONAL" | "FORMATION" | "BUYER";

export type ReceivedReview = {
  id: string;
  targetId: string;
  targetType: ReviewTargetType;
  rating: number;
  comment: string | null;
  isHidden: boolean;
  sellerReply: string | null;
  sellerReplyAt: string | null;
  createdAt: string;
  author: { id: string; firstName: string; lastName: string };
};

export const createReview = (targetId: string, targetType: ReviewTargetType, rating: number, comment?: string) =>
  apiRequest<unknown>("/reviews", {
    method: "POST",
    body: { targetId, targetType, rating, comment },
  });

export const listTargetReviews = async (targetId: string, targetType: ReviewTargetType) => {
  const response = await apiRequest<unknown[]>(`/reviews?targetId=${encodeURIComponent(targetId)}&targetType=${targetType}`);
  return response.data ?? [];
};

export const listMyReceivedReviews = async () => {
  const response = await apiRequest<ReceivedReview[]>("/professionals/me/reviews");
  return response.data ?? [];
};

export const replyToReview = (id: string, content: string) =>
  apiRequest<ReceivedReview>(`/reviews/${id}/reply`, {
    method: "POST",
    body: { content },
  });
