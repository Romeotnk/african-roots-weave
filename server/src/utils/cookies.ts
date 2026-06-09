import type { Response } from "express";
import { env } from "../config/env.js";

const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

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
