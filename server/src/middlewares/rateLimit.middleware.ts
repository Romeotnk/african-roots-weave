import rateLimit from "express-rate-limit";
import { isTrustedDevEnvironment } from "../config/env.js";

// DISABLE_RATE_LIMIT is a local-development convenience only: it is ignored
// outside development/test so a stray env var can never disable rate
// limiting on a real deployment.
const skipWhenDisabled = () => isTrustedDevEnvironment() && process.env.DISABLE_RATE_LIMIT === "true";

export const globalRateLimit = rateLimit({
  skip: skipWhenDisabled,
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    data: null,
    message: "Too many requests, please try again later",
  },
});

export const authRateLimit = rateLimit({
  skip: skipWhenDisabled,
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    data: null,
    message: "Too many authentication attempts, please try again later",
  },
});
