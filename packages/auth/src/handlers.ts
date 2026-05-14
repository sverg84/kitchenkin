import type { MobileTokenService } from "./mobile-tokens";
import type { GoogleVerifier } from "./oauth-google";
import { resolveGoogleUser } from "./oauth-google";

export interface MobileAuthHandlers {
  /**
   * POST handler — exchange the caller's existing web/cookie session
   * for a mobile token pair. Returns 401 if no cookie session is
   * present.
   */
  exchange(req: Request): Promise<Response>;
  /** POST handler — rotate a refresh token, returning a new pair. */
  refresh(req: Request): Promise<Response>;
  /** POST handler — revoke the session matching the bearer or refresh. */
  logout(req: Request): Promise<Response>;
  /**
   * POST handler — verify a Google id_token issued to the mobile app's
   * OAuth client, upsert the user, and issue a mobile token pair.
   * Returns 401 if the id_token is invalid or its `aud` doesn't match.
   * Returns 503 if no Google verifier was wired (configuration error).
   */
  oauthGoogle(req: Request): Promise<Response>;
}

export interface CreateMobileAuthHandlersOptions {
  tokens: MobileTokenService;
  /**
   * Resolve the user id from the request's cookie session, if any.
   * Returning `null` causes `/exchange` to respond with 401.
   *
   * Injected by the host app (e.g. same-origin Next.js route that sees
   * NextAuth cookies). The standalone **`apps/api`** typically passes
   * `async () => null` because it does not receive browser cookies.
   */
  resolveCookieUserId(req: Request): Promise<string | null>;
  /**
   * Optional Google id_token verifier. When omitted, `oauthGoogle`
   * returns 503 — useful for environments without Google OAuth
   * configured (preview deploys, tests, etc.).
   */
  google?: GoogleVerifier;
}

export function createMobileAuthHandlers({
  tokens,
  resolveCookieUserId,
  google,
}: CreateMobileAuthHandlersOptions): MobileAuthHandlers {
  return {
    async exchange(req) {
      const userId = await resolveCookieUserId(req);
      if (!userId) return jsonError("Not authenticated", 401);

      const body = await readJson<{ device?: string; userAgent?: string }>(req);

      try {
        const pair = await tokens.issuePair({
          userId,
          device: body.device,
          userAgent: body.userAgent ?? req.headers.get("user-agent"),
        });
        return jsonOk(pair);
      } catch (err) {
        return jsonError(messageOf(err, "Internal error"), 500);
      }
    },

    async oauthGoogle(req) {
      if (!google) {
        return jsonError("Google OAuth is not configured", 503);
      }

      let body: { idToken?: string; device?: string };
      try {
        body = (await req.json()) ?? {};
      } catch {
        return jsonError("Invalid JSON body", 400);
      }

      if (!body.idToken) {
        return jsonError("idToken is required", 400);
      }

      let identity;
      try {
        identity = await google.verifyIdToken(body.idToken);
      } catch (err) {
        return jsonError(messageOf(err, "Invalid Google id_token"), 401);
      }

      try {
        const user = await resolveGoogleUser(identity);
        const pair = await tokens.issuePair({
          userId: user.id,
          device: body.device,
          userAgent: req.headers.get("user-agent"),
        });
        return jsonOk(pair);
      } catch (err) {
        return jsonError(messageOf(err, "Internal error"), 500);
      }
    },

    async refresh(req) {
      let body: { refreshToken?: string; device?: string };
      try {
        body = (await req.json()) ?? {};
      } catch {
        return jsonError("Invalid JSON body", 400);
      }

      if (!body.refreshToken) {
        return jsonError("refreshToken is required", 400);
      }

      try {
        const pair = await tokens.rotate({
          refreshToken: body.refreshToken,
          device: body.device,
          userAgent: req.headers.get("user-agent"),
        });
        return jsonOk(pair);
      } catch (err) {
        return jsonError(messageOf(err, "Refresh failed"), 401);
      }
    },

    async logout(req) {
      const accessToken = extractBearer(req) ?? undefined;
      const body = await readJson<{ refreshToken?: string }>(req);

      if (!accessToken && !body.refreshToken) {
        return jsonError(
          "Provide a bearer access token or a refresh token",
          400,
        );
      }

      const revoked = await tokens.revoke({
        accessToken,
        refreshToken: body.refreshToken,
      });

      return jsonOk({ revoked });
    },
  };
}

async function readJson<T>(req: Request): Promise<Partial<T>> {
  if (req.headers.get("content-length") === "0") return {};
  try {
    return ((await req.json()) ?? {}) as Partial<T>;
  } catch {
    return {};
  }
}

function extractBearer(req: Request): string | null {
  const header = req.headers.get("authorization");
  if (!header) return null;
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  return match?.[1] ?? null;
}

function jsonOk(body: unknown): Response {
  return Response.json(body);
}

function jsonError(message: string, status: number): Response {
  return Response.json({ error: message }, { status });
}

function messageOf(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}
