import { ApolloClient, InMemoryCache } from "@apollo/client-integration-nextjs";
import { getCacheConfig, makeHttpLink } from "@kk/graphql/client";

import {
  getBrowserGraphqlExtraHeaders,
  getServerGraphqlAuthHeaders,
} from "../graphql-auth";
import { graphqlUri, shouldUseBearerBridge } from "../graphql-remote";

/**
 * Web (Next-RSC-aware) Apollo Client factory. Composes the cache config
 * and HTTP link from `@kk/graphql` with the RSC-aware `ApolloClient` /
 * `InMemoryCache` from `@apollo/client-integration-nextjs`.
 *
 * @param cookie - Forwarded `Cookie` header on the server (from
 *   `headers().get("cookie")`). Ignored in the browser.
 * @param appOrigin - Server only: actual public origin for this request
 *   (from `Host` / `x-forwarded-*`) so internal `fetch` to
 *   `/api/auth/web-bearer` hits the same port as the browser (e.g. 3001).
 */
export function makeClient(
  cookie?: string | null,
  appOrigin?: string,
): ApolloClient {
  const uri = graphqlUri();
  const useBridge = shouldUseBearerBridge(uri);
  const isServer = typeof window === "undefined";

  return new ApolloClient({
    cache: new InMemoryCache(getCacheConfig()),
    link: makeHttpLink({
      uri,
      credentials: useBridge ? "omit" : "include",
      headers:
        useBridge && isServer
          ? undefined
          : !useBridge
            ? { cookie: cookie ?? "" }
            : undefined,
      getHeaders:
        useBridge && isServer
          ? () => getServerGraphqlAuthHeaders(cookie ?? "", appOrigin)
          : useBridge && !isServer
            ? getBrowserGraphqlExtraHeaders
            : undefined,
    }),
  });
}
