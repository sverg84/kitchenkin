import { ApolloClient, ApolloLink, InMemoryCache } from "@apollo/client";
import { SetContextLink } from "@apollo/client/link/context";
import { getCacheConfig, makeHttpLink } from "@kk/graphql/client";
import * as Linking from "expo-linking";

import { resolveApiBase } from "@/lib/api";
import { getAuthCookie } from "@/lib/auth/auth-client";

function graphqlUri(): string {
  const fromEnv = process.env.EXPO_PUBLIC_GRAPHQL_URI?.trim();
  if (fromEnv) return fromEnv;
  const authOrigin = (
    process.env.EXPO_PUBLIC_AUTH_ORIGIN ?? process.env.EXPO_PUBLIC_API_URL
  )
    ?.trim()
    .replace(/\/$/, "");
  if (authOrigin) {
    return `${authOrigin}/api/graphql`;
  }
  return `${resolveApiBase()}/graphql`;
}

const authHeadersLink = new SetContextLink((prevContext) => {
  const cookie = getAuthCookie();
  const expoOrigin = Linking.createURL("/");

  return {
    headers: {
      ...(prevContext.headers ?? {}),
      ...(cookie ? { cookie } : {}),
      "expo-origin": expoOrigin,
    },
  };
});

export const apolloClient = new ApolloClient({
  cache: new InMemoryCache(getCacheConfig()),
  link: ApolloLink.from([
    authHeadersLink,
    makeHttpLink({ uri: graphqlUri(), credentials: "omit" }),
  ]),
});
