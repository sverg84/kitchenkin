import Constants from "expo-constants";
import { Platform } from "react-native";

/**
 * Resolve the backend's HTTP base URL (no trailing slash). Both the
 * GraphQL endpoint and the mobile auth endpoints share this host —
 * which is the standalone `apps/api` server (Bun + Hono), not the
 * web app.
 *
 * Priority:
 *   1. `EXPO_PUBLIC_API_BASE` env (e.g. https://api.kitchenkin.app).
 *   2. `EXPO_PUBLIC_GRAPHQL_URI`'s origin, for back-compat with the
 *      earlier mobile-only env.
 *   3. Expo dev host (Metro packager's IP) on a physical device or
 *      Android emulator, so the device can reach the dev machine on
 *      port 4000.
 *   4. `http://localhost:4000` for iOS simulator and web.
 */
export function resolveApiBase(): string {
  const explicitBase = process.env.EXPO_PUBLIC_API_BASE;
  if (explicitBase) return stripTrailingSlash(explicitBase);

  const explicitGraphql = process.env.EXPO_PUBLIC_GRAPHQL_URI;
  if (explicitGraphql) {
    try {
      const url = new URL(explicitGraphql);
      return `${url.protocol}//${url.host}`;
    } catch {
      // fall through
    }
  }

  const hostUri =
    Constants.expoConfig?.hostUri ??
    Constants.expoGoConfig?.debuggerHost ??
    null;

  if (hostUri && Platform.OS !== "web") {
    const host = hostUri.split(":")[0];
    if (host && host !== "127.0.0.1" && host !== "localhost") {
      return `http://${host}:4000`;
    }
  }

  return "http://localhost:4000";
}

export function apiUrl(path: string): string {
  return `${resolveApiBase()}${path.startsWith("/") ? path : `/${path}`}`;
}

function stripTrailingSlash(s: string): string {
  return s.endsWith("/") ? s.slice(0, -1) : s;
}
