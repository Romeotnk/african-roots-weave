import { apiRequest } from "./client";

export type NewsletterSubscriptionPayload = {
  email: string;
  language?: "fr" | "en" | "ar";
};

export const subscribeNewsletter = (payload: NewsletterSubscriptionPayload) =>
  apiRequest<unknown>("/newsletter/subscribe", {
    method: "POST",
    body: payload,
  });

export const unsubscribeNewsletter = (token: string) =>
  apiRequest<unknown>(`/newsletter/unsubscribe/${token}`, { method: "POST" });
