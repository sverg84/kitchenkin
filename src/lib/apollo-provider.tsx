"use client";

import type React from "react";

import { useState } from "react";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider as BaseApolloProvider,
  createHttpLink,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { useSession } from "next-auth/react";

export function ApolloProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  const [client] = useState(() => {
    const httpLink = createHttpLink({
      uri: "/api/graphql",
    });

    const authLink = setContext((_, { headers }) => {
      // Get the authentication token from the session
      const token = session?.user ? session : null;

      // Return the headers to the context so httpLink can read them
      return {
        headers: {
          ...headers,
          authorization: token ? `Bearer ${token}` : "",
        },
      };
    });

    return new ApolloClient({
      link: authLink.concat(httpLink),
      cache: new InMemoryCache(),
      ssrMode: true,
      defaultOptions: {
        query: {
          fetchPolicy: "cache-first",
        },
      },
    });
  });

  return <BaseApolloProvider client={client}>{children}</BaseApolloProvider>;
}
