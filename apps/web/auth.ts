/**
 * Server session helper (replaces NextAuth `auth()` ergonomics).
 */

import "server-only";

import { headers } from "next/headers";
import { connection } from "next/server";
import { auth as betterAuth } from "@kk/auth/next";

export async function auth() {
  await connection();
  return betterAuth.api.getSession({ headers: await headers() });
}
