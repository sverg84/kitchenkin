"use client";

import type React from "react";

import { useState } from "react";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider as BaseApolloProvider,
  createHttpLink,
} from "@apollo/client";
import { useSession } from "next-auth/react";
import createAuthLink from "./auth-link";

export function ApolloProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  const [client] = useState(() => {
    const httpLink = createHttpLink({
      uri: "/api/graphql",
    });

    const authLink = createAuthLink(session);

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
