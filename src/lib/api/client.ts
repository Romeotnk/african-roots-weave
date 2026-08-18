import { BASE_URL } from "@/config/api";
import i18n from "@/lib/i18n";

const API_BASE_URL = BASE_URL;

type ApiEnvelope<T> = {
  success: boolean;
  data: T | null;
  message: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  skipAuthRetry?: boolean;
};

let accessToken = typeof window !== "undefined" ? window.localStorage.getItem("iwosan.accessToken") : null;

const translateApiMessage = (message: string) => {
  const normalized = message.trim();
  const lower = normalized.toLowerCase();

  if (lower.includes("invalid credentials")) return i18n.t("apiClient.invalidCredentials");
  if (lower.includes("email already registered") || lower.includes("user already registered")) return i18n.t("apiClient.emailAlreadyUsed");
  if (lower.includes("valid email required")) return i18n.t("apiClient.invalidEmail");
  if (lower.includes("password required")) return i18n.t("apiClient.passwordRequired");
  if (lower.includes("current password required")) return i18n.t("apiClient.currentPasswordRequired");
  if (lower.includes("current password is invalid")) return i18n.t("apiClient.currentPasswordInvalid");
  if (lower.includes("password must be at least 8 characters")) return i18n.t("apiClient.passwordMinLength");
  if (lower.includes("password must include an uppercase letter")) return i18n.t("apiClient.passwordUppercase");
  if (lower.includes("password must include a lowercase letter")) return i18n.t("apiClient.passwordLowercase");
  if (lower.includes("password must include a number")) return i18n.t("apiClient.passwordNumber");
  if (lower.includes("password must include a special character")) return i18n.t("apiClient.passwordSpecialChar");
  if (lower.includes("too many authentication attempts")) return i18n.t("apiClient.tooManyAuthAttempts");
  if (lower.includes("too many requests")) return i18n.t("apiClient.tooManyRequests");
  if (lower.includes("turnstile verification failed")) return i18n.t("apiClient.turnstileFailed");
  if (lower.includes("authentication required")) return i18n.t("apiClient.authRequired");
  if (lower.includes("invalid or expired token")) return i18n.t("apiClient.sessionExpired");
  if (lower.includes("invalid or expired reset token")) return i18n.t("apiClient.resetLinkInvalid");
  if (lower.includes("invalid or expired verification token")) return i18n.t("apiClient.verificationLinkInvalid");
  if (lower.includes("account unavailable")) return i18n.t("apiClient.accountUnavailable");
  if (lower.includes("email verification required")) return i18n.t("apiClient.emailVerificationRequired");
  if (lower.includes("kyc verification required")) return i18n.t("apiClient.kycVerificationRequired");
  if (lower.includes("account created. please verify your email")) return i18n.t("apiClient.accountCreatedVerifyEmail");
  if (lower.includes("email verification is disabled in local development")) return i18n.t("apiClient.accountCreatedLocalDevNoVerification");
  if (lower.includes("login successful")) return i18n.t("apiClient.loginSuccessful");
  if (lower.includes("supabase oauth is not configured")) return i18n.t("apiClient.oauthNotConfigured");
  if (lower.includes("invalid supabase session")) return i18n.t("apiClient.invalidSupabaseSession");
  if (lower.includes("route not found")) return i18n.t("apiClient.routeNotFound");
  if (lower.includes("internal server error")) return i18n.t("apiClient.internalServerError");
  if (lower.includes("gallery limit exceeded")) {
    const max = normalized.match(/maximum (\d+)/)?.[1] ?? "10";
    return i18n.t("apiClient.galleryLimitExceeded", { max });
  }

  return normalized || i18n.t("apiClient.genericApiError");
};

const translateNetworkError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  const lower = message.toLowerCase();

  if (
    lower.includes("load failed") ||
    lower.includes("failed to fetch") ||
    lower.includes("networkerror") ||
    lower.includes("network request failed")
  ) {
    return i18n.t("apiClient.networkUnreachable");
  }

  return translateApiMessage(message);
};
const parseApiEnvelope = async <T>(response: Response): Promise<ApiEnvelope<T>> => {
  const contentType = response.headers.get("content-type") ?? "";
  const text = await response.text();

  if (!text.trim()) {
    return {
      success: false,
      data: null,
      message: response.ok
        ? i18n.t("apiClient.emptyApiResponse")
        : i18n.t("apiClient.apiUnavailableServerDown"),
    };
  }

  if (!contentType.includes("application/json")) {
    return {
      success: false,
      data: null,
      message: response.ok
        ? i18n.t("apiClient.invalidApiResponse")
        : i18n.t("apiClient.apiUnavailableOrWrongRoute"),
    };
  }

  try {
    const payload = JSON.parse(text) as ApiEnvelope<T>;
    return { ...payload, message: translateApiMessage(payload.message) };
  } catch {
    return {
      success: false,
      data: null,
      message: i18n.t("apiClient.invalidJsonResponse"),
    };
  }
};

export const authTokenStore = {
  get: () => accessToken,
  set: (token: string | null) => {
    accessToken = token;
    if (typeof window === "undefined") return;
    if (token) {
      window.localStorage.setItem("iwosan.accessToken", token);
    } else {
      window.localStorage.removeItem("iwosan.accessToken");
    }
  },
};

// The refresh flow's double-submit CSRF token can't be read back from
// document.cookie: in production the API is on a different origin than the
// frontend (that's exactly why the refresh cookie needs sameSite:"none"),
// and cookies are never readable across origins via JS regardless of Path.
// So it travels as a normal field in the login/refresh JSON response instead
// and is cached here, mirroring how the access token itself is handled.
let csrfToken = typeof window !== "undefined" ? window.localStorage.getItem("iwosan.csrfToken") : null;

export const csrfTokenStore = {
  get: () => csrfToken,
  set: (token: string | null) => {
    csrfToken = token;
    if (typeof window === "undefined") return;
    if (token) {
      window.localStorage.setItem("iwosan.csrfToken", token);
    } else {
      window.localStorage.removeItem("iwosan.csrfToken");
    }
  },
};

let refreshInFlight: Promise<string | null> | null = null;

// Concurrent 401s (several requests in flight when the access token expires)
// must share one /auth/refresh call. The refresh token is rotated server-side
// on each use, so firing it once per request would let the first response
// rotate the cookie out from under the others, logging the user out even
// though their session was still valid.
const refreshAccessToken = (): Promise<string | null> => {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: csrfToken ? { "x-csrf-token": csrfToken } : undefined,
      });

      if (!response.ok) {
        authTokenStore.set(null);
        csrfTokenStore.set(null);
        return null;
      }

      const payload = await parseApiEnvelope<{ accessToken: string; csrfToken?: string }>(response);
      const token = payload.data?.accessToken ?? null;
      authTokenStore.set(token);
      if (payload.data?.csrfToken) csrfTokenStore.set(payload.data.csrfToken);
      return token;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<ApiEnvelope<T>> {
  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && options.body !== undefined && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      credentials: "include",
      body: options.body instanceof FormData ? options.body : options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch (error) {
    throw new Error(translateNetworkError(error));
  }

  if (response.status === 401 && !options.skipAuthRetry) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return apiRequest<T>(path, { ...options, skipAuthRetry: true });
    }
  }

  const payload = await parseApiEnvelope<T>(response);

  if (!response.ok || !payload.success) {
    throw new Error(payload.message || i18n.t("apiClient.genericApiError"));
  }

  return payload;
}

export const apiBaseUrl = API_BASE_URL;
