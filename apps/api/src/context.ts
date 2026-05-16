import { resolveUserFromBetterAuthHeaders } from "@kk/auth/server";

/**
 * GraphQL identity from the incoming request: Better Auth session cookie
 * (forwarded by the Next `/api/graphql` proxy or the Expo client via `Cookie`).
 */
export async function resolveUser(request: Request) {
  return resolveUserFromBetterAuthHeaders(request);
}
