import { ApolloClient, ApolloLink, InMemoryCache } from "@apollo/client";
import type { CombinedGraphQLErrors } from "@apollo/client/errors";
import { SetContextLink } from "@apollo/client/link/context";
import { ErrorLink } from "@apollo/client/link/error";
import { Observable, type Subscription } from "rxjs";
import { getCacheConfig, makeHttpLink } from "@kk/graphql/client";

import { resolveApiBase } from "@/lib/api";
import { session } from "@/lib/auth/session";

function graphqlUri(): string {
  return process.env.EXPO_PUBLIC_GRAPHQL_URI ?? `${resolveApiBase()}/graphql`;
}

/**
 * Inject the bearer access token into every outgoing operation.
 *
 * `getAccessToken` proactively refreshes if the token is about to
 * expire, so most requests skip the error-retry path entirely.
 */
const authLink = new SetContextLink(async (prevContext) => {
  const token = await session.getAccessToken();
  if (!token) return prevContext;
  return {
    ...prevContext,
    headers: {
      ...(prevContext.headers ?? {}),
      authorization: `Bearer ${token}`,
    },
  };
});

/**
 * On a network 401 or an `UNAUTHENTICATED` GraphQL error, attempt a
 * single refresh and retry the operation. If refresh fails or
 * returns no new token, the session has already been cleared by
 * the store, and the failure propagates to the caller.
 */
const errorLink = new ErrorLink(({ error, operation, forward }) => {
  if (!isAuthError(error)) return;

  // Only retry once: tag the operation context so a second 401 falls through.
  const prev = operation.getContext() as { __kkRetried?: boolean };
  if (prev.__kkRetried) return;
  operation.setContext({ ...prev, __kkRetried: true });

  return new Observable((subscriber) => {
    let inner: Subscription | undefined;
    session
      .refresh()
      .then((next) => {
        if (!next) {
          subscriber.error(error);
          return;
        }
        inner = forward(operation).subscribe(subscriber);
      })
      .catch((err) => subscriber.error(err));
    return () => inner?.unsubscribe();
  });
});

function isAuthError(error: unknown): boolean {
  if (!error) return false;
  const anyErr = error as {
    statusCode?: number;
    networkError?: { statusCode?: number };
    errors?: CombinedGraphQLErrors["errors"];
  };
  if (anyErr.statusCode === 401) return true;
  if (anyErr.networkError?.statusCode === 401) return true;
  if (Array.isArray(anyErr.errors)) {
    return anyErr.errors.some((e) => e?.extensions?.code === "UNAUTHENTICATED");
  }
  return false;
}

export const apolloClient = new ApolloClient({
  cache: new InMemoryCache(getCacheConfig()),
  link: ApolloLink.from([
    errorLink,
    authLink,
    // Mobile is bearer-only; never send the (nonexistent) web cookie.
    makeHttpLink({ uri: graphqlUri(), credentials: "omit" }),
  ]),
});
