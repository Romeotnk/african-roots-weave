import type { Response } from "express";
import { env } from "../config/env.js";
import { randomToken } from "./random.js";

const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

export const CSRF_COOKIE_NAME = "csrfToken";
export const CSRF_HEADER_NAME = "x-csrf-token";

export const setRefreshCookie = (res: Response, token: string) => {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: env.nodeEnv === "production" ? "none" : "lax",
    maxAge: sevenDaysMs,
    path: "/api/auth",
  });
};

export const clearRefreshCookie = (res: Response) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: env.nodeEnv === "production" ? "none" : "lax",
    path: "/api/auth",
  });
};

// Double-submit CSRF token for the cookie-based refresh flow: the refresh
// cookie is httpOnly (so JS can't leak it) but must be sameSite:"none" in
// production for cross-origin refresh calls, which alone doesn't stop a
// cross-site request from riding on it. This second cookie is deliberately
// NOT httpOnly so the frontend can read it and echo it back as a header —
// something a cross-site attacker can trigger but never read or replicate.
export const setCsrfCookie = (res: Response) => {
  const csrfToken = randomToken(16);
  res.cookie(CSRF_COOKIE_NAME, csrfToken, {
    httpOnly: false,
    secure: env.nodeEnv === "production",
    sameSite: env.nodeEnv === "production" ? "none" : "lax",
    maxAge: sevenDaysMs,
    path: "/api/auth",
  });
  return csrfToken;
};

export const clearCsrfCookie = (res: Response) => {
  res.clearCookie(CSRF_COOKIE_NAME, {
    httpOnly: false,
    secure: env.nodeEnv === "production",
    sameSite: env.nodeEnv === "production" ? "none" : "lax",
    path: "/api/auth",
  });
};
