import { createFragmentRegistry } from "@apollo/client/cache";
import { RecipeFragment } from "../fragments/recipe";

import { ApolloClient, InMemoryCache } from "@apollo/client-integration-nextjs";
import { HttpLink } from "@apollo/client";

export function makeClient(cookie?: string | null) {
  const link = new HttpLink({
    uri:
      process.env.NEXT_PUBLIC_GRAPHQL_URI ||
      "http://localhost:3000/api/graphql",
    credentials: "include",
    headers: { cookie: cookie ?? "" },
  });

  return new ApolloClient({
    cache: new InMemoryCache({
      fragments: createFragmentRegistry(RecipeFragment),
    }),
    link,
  });
}
