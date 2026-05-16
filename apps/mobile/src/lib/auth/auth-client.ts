import * as SecureStore from "expo-secure-store";
import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";

const baseURLRaw =
  process.env.EXPO_PUBLIC_AUTH_ORIGIN ??
  process.env.EXPO_PUBLIC_API_URL ??
  "";
const baseURL = baseURLRaw.replace(/\/$/, "");

if (!baseURL) {
  console.warn(
    "[auth] EXPO_PUBLIC_AUTH_ORIGIN (or EXPO_PUBLIC_API_URL) is not set.",
  );
}

export const authClient = createAuthClient({
  baseURL: baseURL || "http://127.0.0.1:3000",
  plugins: [
    expoClient({
      scheme: "kitchenkin",
      storagePrefix: "kitchenkin",
      storage: SecureStore,
    }),
  ],
});

/** Cookie string persisted by `@better-auth/expo` — forward to GraphQL. */
export function getAuthCookie(): string {
  const getCookie = authClient["getCookie" as keyof typeof authClient];
  if (typeof getCookie === "function") {
    return (getCookie as () => string)();
  }
  return "";
}
