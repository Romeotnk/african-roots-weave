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

const authRateLimitMessage = {
  success: false,
  data: null,
  message: "Too many authentication attempts, please try again later",
};

// Separate limiter instances (not just separate limit values) so each has its
// own store: without this, a burst of failed logins for an IP also exhausts
// that same IP's budget on unrelated flows like password reset, locking a
// legitimate user out of the one path meant to recover their account.
export const loginRateLimit = rateLimit({
  skip: skipWhenDisabled,
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: authRateLimitMessage,
});

export const registerRateLimit = rateLimit({
  skip: skipWhenDisabled,
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: authRateLimitMessage,
});

export const passwordResetRateLimit = rateLimit({
  skip: skipWhenDisabled,
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: authRateLimitMessage,
});

// The public contact form has no auth to key off of and sends an outbound
// email per submission — a dedicated, tighter budget keeps it from becoming
// a free email-spam relay without affecting the generic global limit.
export const contactFormRateLimit = rateLimit({
  skip: skipWhenDisabled,
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    data: null,
    message: "Too many messages sent, please try again later",
  },
});

// Payment, wallet and KYC endpoints move money or submit identity documents —
// worth a tighter, dedicated budget instead of relying on the generic global
// rate limit that covers every other read-mostly endpoint in the API.
export const sensitiveActionRateLimit = rateLimit({
  skip: skipWhenDisabled,
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    data: null,
    message: "Too many requests on a sensitive action, please try again later",
  },
});
