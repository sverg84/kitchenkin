import { cache } from "react";

import { resolveWebAppOriginFromEnv } from "./graphql-remote";

/**
 * Per-request dedupe when minting a web bearer during RSC (many queries
 * in one render should not POST `/api/auth/web-bearer` repeatedly).
 */
export const getServerGraphqlAuthHeaders = cache(
  async (
    cookieHeader: string,
    appOrigin: string | undefined,
  ): Promise<Record<string, string>> => {
    if (!cookieHeader) return {};
    const base = appOrigin ?? resolveWebAppOriginFromEnv();
    const res = await fetch(`${base}/api/auth/web-bearer`, {
      method: "POST",
      headers: { cookie: cookieHeader },
      cache: "no-store",
    });
    if (!res.ok) return {};
    const body = (await res.json()) as { accessToken: string };
    return { authorization: `Bearer ${body.accessToken}` };
  },
);

const SKEW_MS = 45_000;

let browserBearerCache: { token: string; expiresAtMs: number } | null = null;

function browserLikelyHasSessionCookie(): boolean {
  if (typeof document === "undefined") return false;
  const c = document.cookie;
  return (
    c.includes("authjs.session-token") ||
    c.includes("__Secure-authjs.session-token")
  );
}

export async function getBrowserGraphqlExtraHeaders(): Promise<
  Record<string, string>
> {
  if (typeof window === "undefined") return {};

  if (!browserLikelyHasSessionCookie()) {
    browserBearerCache = null;
    return {};
  }

  const now = Date.now();
  if (browserBearerCache && browserBearerCache.expiresAtMs - SKEW_MS > now) {
    return { authorization: `Bearer ${browserBearerCache.token}` };
  }

  const res = await fetch(`${window.location.origin}/api/auth/web-bearer`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) {
    browserBearerCache = null;
    return {};
  }

  const body = (await res.json()) as {
    accessToken: string;
    accessExpiresAt: string;
  };
  browserBearerCache = {
    token: body.accessToken,
    expiresAtMs: Date.parse(body.accessExpiresAt),
  };
  return { authorization: `Bearer ${body.accessToken}` };
}
