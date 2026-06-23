import * as Linking from "expo-linking";

import { createApiClient } from "@kk/shared";
import { getAuthCookie } from "@/lib/auth/auth-client";
import { resolveApiBase } from "@/lib/api";

export const mobileApiClient = createApiClient({
  baseUrl: resolveApiBase(),
  credentials: "omit",
  getHeaders: () => {
    const cookie = getAuthCookie();
    const expoOrigin = Linking.createURL("/");
    return {
      ...(cookie ? { cookie } : {}),
      "expo-origin": expoOrigin,
    };
  },
});
