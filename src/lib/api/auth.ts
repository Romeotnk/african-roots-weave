import { apiRequest, authTokenStore } from "./client";

export type AuthUser = {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  language: string;
  kycStatus: string;
};

export type RegisterPayload = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  country: string;
  role?: "USER" | "PROFESSIONAL" | "RESEARCHER";
  language?: "fr" | "en" | "ar";
  referralCode?: string;
  turnstileToken?: string;
};

export const login = async (email: string, password: string) => {
  const response = await apiRequest<{ accessToken: string; user: AuthUser }>("/auth/login", {
    method: "POST",
    body: { email, password },
  });

  if (response.data?.accessToken) {
    authTokenStore.set(response.data.accessToken);
  }

  return response;
};

export const register = async (payload: RegisterPayload) =>
  apiRequest<{ user: AuthUser }>("/auth/register", {
    method: "POST",
    body: payload,
  });

export const verifyEmail = async (token: string) =>
  apiRequest<null>(`/auth/verify-email/${token}`, {
    method: "POST",
  });

export const forgotPassword = async (email: string) =>
  apiRequest<null>("/auth/forgot-password", {
    method: "POST",
    body: { email },
  });

export const resetPassword = async (token: string, password: string) =>
  apiRequest<null>(`/auth/reset-password/${token}`, {
    method: "POST",
    body: { password },
  });

export const logout = async () => {
  try {
    await apiRequest<null>("/auth/logout", { method: "POST" });
  } finally {
    authTokenStore.set(null);
  }
};
