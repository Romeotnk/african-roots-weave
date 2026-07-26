import { redisClient } from "../config/redis.js";

/**
 * Runs `task` only if a Redis lock for `name` can be acquired, so that in a
 * multi-instance deployment only one instance runs a given cron job per
 * tick instead of every instance running it (duplicate notifications, races
 * on the same rows). Without Redis configured/available, this degrades to
 * just running the task — single-instance deployments have no duplicate-run
 * risk to begin with.
 */
export const withDistributedLock = async (name: string, ttlMs: number, task: () => Promise<void>) => {
  if (!redisClient || redisClient.status !== "ready") {
    await task();
    return;
  }

  const acquired = await redisClient.set(`lock:${name}`, "1", "PX", ttlMs, "NX");
  if (acquired !== "OK") return;

  await task();
};
