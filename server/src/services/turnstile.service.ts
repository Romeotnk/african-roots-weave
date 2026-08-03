import { env } from "../config/env.js";

type TurnstileResponse = {
  success: boolean;
  "error-codes"?: string[];
};

export const verifyTurnstile = async (token?: string, remoteIp?: string) => {
  // Read NODE_ENV live rather than via the cached `env` object: this guards
  // the automated test suite, whose setup runs after env.ts's module-level
  // snapshot is taken, so a mutation there wouldn't be reflected in `env`.
  if (process.env.NODE_ENV === "test" || !env.turnstileSecretKey) {
    return true;
  }

  if (!token) {
    return false;
  }

  const params = new URLSearchParams({
    secret: env.turnstileSecretKey,
    response: token,
  });

  if (remoteIp) {
    params.set("remoteip", remoteIp);
  }

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: params,
  });
  const data = (await response.json()) as TurnstileResponse;
  return data.success;
};
