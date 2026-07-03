import { useMutation } from "@tanstack/react-query";
import { subscribeNewsletter, type NewsletterSubscriptionPayload } from "@/lib/api/newsletter";

export function useNewsletterSubscription() {
  return useMutation({
    mutationFn: (payload: NewsletterSubscriptionPayload) => subscribeNewsletter(payload),
  });
}
