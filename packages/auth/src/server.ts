import { betterAuth } from "better-auth";

import { kitchenKinBetterAuthOptions } from "./auth-options-core";

/** Node / `apps/api` — no Next.js cookie bridging. */
export const auth = betterAuth(kitchenKinBetterAuthOptions);

export type ResolvedGraphqlUser = {
  id: string;
  email: string | null;
  name: string | null;
};

export async function resolveUserFromBetterAuthHeaders(
  request: Request,
): Promise<ResolvedGraphqlUser | null> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) return null;
  const u = session.user;
  return {
    id: u.id,
    email: typeof u.email === "string" ? u.email : null,
    name: typeof u.name === "string" ? u.name : null,
  };
}
