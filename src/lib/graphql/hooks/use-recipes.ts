"use client";

import { gql, useQuery } from "@apollo/client";
import type { RecipeEntity } from "../entities/recipe";

const GET_RECIPES = gql`
  query GetRecipes {
    recipes {
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

export function useRecipes() {
  const { data, loading, error } = useQuery<{ recipes: RecipeEntity[] }>(
    GET_RECIPES
  );

  return {
    recipes: data?.recipes,
    loading,
    error,
  };
}
