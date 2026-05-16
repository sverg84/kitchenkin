import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";

import { kitchenKinBetterAuthOptions } from "./auth-options-core";

/** Next.js — append `nextCookies()` last per Better Auth. */
export const auth = betterAuth({
  ...kitchenKinBetterAuthOptions,
  plugins: [...(kitchenKinBetterAuthOptions.plugins ?? []), nextCookies()],
});
