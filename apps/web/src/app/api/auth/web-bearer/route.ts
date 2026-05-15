import { NextResponse } from "next/server";

import { issueWebBearerPayloadOrNull } from "@/lib/auth/issue-web-bearer-from-session";

/**
 * Mint a short-lived opaque bearer for the current NextAuth database
 * session. Used when the browser talks to `apps/api` (different
 * origin) while keeping session cookies on the web app host.
 */
export async function POST() {
  try {
    const issued = await issueWebBearerPayloadOrNull();
    if (!issued) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    return NextResponse.json(issued);
  } catch (err) {
    console.error("[web-bearer] issue failed:", err);
    return NextResponse.json(
      { error: "Bearer issuance unavailable" },
      { status: 503 },
    );
  }
}
