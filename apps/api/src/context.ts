import {
  createMobileTokenService,
  createUserResolver,
  createWebBearerService,
} from "@kk/auth";

import { getRedis } from "./redis";

/**
 * Single instance of the mobile token service for this API process.
 * Re-used by both the request resolver below (for bearer validation)
 * and by the mobile auth handlers (for bearer issuance/refresh).
 */
export const tokens = createMobileTokenService({ getRedis });

export const webBearer = createWebBearerService({ getRedis });

/**
 * Resolve the requesting user from an incoming `Request`.
 *
 * The API only ever sees bearer tokens — it never reads cookies (the
 * NextAuth session cookie is host-only on `kitchenkin.app` and never
 * crosses the origin to `api.kitchenkin.app`). The `resolveCookieUser`
 * hook is therefore a no-op, but we keep `createUserResolver`'s shape
 * uniform with `apps/web` so the same code path resolves identity in
 * both contexts.
 */
export const resolveUser = createUserResolver({
  tokens,
  webBearer,
  resolveCookieUser: async () => null,
});
