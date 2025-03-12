"use client";

import { gql, useLazyQuery } from "@apollo/client";
import type { RecipeEntity } from "../entities/recipe";

const SEARCH_RECIPES = gql`
  query SearchRecipes($query: String!) {
    searchRecipes(query: $query) {
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
`;

export function useSearchRecipes() {
  const [searchRecipes, { data, loading, error }] = useLazyQuery<{
    searchRecipes: RecipeEntity[];
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
