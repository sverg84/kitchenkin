import { OAuth2Client } from "google-auth-library";
import { prisma } from "@kk/db";

export interface VerifiedGoogleIdentity {
  /** Google account id (the JWT `sub` claim). */
  providerAccountId: string;
  email: string | null;
  emailVerified: boolean;
  name: string | null;
  picture: string | null;
}

export interface CreateGoogleVerifierOptions {
  /**
   * The OAuth client id the mobile app obtained the id_token for.
   * Google's JWKS verification rejects tokens whose `aud` claim does
   * not match. To accept tokens from multiple client ids (iOS,
   * Android, web), pass an array.
   */
  audience: string | string[];
}

export interface GoogleVerifier {
  verifyIdToken(idToken: string): Promise<VerifiedGoogleIdentity>;
}

/**
 * Build a verifier that validates Google-issued id_tokens against
 * Google's JWKS endpoint and returns a normalized identity record.
 *
 * The underlying {@link OAuth2Client} caches the JWKS, so repeated
 * verifications don't refetch keys on every request.
 */
export function createGoogleVerifier({
  audience,
}: CreateGoogleVerifierOptions): GoogleVerifier {
  const client = new OAuth2Client();

  return {
    async verifyIdToken(idToken: string) {
      const ticket = await client.verifyIdToken({ idToken, audience });
      const payload = ticket.getPayload();
      if (!payload?.sub) {
        throw new Error("Google id_token missing subject claim");
      }
      return {
        providerAccountId: payload.sub,
        email: payload.email ?? null,
        emailVerified: payload.email_verified === true,
        name: payload.name ?? null,
        picture: payload.picture ?? null,
      };
    },
  };
}

/**
 * Resolve (or create) the {@link User} associated with a verified
 * Google identity. Matches the upsert behavior of the NextAuth Prisma
 * adapter so a user signing in via mobile lands on the same record as
 * they would on web:
 *
 *  1. Match by `Account` row keyed on `(google, sub)` — return the
 *     existing user.
 *  2. Else, if the id_token's email is verified, link this Google
 *     account onto an existing `User` row with that email.
 *  3. Else, create a new `User` row plus the `Account` link.
 */
export async function resolveGoogleUser(
  identity: VerifiedGoogleIdentity,
): Promise<{ id: string }> {
  const existingAccount = await prisma.account.findUnique({
    where: {
      provider_providerAccountId: {
        provider: "google",
        providerAccountId: identity.providerAccountId,
      },
    },
    select: { user: { select: { id: true } } },
  });
  if (existingAccount) return existingAccount.user;

  const linkableUser =
    identity.email && identity.emailVerified
      ? await prisma.user.findUnique({
          where: { email: identity.email },
          select: { id: true },
        })
      : null;

  const user =
    linkableUser ??
    (await prisma.user.create({
      data: {
        email: identity.email,
        name: identity.name,
        image: identity.picture,
        emailVerified: identity.emailVerified ? new Date() : null,
      },
      select: { id: true },
    }));

  await prisma.account.create({
    data: {
      userId: user.id,
      provider: "google",
      providerAccountId: identity.providerAccountId,
      type: "oauth",
    },
  });

  return user;
}
