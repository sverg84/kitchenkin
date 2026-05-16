import { authClient } from "./auth-client";

export type SessionStatus = "loading" | "authenticated" | "anonymous";

/**
 * Mirrors the old KK session facade for screens that still consume
 * `useSession()` / {@link session.signOut}.
 */
export function useSession(): { status: SessionStatus } {
  const { data, isPending } = authClient.useSession();

  let status: SessionStatus = "loading";
  if (!isPending) {
    status = data?.session ? "authenticated" : "anonymous";
  }
  return { status };
}

export const session = {
  async hydrate() {
    await authClient.getSession();
  },
  async signOut() {
    await authClient.signOut();
  },
};
