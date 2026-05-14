/**
 * Minimal env validation for apps/api. Throws on missing required vars
 * at boot time so we fail loudly rather than 500-ing on the first
 * request that needs them.
 */

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function optional(name: string, fallback: string): string {
  return process.env[name] ?? fallback;
}

function parseList(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export interface ApiEnv {
  port: number;
  databaseUrl: string;
  redisUrl: string;
  /** Comma-separated allowed origins for browser callers. */
  corsAllowedOrigins: string[];
  /** Comma-separated Google OAuth client ids accepted by /auth/mobile/oauth/google. */
  googleMobileClientIds: string[];
  nodeEnv: "development" | "production" | "test";
}

export function loadEnv(): ApiEnv {
  return {
    port: Number(optional("PORT", "4000")),
    databaseUrl: required("DATABASE_URL"),
    redisUrl: optional("REDIS_URL", "redis://localhost:6379"),
    corsAllowedOrigins: parseList(process.env.CORS_ALLOWED_ORIGINS),
    googleMobileClientIds: parseList(process.env.GOOGLE_MOBILE_CLIENT_IDS),
    nodeEnv: (process.env.NODE_ENV as ApiEnv["nodeEnv"]) ?? "development",
  };
}

export const env = loadEnv();
