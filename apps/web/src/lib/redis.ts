import Redis from "ioredis";

let redisClient: Redis | undefined;
let hasLoggedRedisError = false;

function isRedisDisabled() {
  if (process.env.DISABLE_REDIS === "1") return true;
  // Avoid side effects during `next build`/static generation.
  if (process.env.NEXT_PHASE === "phase-production-build") return true;
  return false;
}

export function getRedis(): Redis | null {
  if (isRedisDisabled()) return null;

  const url = process.env.REDIS_URL ?? "redis://localhost:6379";

  if (!redisClient) {
    redisClient = new Redis(url);
    redisClient.on("error", (err) => {
      // Ensure ioredis errors don't surface as unhandled error events.
      if (hasLoggedRedisError) return;
      hasLoggedRedisError = true;
      console.warn("[redis] connection error:", err);
    });
  }

  return redisClient;
}
