"use client";

import type React from "react";
import { makeClient } from "./apollo-client";
import { ApolloNextAppProvider } from "@apollo/client-integration-nextjs";

export function ApolloProvider({ children }: { children: React.ReactNode }) {
  return (
    <ApolloNextAppProvider makeClient={() => makeClient()}>
      {children}
    </ApolloNextAppProvider>
  );
}
