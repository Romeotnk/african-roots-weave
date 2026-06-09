import { Redis } from "ioredis";
import { env } from "./env.js";

let redisUnavailable = false;

export const redisClient = env.redisUrl
  ? new Redis(env.redisUrl, {
      maxRetriesPerRequest: 1,
      lazyConnect: true,
      enableOfflineQueue: false,
      retryStrategy: (times) => {
        if (times > 2) {
          redisUnavailable = true;
          return null;
        }

        return Math.min(times * 250, 1000);
      },
    })
  : null;

redisClient?.on("error", (error) => {
  redisUnavailable = true;
  console.warn("Redis unavailable, continuing without cache-backed features.", error.message);
});

export const connectRedis = async () => {
  if (!redisClient || redisClient.status === "ready" || redisUnavailable) {
    return;
  }

  try {
    await redisClient.connect();
  } catch (error) {
    redisUnavailable = true;
    console.warn(
      "Redis unavailable, continuing without cache-backed features.",
      error instanceof Error ? error.message : error,
    );
  }
};

export const redisGet = async (key: string) => {
  if (!redisClient || redisUnavailable) {
    return null;
  }

  try {
    return await redisClient.get(key);
  } catch (error) {
    redisUnavailable = true;
    console.warn("Redis get failed, disabling Redis features.", error instanceof Error ? error.message : error);
    return null;
  }
};

export const redisSet = async (key: string, value: string, mode?: "EX" | "PX", duration?: number) => {
  if (!redisClient || redisUnavailable) {
    return null;
  }

  try {
    if (mode && duration) {
      return await redisClient.call("set", key, value, mode, duration);
    }

    return await redisClient.call("set", key, value);
  } catch (error) {
    redisUnavailable = true;
    console.warn("Redis set failed, disabling Redis features.", error instanceof Error ? error.message : error);
    return null;
  }
};

export const redisDel = async (...keys: string[]) => {
  if (!redisClient || redisUnavailable) {
    return 0;
  }

  try {
    return await redisClient.del(...keys);
  } catch (error) {
    redisUnavailable = true;
    console.warn("Redis del failed, disabling Redis features.", error instanceof Error ? error.message : error);
    return 0;
  }
};
