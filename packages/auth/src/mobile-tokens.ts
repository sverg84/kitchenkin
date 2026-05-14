import { randomBytes, createHash } from "node:crypto";
import type { Redis } from "ioredis";
import { prisma } from "@kk/db";

export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60; // 15 minutes
export const REFRESH_TOKEN_TTL_SECONDS = 60 * 24 * 60 * 60; // 60 days

export const ACCESS_PREFIX = "kkat_";
export const REFRESH_PREFIX = "kkrt_";

const REDIS_AT_KEY = (hash: string) => `mobile:at:${hash}`;

export interface IssuedTokenPair {
  accessToken: string;
  refreshToken: string;
  accessExpiresAt: string; // ISO
  refreshExpiresAt: string; // ISO
}

interface RedisAccessRecord {
  userId: string;
  mobileTokenId: string;
}

interface IssueOptions {
  userId: string;
  device?: string | null;
  userAgent?: string | null;
}

interface IssuePairOptions extends IssueOptions {
  /** Existing MobileToken row to replace (refresh rotation). */
  replacingTokenId?: string;
}

export interface MobileTokenService {
  issuePair(opts: IssuePairOptions): Promise<IssuedTokenPair>;
  rotate(opts: {
    refreshToken: string;
    device?: string | null;
    userAgent?: string | null;
  }): Promise<IssuedTokenPair>;
  resolveAccess(token: string): Promise<RedisAccessRecord | null>;
  revoke(opts: {
    accessToken?: string;
    refreshToken?: string;
  }): Promise<boolean>;
}

export interface CreateMobileTokenServiceOptions {
  /** Returns the Redis client, or `null` if Redis is unavailable. */
  getRedis: () => Redis | null;
}

/**
 * Build a mobile-token service bound to a Redis client provider.
 *
 * Access tokens are opaque random strings stored only in Redis with a
 * short TTL. Refresh tokens are opaque random strings whose sha256 hash
 * is persisted as a {@link MobileToken} row in the database. Rotation
 * replaces the row (single-use refresh).
 */
export function createMobileTokenService({
  getRedis,
}: CreateMobileTokenServiceOptions): MobileTokenService {
  function requireRedis(): Redis {
    const redis = getRedis();
    if (!redis) {
      throw new Error("Redis is required for mobile token operations");
    }
    return redis;
  }

  async function cacheAccessToken(
    redis: Redis,
    accessToken: string,
    record: RedisAccessRecord,
  ): Promise<void> {
    await redis.set(
      REDIS_AT_KEY(sha256(accessToken)),
      JSON.stringify(record),
      "EX",
      ACCESS_TOKEN_TTL_SECONDS,
    );
  }

  async function evictAccessTokensForMobileTokenId(
    redis: Redis,
    mobileTokenId: string,
  ): Promise<void> {
    // Best-effort sweep. Access tokens are short-lived (15 min) so we
    // tolerate eventual consistency here. We scan rather than maintain
    // a reverse index to keep the data model simple. With a small
    // mobile footprint per user, this stays cheap.
    const stream = redis.scanStream({ match: "mobile:at:*", count: 200 });
    const pipeline = redis.pipeline();
    let pending = 0;

    for await (const keys of stream) {
      const batch = keys as string[];
      if (!batch || batch.length === 0) continue;
      const values = await redis.mget(...batch);
      for (let i = 0; i < batch.length; i++) {
        const raw = values[i];
        if (!raw) continue;
        try {
          const parsed = JSON.parse(raw) as RedisAccessRecord;
          if (parsed.mobileTokenId === mobileTokenId) {
            pipeline.del(batch[i]);
            pending += 1;
          }
        } catch {
          // ignore malformed entry
        }
      }
    }

    if (pending > 0) {
      await pipeline.exec();
    }
  }

  async function issuePair({
    userId,
    device,
    userAgent,
    replacingTokenId,
  }: IssuePairOptions): Promise<IssuedTokenPair> {
    const redis = requireRedis();

    const accessToken = generateOpaqueToken(ACCESS_PREFIX);
    const refreshToken = generateOpaqueToken(REFRESH_PREFIX);
    const now = new Date();
    const accessExpiresAt = new Date(
      now.getTime() + ACCESS_TOKEN_TTL_SECONDS * 1000,
    );
    const refreshExpiresAt = new Date(
      now.getTime() + REFRESH_TOKEN_TTL_SECONDS * 1000,
    );

    const mobileToken = await prisma.$transaction(async (tx) => {
      if (replacingTokenId) {
        await tx.mobileToken.delete({ where: { id: replacingTokenId } });
      }
      return tx.mobileToken.create({
        data: {
          userId,
          refreshTokenHash: sha256(refreshToken),
          device: device ?? null,
          userAgent: userAgent ?? null,
          expiresAt: refreshExpiresAt,
        },
      });
    });

    if (replacingTokenId) {
      await evictAccessTokensForMobileTokenId(redis, replacingTokenId);
    }

    await cacheAccessToken(redis, accessToken, {
      userId,
      mobileTokenId: mobileToken.id,
    });

    return {
      accessToken,
      refreshToken,
      accessExpiresAt: accessExpiresAt.toISOString(),
      refreshExpiresAt: refreshExpiresAt.toISOString(),
    };
  }

  async function rotate({
    refreshToken,
    device,
    userAgent,
  }: {
    refreshToken: string;
    device?: string | null;
    userAgent?: string | null;
  }): Promise<IssuedTokenPair> {
    if (!refreshToken.startsWith(REFRESH_PREFIX)) {
      throw new Error("Invalid refresh token");
    }

    const existing = await prisma.mobileToken.findUnique({
      where: { refreshTokenHash: sha256(refreshToken) },
    });

    if (!existing) {
      throw new Error("Invalid refresh token");
    }
    if (existing.revokedAt) {
      throw new Error("Refresh token revoked");
    }
    if (existing.expiresAt.getTime() <= Date.now()) {
      throw new Error("Refresh token expired");
    }

    return issuePair({
      userId: existing.userId,
      device: device ?? existing.device,
      userAgent: userAgent ?? existing.userAgent,
      replacingTokenId: existing.id,
    });
  }

  async function resolveAccess(
    token: string,
  ): Promise<RedisAccessRecord | null> {
    if (!token.startsWith(ACCESS_PREFIX)) return null;
    const redis = getRedis();
    if (!redis) return null;

    // Redis errors (auth, network, etc.) are treated as cache miss
    // rather than 500s. The mobile client then gets a 401 from the
    // caller and falls back to refresh; misconfigured infra never
    // leaks as a user-visible auth response.
    let raw: string | null;
    try {
      raw = await redis.get(REDIS_AT_KEY(sha256(token)));
    } catch (err) {
      console.warn("[mobile-tokens] redis.get failed:", err);
      return null;
    }
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw) as RedisAccessRecord;
      if (!parsed.userId || !parsed.mobileTokenId) return null;
      return parsed;
    } catch {
      return null;
    }
  }

  async function revoke({
    accessToken,
    refreshToken,
  }: {
    accessToken?: string;
    refreshToken?: string;
  }): Promise<boolean> {
    const redis = getRedis();
    let mobileTokenId: string | null = null;

    if (accessToken?.startsWith(ACCESS_PREFIX) && redis) {
      const record = await resolveAccess(accessToken);
      if (record) {
        mobileTokenId = record.mobileTokenId;
        await redis
          .del(REDIS_AT_KEY(sha256(accessToken)))
          .catch((err: unknown) => {
            console.warn("[mobile-tokens] redis.del failed:", err);
          });
      }
    }

    if (!mobileTokenId && refreshToken?.startsWith(REFRESH_PREFIX)) {
      const row = await prisma.mobileToken.findUnique({
        where: { refreshTokenHash: sha256(refreshToken) },
        select: { id: true },
      });
      if (row) mobileTokenId = row.id;
    }

    if (!mobileTokenId) return false;

    await prisma.mobileToken
      .delete({ where: { id: mobileTokenId } })
      .catch(() => null); // already gone is fine

    if (redis) {
      await evictAccessTokensForMobileTokenId(redis, mobileTokenId).catch(
        (err) => {
          console.warn("[mobile-tokens] access-token eviction failed:", err);
        },
      );
    }

    return true;
  }

  return { issuePair, rotate, resolveAccess, revoke };
}

function generateOpaqueToken(prefix: string): string {
  return `${prefix}${randomBytes(32).toString("base64url")}`;
}

function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}
