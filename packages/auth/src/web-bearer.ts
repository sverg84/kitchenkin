import { randomBytes, createHash } from "node:crypto";
import type { Redis } from "ioredis";

import { ACCESS_TOKEN_TTL_SECONDS } from "./mobile-tokens";

/** Opaque access tokens minted for browser → API calls (Option A bridge). */
export const WEB_ACCESS_PREFIX = "kkwb_";

const WEB_AT_KEY = (accessTokenHash: string) => `web:at:${accessTokenHash}`;
const WEB_SESS_AT_INDEX = (sessionTokenHash: string) =>
  `web:sess:${sessionTokenHash}:at`;

interface WebAccessRecord {
  userId: string;
  sessionTokenHash: string;
}

export interface WebBearerService {
  issueWebBearer(opts: {
    userId: string;
    sessionToken: string;
  }): Promise<{ accessToken: string; accessExpiresAt: string }>;
  revokeWebBearersForSession(sessionToken: string): Promise<void>;
  resolveAccess(token: string): Promise<{ userId: string } | null>;
}

export interface CreateWebBearerServiceOptions {
  getRedis: () => Redis | null;
}

export function createWebBearerService({
  getRedis,
}: CreateWebBearerServiceOptions): WebBearerService {
  function requireRedis(): Redis {
    const redis = getRedis();
    if (!redis) {
      throw new Error("Redis is required for web bearer operations");
    }
    return redis;
  }

  async function issueWebBearer({
    userId,
    sessionToken,
  }: {
    userId: string;
    sessionToken: string;
  }): Promise<{ accessToken: string; accessExpiresAt: string }> {
    const redis = requireRedis();
    const sessionHash = sha256(sessionToken);

    await revokeWebBearersForSession(sessionToken).catch((err: unknown) => {
      console.warn("[web-bearer] pre-issue revoke failed:", err);
    });

    const accessToken = `${WEB_ACCESS_PREFIX}${randomBytes(32).toString("base64url")}`;
    const atHash = sha256(accessToken);
    const now = new Date();
    const accessExpiresAt = new Date(
      now.getTime() + ACCESS_TOKEN_TTL_SECONDS * 1000,
    );

    const record: WebAccessRecord = { userId, sessionTokenHash: sessionHash };

    await redis
      .set(
        WEB_AT_KEY(atHash),
        JSON.stringify(record),
        "EX",
        ACCESS_TOKEN_TTL_SECONDS,
      )
      .catch((err) => {
        throw err;
      });

    await redis
      .sadd(WEB_SESS_AT_INDEX(sessionHash), atHash)
      .catch((err: unknown) => {
        console.warn("[web-bearer] sadd index failed:", err);
      });
    await redis
      .expire(WEB_SESS_AT_INDEX(sessionHash), ACCESS_TOKEN_TTL_SECONDS + 120)
      .catch(() => {});

    return {
      accessToken,
      accessExpiresAt: accessExpiresAt.toISOString(),
    };
  }

  async function revokeWebBearersForSession(
    sessionToken: string,
  ): Promise<void> {
    const redis = getRedis();
    if (!redis) return;

    const sessionHash = sha256(sessionToken);
    const indexKey = WEB_SESS_AT_INDEX(sessionHash);
    let members: string[];
    try {
      members = await redis.smembers(indexKey);
    } catch (err) {
      console.warn("[web-bearer] smembers failed:", err);
      return;
    }

    if (!members || members.length === 0) {
      await redis.del(indexKey).catch(() => {});
      return;
    }

    const pipeline = redis.pipeline();
    for (const atHash of members) {
      pipeline.del(WEB_AT_KEY(atHash));
    }
    pipeline.del(indexKey);
    try {
      await pipeline.exec();
    } catch (err) {
      console.warn("[web-bearer] revoke pipeline failed:", err);
    }
  }

  async function resolveAccess(
    token: string,
  ): Promise<{ userId: string } | null> {
    if (!token.startsWith(WEB_ACCESS_PREFIX)) return null;
    const redis = getRedis();
    if (!redis) return null;

    let raw: string | null;
    try {
      raw = await redis.get(WEB_AT_KEY(sha256(token)));
    } catch (err) {
      console.warn("[web-bearer] redis.get failed:", err);
      return null;
    }
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw) as WebAccessRecord;
      if (!parsed.userId || !parsed.sessionTokenHash) return null;
      return { userId: parsed.userId };
    } catch {
      return null;
    }
  }

  return { issueWebBearer, revokeWebBearersForSession, resolveAccess };
}

function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}
