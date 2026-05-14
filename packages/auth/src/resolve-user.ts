import { prisma } from "@kk/db";
import type { MobileTokenService } from "./mobile-tokens";
import { ACCESS_PREFIX } from "./mobile-tokens";
import { WEB_ACCESS_PREFIX, type WebBearerService } from "./web-bearer";

export interface ResolvedUser {
  id: string;
  email: string | null;
  name: string | null;
}

export interface CreateUserResolverOptions {
  tokens: MobileTokenService;
  /**
   * Optional bridge tokens for logged-in web clients calling a
   * separate API origin (see {@link WEB_ACCESS_PREFIX}).
   */
  webBearer?: WebBearerService;
  /**
   * Resolve the user from the cookie-based session, if any. Injected
   * so this package can stay framework-agnostic — apps wire it to
   * their NextAuth/session setup.
   */
  resolveCookieUser(req: Request): Promise<ResolvedUser | null>;
}

/**
 * Build a request → user resolver that accepts either:
 *   1. An `Authorization: Bearer <opaque-access-token>` header
 *      (`kkwb_*` web bridge or `kkat_*` mobile access token), or
 *   2. The caller's cookie session via {@link resolveCookieUser}.
 *
 * Bearer wins when both are present.
 */
export function createUserResolver({
  tokens,
  webBearer,
  resolveCookieUser,
}: CreateUserResolverOptions) {
  return async function resolveUser(
    req: Request,
  ): Promise<ResolvedUser | null> {
    const bearer = extractBearer(req);
    if (bearer) {
      let userId: string | null = null;

      if (bearer.startsWith(WEB_ACCESS_PREFIX) && webBearer) {
        const web = await webBearer.resolveAccess(bearer);
        userId = web?.userId ?? null;
      } else if (bearer.startsWith(ACCESS_PREFIX)) {
        const record = await tokens.resolveAccess(bearer);
        userId = record?.userId ?? null;
      }

      if (!userId) return null;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, name: true },
      });
      return user ?? null;
    }

    return resolveCookieUser(req);
  };
}

function extractBearer(req: Request): string | null {
  const header = req.headers.get("authorization");
  if (!header) return null;
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  return match?.[1] ?? null;
}
