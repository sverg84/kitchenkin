import { prisma } from "@kk/db";
import { cookies } from "next/headers";

import { auth } from "@/auth";
import { readAuthJsSessionToken } from "@/lib/auth/authjs-session-cookie";
import { webBearer } from "@/lib/auth/web-bearer-service";

export type WebBearerPayload = {
  accessToken: string;
  accessExpiresAt: string;
};

/**
 * Mint a web bearer for the current request when a valid database session
 * exists. Used by `/api/auth/web-bearer` and the GraphQL same-origin proxy.
 */
export async function issueWebBearerPayloadOrNull(): Promise<WebBearerPayload | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const jar = await cookies();
  const sessionToken = readAuthJsSessionToken(jar);
  if (!sessionToken) return null;

  const row = await prisma.session.findUnique({
    where: { sessionToken },
    select: { userId: true, expires: true },
  });

  if (!row || row.userId !== session.user.id) return null;
  if (row.expires.getTime() <= Date.now()) return null;

  try {
    return await webBearer.issueWebBearer({
      userId: session.user.id,
      sessionToken,
    });
  } catch (err) {
    console.error("[web-bearer] issue failed:", err);
    throw err;
  }
}
