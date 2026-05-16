import { ApolloClient, InMemoryCache } from "@apollo/client-integration-nextjs";
import { getCacheConfig, makeHttpLink } from "@kk/graphql/client";

import { graphqlUri } from "../graphql-remote";

/**
 * Web Apollo client. Prefer same-origin GraphQL (`NEXT_PUBLIC_GRAPHQL_SAME_ORIGIN_PROXY=true`)
 * so the Better Auth session cookie is forwarded via `/api/graphql` to `apps/api`.
 *
 * On the server (`makeClient(cookie, origin)`), pass the inbound `Cookie` header so SSR
 * requests are authenticated without browser `credentials`.
 */
export function makeClient(
  cookie?: string | null,
  appOrigin?: string,
): ApolloClient {
  const uri = graphqlUri(appOrigin);
  const isServer = typeof window === "undefined";

  return new ApolloClient({
    cache: new InMemoryCache(getCacheConfig()),
    link: makeHttpLink({
      uri,
      credentials: "include",
      headers: isServer && cookie?.trim()
        ? { cookie: cookie }
        : {},
    }),
  });
}
