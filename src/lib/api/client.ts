import { BASE_URL } from "@/config/api";

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

  if (lower.includes("invalid credentials")) return "Email ou mot de passe incorrect.";
  if (lower.includes("email already registered")) return "Cette adresse email est déjà utilisée.";
  if (lower.includes("valid email required")) return "Adresse email invalide.";
  if (lower.includes("password required")) return "Le mot de passe est requis.";
  if (lower.includes("password must be at least 8 characters")) return "Le mot de passe doit contenir au moins 8 caractères.";
  if (lower.includes("password must include an uppercase letter")) return "Le mot de passe doit contenir une majuscule.";
  if (lower.includes("password must include a lowercase letter")) return "Le mot de passe doit contenir une minuscule.";
  if (lower.includes("password must include a number")) return "Le mot de passe doit contenir un chiffre.";
  if (lower.includes("password must include a special character")) return "Le mot de passe doit contenir un caractère spécial.";
  if (lower.includes("too many authentication attempts")) return "Trop de tentatives de connexion. Réessayez plus tard.";
  if (lower.includes("too many requests")) return "Trop de requêtes. Réessayez plus tard.";
  if (lower.includes("turnstile verification failed")) return "La vérification anti-robot a échoué.";
  if (lower.includes("authentication required")) return "Vous devez être connecté pour continuer.";
  if (lower.includes("invalid or expired token")) return "Session expirée. Veuillez vous reconnecter.";
  if (lower.includes("invalid or expired reset token")) return "Ce lien de réinitialisation est invalide ou expiré.";
  if (lower.includes("invalid or expired verification token")) return "Ce lien de vérification est invalide ou expiré.";
  if (lower.includes("account unavailable")) return "Ce compte est indisponible.";
  if (lower.includes("email verification required")) return "Vous devez vérifier votre email avant de continuer.";
  if (lower.includes("kyc verification required")) return "Votre vérification KYC doit être validée avant de continuer.";
  if (lower.includes("route not found")) return "Route API introuvable.";
  if (lower.includes("internal server error")) return "Erreur serveur. Réessayez dans un instant.";

  return normalized || "Erreur API Iwosan";
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
    return "Impossible de joindre le serveur. Verifiez votre connexion ou reessayez dans un instant.";
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
        ? "Réponse API vide."
        : "API indisponible. Vérifiez que le serveur backend est lancé.",
    };
  }

  if (!contentType.includes("application/json")) {
    return {
      success: false,
      data: null,
      message: response.ok
        ? "Réponse API invalide."
        : "API indisponible ou mauvaise route API.",
    };
  }

  try {
    const payload = JSON.parse(text) as ApiEnvelope<T>;
    return { ...payload, message: translateApiMessage(payload.message) };
  } catch {
    return {
      success: false,
      data: null,
      message: "Réponse API JSON invalide.",
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

const refreshAccessToken = async () => {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    authTokenStore.set(null);
    return null;
  }

  const payload = await parseApiEnvelope<{ accessToken: string }>(response);
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
    throw new Error(payload.message || "Erreur API Iwosan");
  }

  return payload;
}

export const apiBaseUrl = API_BASE_URL;
