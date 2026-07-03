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
