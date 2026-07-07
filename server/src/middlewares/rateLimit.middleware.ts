import rateLimit from "express-rate-limit";

const skipWhenDisabled = () => process.env.DISABLE_RATE_LIMIT === "true";

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
