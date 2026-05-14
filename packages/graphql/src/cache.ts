import type { InMemoryCacheConfig } from "@apollo/client/cache";
import { createFragmentRegistry } from "@apollo/client/cache";
import { relayStylePagination } from "@apollo/client/utilities";
import { RecipeFragment } from "./fragments/recipe";
import { PaginationFragment } from "./fragments/pagination";
import { RecipeConnectionFragment } from "./fragments/connection-edges";
import generatedIntrospection from "./generated/possibleTypes.json";

/**
 * Cache configuration shared across web and mobile Apollo clients.
 * Callers pass this to whichever InMemoryCache implementation they
 * need (Next-RSC variant on web, vanilla on mobile).
 */
export function getCacheConfig(): InMemoryCacheConfig {
  return {
    possibleTypes: generatedIntrospection.possibleTypes,
    fragments: createFragmentRegistry(
      RecipeFragment,
      RecipeConnectionFragment,
      PaginationFragment,
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
  };
}
