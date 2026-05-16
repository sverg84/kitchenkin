import { useEffect, useState } from "react";

import { authClient } from "./auth-client";

export type GoogleSignInStatus =
  | "idle"
  | "unconfigured"
  | "busy"
  | "error";

export interface UseGoogleSignInResult {
  status: GoogleSignInStatus;
  error: string | null;
  signIn: () => Promise<void>;
}

/**
 * Starts Better Auth Google OAuth (`apps/web` as auth backend via Expo plugin).
 */
export function useGoogleSignIn(): UseGoogleSignInResult {
  const configured = Boolean(process.env.EXPO_PUBLIC_AUTH_ORIGIN?.trim());

  const [status, setStatus] = useState<GoogleSignInStatus>(
    configured ? "idle" : "unconfigured",
  );
  const [error, setError] = useState<string | null>(
    configured ? null : "Set EXPO_PUBLIC_AUTH_ORIGIN to your Next.js origin.",
  );

  useEffect(() => {
    void authClient.getSession().catch(() => undefined);
  }, []);

  async function signIn() {
    if (!configured) return;
    setError(null);
    setStatus("busy");
    try {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });
      const errMsg = result.error?.message;
      if (errMsg) {
        setStatus("error");
        setError(errMsg);
        return;
      }
      await authClient.getSession();
      setStatus("idle");
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Sign-in failed");
    }
  }

  return {
    status,
    error,
    signIn,
  };
}
