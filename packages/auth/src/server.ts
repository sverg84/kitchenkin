import { betterAuth } from "better-auth";

import { kitchenKinBetterAuthOptions } from "./auth-options-core";

/** Node Better Auth instance (no Next.js cookie bridging). */
export const auth = betterAuth(kitchenKinBetterAuthOptions);
