import Redis from "ioredis";

import { env } from "./env";

/**
 * Single Redis client instance for the API process. Mirrors the web
 * app's getRedis() pattern in apps/web/src/lib/redis.ts so @kk/auth's
 * MobileTokenService can be wired identically.
 *
 * `DISABLE_REDIS=1` returns null, letting downstream code treat Redis
 * as unavailable (used by some tests and during static analysis).
 */

let redisClient: Redis | undefined;
let hasLoggedRedisError = false;

function isRedisDisabled() {
  return process.env.DISABLE_REDIS === "1";
}

export function getRedis(): Redis | null {
  if (isRedisDisabled()) return null;

  if (!redisClient) {
    redisClient = new Redis(env.redisUrl);
    redisClient.on("error", (err) => {
      if (hasLoggedRedisError) return;
      hasLoggedRedisError = true;
      console.warn("[redis] connection error:", err);
    });
  }

  return redisClient;
}
