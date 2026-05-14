import { prisma } from "@kk/db";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { readAuthJsSessionToken } from "@/lib/auth/authjs-session-cookie";
import { webBearer } from "@/lib/auth/web-bearer-service";
import { cookies } from "next/headers";

/**
 * Mint a short-lived opaque bearer for the current NextAuth database
 * session. Used when the browser talks to `apps/api` (different
 * origin) while keeping session cookies on the web app host.
 */
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const jar = await cookies();
  const sessionToken = readAuthJsSessionToken(jar);
  if (!sessionToken) {
    return NextResponse.json(
      { error: "Missing session cookie" },
      { status: 401 },
    );
  }

  const row = await prisma.session.findUnique({
    where: { sessionToken },
    select: { userId: true, expires: true },
  });

  if (!row || row.userId !== session.user.id) {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }
  if (row.expires.getTime() <= Date.now()) {
    return NextResponse.json({ error: "Session expired" }, { status: 401 });
  }

  try {
    const issued = await webBearer.issueWebBearer({
      userId: session.user.id,
      sessionToken,
    });
    return NextResponse.json(issued);
  } catch (err) {
    console.error("[web-bearer] issue failed:", err);
    return NextResponse.json(
      { error: "Bearer issuance unavailable" },
      { status: 503 },
    );
  }
}
