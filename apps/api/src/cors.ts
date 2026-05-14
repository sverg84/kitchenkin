import { cors } from "hono/cors";

import { env } from "./env";

/**
 * Build the CORS middleware used by browser-facing routes (GraphQL,
 * web bearer auth). Mobile callers don't need CORS (not a browser).
 *
 * The allowlist is read from `CORS_ALLOWED_ORIGINS` (comma-separated).
 * A literal `*` entry disables the check (useful only for local dev).
 * Entries beginning with `*.` are treated as suffix-match wildcards
 * (e.g. `*.vercel.app` matches any Vercel preview deploy).
 */
export const apiCors = cors({
  origin: (origin) => {
    if (!origin) return null;
    if (env.corsAllowedOrigins.includes("*")) return origin;
    if (env.corsAllowedOrigins.includes(origin)) return origin;
    for (const pattern of env.corsAllowedOrigins) {
      if (pattern.startsWith("*.")) {
        const suffix = pattern.slice(1);
        if (origin.endsWith(suffix)) return origin;
      }
    }
    return null;
  },
  credentials: false,
  allowMethods: ["GET", "POST", "OPTIONS"],
  allowHeaders: ["authorization", "content-type", "x-apollo-operation-name"],
  maxAge: 86400,
});
