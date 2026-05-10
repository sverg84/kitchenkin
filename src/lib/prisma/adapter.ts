import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Adapter } from "next-auth/adapters";
import { prisma } from ".";
import { getRedis } from "../redis";

const adapter = PrismaAdapter(prisma);

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
    (expiresAt.getTime() - Date.now()) / 1000
  );
  if (secondsUntilExpiry <= 0) return null;

  return Math.min(secondsUntilExpiry, maxCacheTtlSeconds);
}

function getRedisKey(sessionToken: string) {
  return `session:${sessionToken}`;
}

const CustomPrismaAdapter: Adapter = {
  ...adapter,

  async deleteSession(sessionToken) {
    const redis = getRedis();
    if (redis) {
      try {
        await redis.del(getRedisKey(sessionToken));
      } catch {
        /* optional cache — ignore */
      }
    }
    await adapter.deleteSession!(sessionToken);
  },

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
          ttlSeconds
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
      const ttlSeconds = getSessionCacheTtlSeconds(sessionAndUser.session.expires);
      if (!ttlSeconds) return sessionAndUser;
      try {
        await redis.set(
          redisKey,
          JSON.stringify(sessionAndUser),
          "EX",
          ttlSeconds
        );
      } catch {
        /* optional cache — ignore */
      }
    }

    return sessionAndUser;
  },
};

export default CustomPrismaAdapter;
