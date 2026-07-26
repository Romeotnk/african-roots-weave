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
  if (!redisClient || redisClient.status === "ready") {
    return;
  }

  try {
    await Promise.race([
      redisClient.connect(),
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Redis connection timed out")), 3000);
      }),
    ]);
    redisUnavailable = false;
  } catch (error) {
    redisUnavailable = true;
    console.warn(
      "Redis unavailable, continuing without cache-backed features.",
      error instanceof Error ? error.message : error,
    );
  }
};

// retryStrategy gives up after a couple of attempts and ioredis then stops
// reconnecting on its own — without this, a single network hiccup would
// disable the JWT blacklist and every other Redis-backed feature for the
// rest of the process's life. Periodically try to reconnect instead.
if (redisClient) {
  setInterval(() => {
    if (!redisUnavailable || redisClient.status === "ready" || redisClient.status === "connecting") return;
    connectRedis().catch(() => {
      // still unavailable — connectRedis() already logged and reset the flag, next interval retries
    });
  }, 60_000).unref();
}

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
