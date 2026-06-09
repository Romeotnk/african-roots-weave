import { env } from "../config/env.js";

type TurnstileResponse = {
  success: boolean;
  "error-codes"?: string[];
};

export const verifyTurnstile = async (token?: string, remoteIp?: string) => {
  if (!env.turnstileSecretKey) {
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
