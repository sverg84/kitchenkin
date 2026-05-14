import * as Google from "expo-auth-session/providers/google";
import { useEffect, useState } from "react";

import { session } from "./session";

/**
 * Per-platform OAuth client ids registered in Google Cloud Console.
 *
 * For development you only need `webClientId` (used by Expo Go and
 * web). Native production builds also require `iosClientId` and
 * `androidClientId`. All three must list `aud` claims that the
 * backend's `GOOGLE_MOBILE_CLIENT_IDS` env accepts.
 */
const GOOGLE_CLIENT_IDS = {
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
};

export type GoogleSignInStatus =
  | "idle"
  | "configuring"
  | "unconfigured"
  | "prompting"
  | "exchanging"
  | "error";

export interface UseGoogleSignInResult {
  status: GoogleSignInStatus;
  error: string | null;
  signIn: () => Promise<void>;
}

/**
 * Hook that drives the Google OAuth flow on mobile.
 *
 * Flow:
 *   1. `useIdTokenAuthRequest` prepares a PKCE request and resolves
 *      to an id_token on the device after the user consents.
 *   2. On success, we hand the id_token off to the backend
 *      (`/auth/mobile/oauth/google` on the standalone API) via `session.signInWithGoogle`,
 *      which verifies it and issues our own mobile token pair.
 */
export function useGoogleSignIn(): UseGoogleSignInResult {
  const configured = Boolean(
    GOOGLE_CLIENT_IDS.webClientId ||
    GOOGLE_CLIENT_IDS.iosClientId ||
    GOOGLE_CLIENT_IDS.androidClientId,
  );

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest(
    configured ? GOOGLE_CLIENT_IDS : { webClientId: "unset" },
  );

  const [status, setStatus] = useState<GoogleSignInStatus>(
    configured ? "idle" : "unconfigured",
  );
  const [error, setError] = useState<string | null>(
    configured ? null : "Google OAuth client ids are not configured",
  );

  // React to a completed prompt: extract the id_token and exchange it.
  useEffect(() => {
    if (!response) return;

    if (response.type === "success") {
      const idToken = response.params?.id_token;
      if (!idToken) {
        setStatus("error");
        setError("Google did not return an id_token");
        return;
      }

      setStatus("exchanging");
      session
        .signInWithGoogle(idToken)
        .then(() => {
          setStatus("idle");
          setError(null);
        })
        .catch((err: unknown) => {
          setStatus("error");
          setError(err instanceof Error ? err.message : "Sign-in failed");
        });
    } else if (response.type === "error") {
      setStatus("error");
      setError(response.error?.message ?? "Google sign-in was rejected");
    } else if (response.type === "cancel" || response.type === "dismiss") {
      setStatus("idle");
    }
  }, [response]);

  return {
    status: !configured
      ? "unconfigured"
      : request === null
        ? "configuring"
        : status,
    error,
    async signIn() {
      if (!configured) return;
      try {
        setError(null);
        setStatus("prompting");
        await promptAsync();
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "Sign-in failed");
      }
    },
  };
}
