import {
  createGoogleVerifier,
  createMobileAuthHandlers,
  type GoogleVerifier,
} from "@kk/auth";

import { tokens } from "./context";
import { env } from "./env";

/**
 * Build the Google id_token verifier only when at least one client id
 * is configured. Without env, `/auth/mobile/oauth/google` responds 503
 * (handled by `createMobileAuthHandlers` when `google` is omitted).
 */
function makeGoogleVerifier(): GoogleVerifier | undefined {
  if (env.googleMobileClientIds.length === 0) return undefined;
  return createGoogleVerifier({
    audience:
      env.googleMobileClientIds.length === 1
        ? env.googleMobileClientIds[0]
        : env.googleMobileClientIds,
  });
}

/**
 * Mobile auth handlers wired for the standalone API.
 *
 * `resolveCookieUserId` always returns null because the API never
 * sees the NextAuth cookie (different origin), so
 * **`/auth/mobile/exchange` always responds 401** here. The Next app no
 * longer hosts a cookie-exchange route; mobile auth uses **`/auth/mobile/oauth/google`**
 * (id_token) plus **`refresh`** / **`logout`**. If you need same-origin cookie
 * exchange again, wire `resolveCookieUserId` on a host that receives the
 * session cookie (not this API as currently deployed).
 */
export const mobileAuthHandlers = createMobileAuthHandlers({
  tokens,
  resolveCookieUserId: async () => null,
  google: makeGoogleVerifier(),
});
