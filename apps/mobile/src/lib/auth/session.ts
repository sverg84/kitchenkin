import { useSyncExternalStore } from "react";
import { apiUrl } from "@/lib/api";
import { secureStore } from "@/lib/secure-store";

const STORAGE_KEY = "kk.mobile.session.v1";

export type SessionStatus = "loading" | "authenticated" | "anonymous";

export interface SessionTokens {
  accessToken: string;
  refreshToken: string;
  /** Epoch ms when the access token expires. */
  accessTokenExpiresAt: number;
  /** Epoch ms when the refresh token expires. */
  refreshTokenExpiresAt: number;
}

export interface SessionState {
  status: SessionStatus;
  tokens: SessionTokens | null;
}

type Listener = (state: SessionState) => void;

/** Raw shape returned by the backend mobile auth endpoints. */
interface TokenPairResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
  refreshExpiresIn: number; // seconds
}

function tokensFromResponse(res: TokenPairResponse): SessionTokens {
  const now = Date.now();
  return {
    accessToken: res.accessToken,
    refreshToken: res.refreshToken,
    accessTokenExpiresAt: now + res.expiresIn * 1000,
    refreshTokenExpiresAt: now + res.refreshExpiresIn * 1000,
  };
}

function createSessionStore() {
  let state: SessionState = { status: "loading", tokens: null };
  const listeners = new Set<Listener>();

  /**
   * In-flight refresh promise. We dedupe concurrent refreshes so that
   * a burst of 401s from parallel GraphQL queries collapses into a
   * single `/refresh` call.
   */
  let inflightRefresh: Promise<SessionTokens | null> | null = null;

  function emit() {
    for (const l of listeners) l(state);
  }

  function setState(next: SessionState) {
    state = next;
    emit();
  }

  async function persist(tokens: SessionTokens | null) {
    if (tokens) {
      await secureStore.set(STORAGE_KEY, JSON.stringify(tokens));
    } else {
      await secureStore.delete(STORAGE_KEY);
    }
  }

  function isExpired(tokens: SessionTokens): boolean {
    // 30s safety margin so we don't fire a request that will 401 mid-flight.
    return tokens.accessTokenExpiresAt - Date.now() < 30_000;
  }

  function isRefreshExpired(tokens: SessionTokens): boolean {
    return tokens.refreshTokenExpiresAt - Date.now() < 10_000;
  }

  async function hydrate() {
    try {
      const raw = await secureStore.get(STORAGE_KEY);
      if (!raw) {
        setState({ status: "anonymous", tokens: null });
        return;
      }
      const parsed = JSON.parse(raw) as SessionTokens;
      if (isRefreshExpired(parsed)) {
        await persist(null);
        setState({ status: "anonymous", tokens: null });
        return;
      }
      setState({ status: "authenticated", tokens: parsed });
    } catch {
      setState({ status: "anonymous", tokens: null });
    }
  }

  async function signInWithGoogle(idToken: string): Promise<void> {
    const res = await fetch(apiUrl("/auth/mobile/oauth/google"), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
    if (!res.ok) {
      const detail = await res.json().catch(() => ({}));
      throw new Error(detail.error ?? `Google sign-in failed (${res.status})`);
    }
    const payload = (await res.json()) as TokenPairResponse;
    const tokens = tokensFromResponse(payload);
    await persist(tokens);
    setState({ status: "authenticated", tokens });
  }

  async function signOut(): Promise<void> {
    const current = state.tokens;
    if (current) {
      // Best-effort revoke; don't block sign-out on backend reachability.
      fetch(apiUrl("/auth/mobile/logout"), {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${current.accessToken}`,
        },
      }).catch(() => {});
    }
    await persist(null);
    setState({ status: "anonymous", tokens: null });
  }

  async function refresh(): Promise<SessionTokens | null> {
    if (inflightRefresh) return inflightRefresh;

    const current = state.tokens;
    if (!current || isRefreshExpired(current)) {
      await persist(null);
      setState({ status: "anonymous", tokens: null });
      return null;
    }

    inflightRefresh = (async () => {
      try {
        const res = await fetch(apiUrl("/auth/mobile/refresh"), {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ refreshToken: current.refreshToken }),
        });
        if (!res.ok) {
          await persist(null);
          setState({ status: "anonymous", tokens: null });
          return null;
        }
        const payload = (await res.json()) as TokenPairResponse;
        const next = tokensFromResponse(payload);
        await persist(next);
        setState({ status: "authenticated", tokens: next });
        return next;
      } catch {
        // Network failure during refresh — keep the current tokens
        // in place so the user can retry once connectivity is back.
        return current;
      } finally {
        inflightRefresh = null;
      }
    })();

    return inflightRefresh;
  }

  /**
   * Synchronously read the access token suitable for an outgoing
   * request. Apollo's `SetContextLink` may await this if a refresh
   * is needed.
   */
  async function getAccessToken(): Promise<string | null> {
    const current = state.tokens;
    if (!current) return null;
    if (!isExpired(current)) return current.accessToken;
    const next = await refresh();
    return next?.accessToken ?? null;
  }

  return {
    snapshot(): SessionState {
      return state;
    },
    subscribe(listener: Listener): () => void {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    hydrate,
    signInWithGoogle,
    signOut,
    refresh,
    getAccessToken,
  };
}

export const session = createSessionStore();

export function useSession(): SessionState {
  return useSyncExternalStore(
    session.subscribe,
    session.snapshot,
    session.snapshot,
  );
}
