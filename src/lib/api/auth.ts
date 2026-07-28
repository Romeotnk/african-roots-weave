import { apiRequest, authTokenStore, csrfTokenStore } from "./client";

export type AuthUser = {
  id: string;
  email: string;
  role: string;
  adminSubRole?: string | null;
  isResearcher?: boolean;
  isEmailVerified?: boolean;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  country?: string;
  language: string;
  kycStatus: string;
  isActive?: boolean;
  isBanned?: boolean;
  lastLoginAt?: string;
  createdAt?: string;
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
  role?: "USER" | "PROFESSIONAL";
  language?: "fr" | "en" | "ar";
  referralCode?: string;
  turnstileToken?: string;
};

export const login = async (email: string, password: string) => {
  const response = await apiRequest<{ accessToken: string; user: AuthUser; csrfToken?: string }>("/auth/login", {
    method: "POST",
    body: { email, password },
  });

  if (response.data?.accessToken) {
    authTokenStore.set(response.data.accessToken);
    backendAuthUserStore.set(response.data.user);
    csrfTokenStore.set(response.data.csrfToken ?? null);
  }

  return response;
};

export const register = async (payload: RegisterPayload) =>
  apiRequest<{ user: AuthUser }>("/auth/register", {
    method: "POST",
    body: payload,
  });


export const loginWithSupabaseAccessToken = async (accessToken: string) => {
  const response = await apiRequest<{ accessToken: string; user: AuthUser; csrfToken?: string }>("/auth/supabase", {
    method: "POST",
    body: { accessToken },
    skipAuthRetry: true,
  });

  if (response.data?.accessToken) {
    authTokenStore.set(response.data.accessToken);
    backendAuthUserStore.set(response.data.user);
    csrfTokenStore.set(response.data.csrfToken ?? null);
  }

  return response;
};
export const verifyEmail = async (token: string) =>
  apiRequest<null>(`/auth/verify-email/${token}`, {
    method: "POST",
  });

export const forgotPassword = async (email: string) =>
  apiRequest<null>("/auth/forgot-password", {
    method: "POST",
    body: { email },
  });

export const resendVerificationEmail = async (email: string) =>
  apiRequest<null>("/auth/resend-verification", {
    method: "POST",
    body: { email },
  });

export const resetPassword = async (token: string, password: string) =>
  apiRequest<null>(`/auth/reset-password/${token}`, {
    method: "POST",
    body: { password },
  });

export const getMe = async () => apiRequest<AuthUser>("/auth/me");

export type UpdateMePayload = Partial<Pick<AuthUser, "firstName" | "lastName" | "country" | "language" | "avatarUrl">>;

export const updateMe = async (payload: UpdateMePayload) => {
  const response = await apiRequest<AuthUser>("/auth/me", {
    method: "PATCH",
    body: payload,
  });
  if (response.data) {
    backendAuthUserStore.set(response.data);
  }
  return response;
};

export type SubmitKycPayload = {
  docType: string;
  country: string;
  documentNumber: string;
  expiresAt?: string;
  files: {
    front: File;
    back?: File;
    selfie: File;
  };
};

export const submitKyc = async (payload: SubmitKycPayload) => {
  const body = new FormData();
  body.append("docType", payload.docType);
  body.append("country", payload.country);
  body.append("documentNumber", payload.documentNumber);
  if (payload.expiresAt) body.append("expiresAt", payload.expiresAt);
  body.append("front", payload.files.front);
  if (payload.files.back) body.append("back", payload.files.back);
  body.append("selfie", payload.files.selfie);

  const response = await apiRequest<AuthUser>("/auth/kyc", {
    method: "POST",
    body,
  });
  if (response.data) {
    backendAuthUserStore.set(response.data);
  }
  return response;
};

export const changePassword = async (currentPassword: string, password: string) =>
  apiRequest<null>("/auth/change-password", {
    method: "POST",
    body: { currentPassword, password },
  });

export const logout = async () => {
  try {
    await apiRequest<null>("/auth/logout", { method: "POST" });
  } finally {
    authTokenStore.set(null);
    backendAuthUserStore.set(null);
    csrfTokenStore.set(null);
  }
};
