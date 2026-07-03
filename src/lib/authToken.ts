import { authTokenStore } from "@/lib/api/client";

export type AccessTokenClaims = {
  sub?: string;
  role?: string;
  email?: string;
  language?: string;
  kycStatus?: string;
  exp?: number;
};

const decodeBase64Url = (value: string) => {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  return atob(padded);
};

export function getAccessTokenClaims(): AccessTokenClaims | null {
  const token = authTokenStore.get();
  if (!token || typeof window === "undefined") return null;

  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    return JSON.parse(decodeBase64Url(payload)) as AccessTokenClaims;
  } catch {
    return null;
  }
}

export function isAdminToken() {
  return getAccessTokenClaims()?.role === "ADMIN";
}
