import { Redis } from "ioredis";
import { env } from "./env.js";

export const redis = env.redisUrl
  ? new Redis(env.redisUrl, {
      maxRetriesPerRequest: 2,
      lazyConnect: true,
    })
  : null;

export const connectRedis = async () => {
  if (!redis || redis.status === "ready") {
    return;
  }

  try {
    await redis.connect();
  } catch (error) {
    console.warn("Redis unavailable, continuing without cache-backed features.", error);
  }
};
