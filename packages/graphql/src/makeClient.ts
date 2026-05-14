import { ApolloClient, InMemoryCache } from "@apollo/client";
import { getCacheConfig } from "./cache";
import { makeHttpLink, type GraphQLLinkOptions } from "./link";

export type MakeClientOptions = GraphQLLinkOptions;

/**
 * Platform-agnostic Apollo Client factory.
 *
 * Web's RSC integration wraps this with the Next-aware `ApolloClient` /
 * `InMemoryCache` from `@apollo/client-integration-nextjs`, reusing
 * `getCacheConfig()` and `makeHttpLink()` directly. Mobile and any
 * non-Next consumer can use `makeClient()` as-is.
 */
export function makeClient(options: MakeClientOptions = {}): ApolloClient {
  return new ApolloClient({
    cache: new InMemoryCache(getCacheConfig()),
    link: makeHttpLink(options),
  });
}

export { getCacheConfig } from "./cache";
export { makeHttpLink, type GraphQLLinkOptions } from "./link";
