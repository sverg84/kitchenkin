"use client";

import { gql } from "@apollo/client";
import { useLazyQuery } from "@apollo/client/react";
import type { Recipe } from "@/lib/generated/graphql/graphql";

const SEARCH_RECIPES = gql`
  query SearchRecipes($query: String!) {
    searchRecipes(query: $query) {
      edges {
        node {
          id
          title
          description
          prepTime
          cookTime
          category {
            name
          }
        }
      }
    }
  }
`;

export function useSearchRecipes() {
  const [searchRecipes, { data, loading, error }] = useLazyQuery<{
    searchRecipes: Recipe[];
  }>(SEARCH_RECIPES);

  const search = (query: string) => {
    searchRecipes({ variables: { query } });
  };

  return {
    search,
    results: data?.searchRecipes,
    loading,
    error,
  };
}
