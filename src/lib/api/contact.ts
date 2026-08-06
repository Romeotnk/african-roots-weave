import { apiRequest } from "./client";

export type ContactMessagePayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export const sendContactMessage = (payload: ContactMessagePayload) =>
  apiRequest<null>("/contact", { method: "POST", body: payload });
