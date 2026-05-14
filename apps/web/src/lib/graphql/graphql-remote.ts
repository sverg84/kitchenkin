/**
 * Remote GraphQL on standalone `apps/api` (`NEXT_PUBLIC_GRAPHQL_URI`).
 */

export function graphqlUri(): string {
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
