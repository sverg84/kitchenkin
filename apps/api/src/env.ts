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
  /** Comma-separated allowed origins for browser callers. */
  corsAllowedOrigins: string[];
  nodeEnv: "development" | "production" | "test";
}

function optional(name: string, fallback: string): string {
  return process.env[name] ?? fallback;
}

export function loadEnv(): ApiEnv {
  return {
    port: Number(optional("PORT", "4000")),
    databaseUrl: required("DATABASE_URL"),
    corsAllowedOrigins: parseList(process.env.CORS_ALLOWED_ORIGINS),
    nodeEnv: (process.env.NODE_ENV as ApiEnv["nodeEnv"]) ?? "development",
  };
}

export const env = loadEnv();
