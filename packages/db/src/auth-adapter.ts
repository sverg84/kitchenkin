import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Adapter } from "next-auth/adapters";
import { prisma } from "./index";

// Minimal Redis interface so packages/db doesn't take a hard dep on ioredis.
// apps/web supplies the actual client via the factory option below.
export type AuthAdapterRedisLike = {
  del(key: string): Promise<unknown>;
  get(key: string): Promise<string | null>;
  set(
    key: string,
    value: string,
    mode: "EX",
    seconds: number,
  ): Promise<unknown>;
};

export type CreateCustomPrismaAdapterOptions = {
  /**
   * Optional Redis-like client factory used to cache active sessions.
   * Returning `null` (or omitting the option) disables caching but keeps the
   * adapter fully functional against Postgres.
   */
  getRedis?: () => AuthAdapterRedisLike | null;
};

const maxCacheTtlSeconds = 60 * 30;

function toValidDate(value: unknown): Date | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === "string" || typeof value === "number") {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  return null;
}

function getSessionCacheTtlSeconds(expires: unknown): number | null {
  const expiresAt = toValidDate(expires);
  if (!expiresAt) return maxCacheTtlSeconds;

  const secondsUntilExpiry = Math.floor(
    (expiresAt.getTime() - Date.now()) / 1000,
  );
  if (secondsUntilExpiry <= 0) return null;

  return Math.min(secondsUntilExpiry, maxCacheTtlSeconds);
}

function getRedisKey(sessionToken: string) {
  return `session:${sessionToken}`;
}

export function createCustomPrismaAdapter(
  options?: CreateCustomPrismaAdapterOptions,
): Adapter {
  const getRedis = options?.getRedis ?? (() => null);
  const adapter = PrismaAdapter(prisma);

  return {
    ...adapter,

    deleteSession: (async (sessionToken: string) => {
      const redis = getRedis();
      if (redis) {
        try {
          await redis.del(getRedisKey(sessionToken));
        } catch {
          /* optional cache — ignore */
        }
      }
      return adapter.deleteSession!(sessionToken);
    }) as NonNullable<Adapter["deleteSession"]>,

    async updateSession(session) {
      const updatedSession = await adapter.updateSession!(session);
      const redis = getRedis();

      if (updatedSession && redis) {
        const ttlSeconds = getSessionCacheTtlSeconds(updatedSession.expires);
        if (!ttlSeconds) return updatedSession;
        try {
          await redis.set(
            getRedisKey(session.sessionToken),
            JSON.stringify(updatedSession),
            "EX",
            ttlSeconds,
          );
        } catch {
          /* optional cache — ignore */
        }
      }
      return updatedSession;
    },

    async getSessionAndUser(sessionToken) {
      const redisKey = getRedisKey(sessionToken);
      const redis = getRedis();

      if (redis) {
        try {
          const cachedSession = await redis.get(redisKey);
          if (cachedSession) {
            return JSON.parse(cachedSession);
          }
        } catch {
          /* optional cache — continue to DB */
        }
      }

      const sessionAndUser = await adapter.getSessionAndUser!(sessionToken);

      if (sessionAndUser && redis) {
        const ttlSeconds = getSessionCacheTtlSeconds(
          sessionAndUser.session.expires,
        );
        if (!ttlSeconds) return sessionAndUser;
        try {
          await redis.set(
            redisKey,
            JSON.stringify(sessionAndUser),
            "EX",
            ttlSeconds,
          );
        } catch {
          /* optional cache — ignore */
        }
      }

      return sessionAndUser;
    },
  };
}
