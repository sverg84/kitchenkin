"use client";

import type { Recipe } from "@/lib/generated/graphql/graphql";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";

const GET_RECIPES = gql`
  query GetRecipes {
    recipes {
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

export function useRecipes() {
  const { data, loading, error } = useQuery<{ recipes: Recipe[] }>(GET_RECIPES);

  return {
    recipes: data?.recipes,
    loading,
    error,
  };
}
