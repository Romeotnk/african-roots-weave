const normalizeApiBaseUrl = (value?: string) => {
  if (!value) return "/api";
  const normalized = value.replace(/\/+$/, "");
  return normalized.endsWith("/api") ? normalized : `${normalized}/api`;
};

export const BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_BASE_URL);
