/**
 * Remote GraphQL on standalone `apps/api` (`NEXT_PUBLIC_GRAPHQL_URI`), or
 * same-origin `/api/graphql` when `NEXT_PUBLIC_GRAPHQL_SAME_ORIGIN_PROXY` is
 * enabled (see `apps/web/src/app/api/graphql/route.ts`).
 */

export function graphqlUri(appOriginOverride?: string | null): string {
  if (process.env.NEXT_PUBLIC_GRAPHQL_SAME_ORIGIN_PROXY === "true") {
    if (appOriginOverride) {
      try {
        return `${new URL(appOriginOverride).origin}/api/graphql`;
      } catch {
        /* fall through */
      }
    }
    if (typeof window !== "undefined") {
      return `${window.location.origin}/api/graphql`;
    }
    return `${resolveWebAppOriginFromEnv()}/api/graphql`;
  }
  return process.env.NEXT_PUBLIC_GRAPHQL_URI ?? "http://localhost:4000/graphql";
}

/** Fallback when request `Host` headers are unavailable (e.g. scripts). */
export function resolveWebAppOriginFromEnv(): string {
  const raw =
    process.env.NEXT_PUBLIC_APP_ORIGIN ??
    process.env.AUTH_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);
  if (!raw) return "http://localhost:3000";
  try {
    return new URL(raw).origin;
  } catch {
    return "http://localhost:3000";
  }
}

/**
 * When the GraphQL host differs from the web app origin, cookies do not
 * reach the API — use the web-bearer bridge + `Authorization` instead.
 */
export function shouldUseBearerBridge(uri: string): boolean {
  try {
    const g = new URL(uri);
    const a = new URL(resolveWebAppOriginFromEnv());
    return g.origin !== a.origin;
  } catch {
    return false;
  }
}
