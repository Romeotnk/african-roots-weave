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

const BACKEND_USER_STORAGE_KEY = "iwosan.user";

export const backendAuthUserStore = {
  get: () => {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(BACKEND_USER_STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      window.localStorage.removeItem(BACKEND_USER_STORAGE_KEY);
      return null;
    }
  },
  set: (user: AuthUser | null) => {
    if (typeof window === "undefined") return;
    if (user) {
      window.localStorage.setItem(BACKEND_USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(BACKEND_USER_STORAGE_KEY);
    }
    window.dispatchEvent(new Event("iwosan.auth.changed"));
  },
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
    backendAuthUserStore.set(response.data.user);
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
    backendAuthUserStore.set(null);
  }
};
