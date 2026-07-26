const normalizeOrigin = (value?: string) => {
  if (!value) return null;

  try {
    return new URL(value).origin;
  } catch {
    return value.replace(/\/+$/, "");
  }
};

const isProduction = process.env.NODE_ENV === "production";

// Shared by both the Express CORS middleware (app.ts) and Socket.io's own
// CORS check (socket.service.ts) — they used to diverge, with sockets only
// ever allowing a single origin while HTTP allowed several.
export const allowedOrigins = [
  process.env.CLIENT_URL,
  ...(isProduction
    ? []
    : [
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
      ]),
]
  .map(normalizeOrigin)
  .filter(Boolean) as string[];

export const isSameHostOrigin = (origin: string, host?: string) => {
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
};
