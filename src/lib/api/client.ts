const normalizeApiBaseUrl = (value?: string) => {
  if (!value) {
    return "/api";
  }

  const normalized = value.replace(/\/+$/, "");
  return normalized.endsWith("/api") ? normalized : `${normalized}/api`;
};

const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL);

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

const refreshAccessToken = async () => {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    authTokenStore.set(null);
    return null;
  }

  const payload = (await response.json()) as ApiEnvelope<{ accessToken: string }>;
  const token = payload.data?.accessToken ?? null;
  authTokenStore.set(token);
  return token;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<ApiEnvelope<T>> {
  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && options.body !== undefined && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
    body: options.body instanceof FormData ? options.body : options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (response.status === 401 && !options.skipAuthRetry) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return apiRequest<T>(path, { ...options, skipAuthRetry: true });
    }
  }

  const payload = (await response.json()) as ApiEnvelope<T>;

  if (!response.ok || !payload.success) {
    throw new Error(payload.message || "Erreur API Iwosan");
  }

  return payload;
}

export const apiBaseUrl = API_BASE_URL;
