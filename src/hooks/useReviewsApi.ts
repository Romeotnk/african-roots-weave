import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createReview, listMyReceivedReviews, listTargetReviews, replyToReview, type ReviewTargetType } from "@/lib/api/reviews";

const hasAccessToken = () => typeof window !== "undefined" && Boolean(window.localStorage.getItem("iwosan.accessToken"));

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

export function useMyReceivedReviews() {
  return useQuery({
    queryKey: ["reviews", "received", "mine"] as const,
    queryFn: listMyReceivedReviews,
    enabled: hasAccessToken(),
    retry: false,
  });
}

export function useReplyToReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) => replyToReview(id, content),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reviews", "received", "mine"] }),
  });
}
