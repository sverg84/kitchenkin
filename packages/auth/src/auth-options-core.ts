import { expo } from "@better-auth/expo";
import type { BetterAuthOptions } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import { prisma } from "@kk/db";

import { envStr, requireEnv } from "./auth-env";

/** Public origin for OAuth redirects and Expo `baseURL` must match Better Auth `baseURL`. */
function appBaseURL(): string {
  return (
    envStr(["BETTER_AUTH_URL", "NEXT_PUBLIC_APP_ORIGIN", "AUTH_URL"]) ||
    "http://localhost:3000"
  );
}

function trustedOrigins(): string[] {
  const fromEnv = envStr(["BETTER_AUTH_TRUSTED_ORIGINS"]);
  const extra = fromEnv
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const out = new Set<string>([
    ...extra,
    appBaseURL(),
    envStr(["EXPO_PUBLIC_WEB_ORIGIN", "EXPO_PUBLIC_APP_ORIGIN"]),
    "kitchenkin://",
    "kitchenkin://*",
  ]);

  if (process.env.NODE_ENV === "development") {
    out.add("http://localhost:3000");
    out.add("http://127.0.0.1:3000");
    out.add("exp://");
  }

  out.delete("");
  return [...out];
}

/**
 * Shared Better Auth configuration (plugins **excluding** Next-only {@link nextCookies}).
 * Imported by `./server.ts` (`apps/api`) and merged in `./next.ts` (`apps/web`).
 */
export const kitchenKinBetterAuthOptions = {
  appName: "KitchenKin",
  baseURL: appBaseURL(),
  basePath: "/api/auth",
  secret: requireEnv(["AUTH_SECRET"]),
  trustedOrigins: trustedOrigins(),
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: false },
  socialProviders: {
    google: {
      clientId: requireEnv(["AUTH_GOOGLE_ID"]),
      clientSecret: requireEnv(["AUTH_GOOGLE_SECRET"]),
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
    },
  },
  plugins: [expo()],
} satisfies BetterAuthOptions;
