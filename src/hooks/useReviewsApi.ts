import { useMutation, useQuery } from "@tanstack/react-query";
import { createReview, listTargetReviews, type ReviewTargetType } from "@/lib/api/reviews";

export function useTargetReviews(targetId: string, targetType: ReviewTargetType, enabled = true) {
  return useQuery({
    queryKey: ["reviews", targetType, targetId] as const,
    queryFn: () => listTargetReviews(targetId, targetType),
    enabled: Boolean(targetId) && enabled,
    retry: false,
  });
}

export function useCreateReview() {
  return useMutation({
    mutationFn: ({ targetId, targetType, rating, comment }: { targetId: string; targetType: ReviewTargetType; rating: number; comment?: string }) =>
      createReview(targetId, targetType, rating, comment),
  });
}
