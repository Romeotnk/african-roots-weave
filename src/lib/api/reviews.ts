import { apiRequest } from "./client";

export type ReviewTargetType = "PRODUCT" | "PROFESSIONAL" | "FORMATION";

export const createReview = (targetId: string, targetType: ReviewTargetType, rating: number, comment?: string) =>
  apiRequest<unknown>("/reviews", {
    method: "POST",
    body: { targetId, targetType, rating, comment },
  });

export const listTargetReviews = async (targetId: string, targetType: ReviewTargetType) => {
  const response = await apiRequest<unknown[]>(`/reviews?targetId=${encodeURIComponent(targetId)}&targetType=${targetType}`);
  return response.data ?? [];
};
