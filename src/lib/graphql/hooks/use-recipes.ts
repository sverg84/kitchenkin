"use client";

import type { Recipe } from "@/graphql";
import { useQuery } from "@apollo/client/react";
import { RECIPES_QUERY } from "../queries/get-recipes";

export function useRecipes() {
  const { data, loading, error } = useQuery<{ recipes: Recipe[] }>(
    RECIPES_QUERY
  );

  return {
    recipes: data?.recipes,
    loading,
    error,
  };
}
