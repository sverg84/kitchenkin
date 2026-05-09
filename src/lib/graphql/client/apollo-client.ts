import { createFragmentRegistry } from "@apollo/client/cache";
import { RecipeFragment } from "../fragments/recipe";
import { PaginationFragment } from "../fragments/pagination";

import { ApolloClient, InMemoryCache } from "@apollo/client-integration-nextjs";
import { HttpLink } from "@apollo/client";
import { relayStylePagination } from "@apollo/client/utilities";
import { RecipeConnectionFragment } from "../fragments/connection-edges";
import generatedIntrospection from "@/lib/generated/graphql/possibleTypes.json";

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
      possibleTypes: generatedIntrospection.possibleTypes,
      fragments: createFragmentRegistry(
        RecipeFragment,
        RecipeConnectionFragment,
        PaginationFragment
      ),
      typePolicies: {
        Query: {
          fields: {
            recipes: relayStylePagination(["search"]),
            myRecipes: relayStylePagination(),
            categories: relayStylePagination(),
          },
        },
        QueryRecipesConnection: {
          keyFields: ["id"],
        },
        QueryMyRecipesConnection: {
          keyFields: ["id"],
        },
        QueryFavoriteRecipesConnection: {
          keyFields: ["id"],
        },
      },
    }),
    link,
  });
}
