"use client";

import { useQuery } from "@apollo/client/react";
import { RECIPES_QUERY } from "../queries/get-recipes";
import { useFragment as getFragmentData } from "../generated";
import { RecipeConnectionFragment } from "../fragments/connection-edges";
import { RecipeFragment } from "../fragments/recipe";

export function useRecipes() {
  const { data, loading, error } = useQuery(RECIPES_QUERY, {
    variables: { first: 24 },
  });

  const connection = data?.recipes;
  const connectionData = getFragmentData(RecipeConnectionFragment, connection);
  const recipes =
    connectionData?.edges.map((edge) =>
      getFragmentData(RecipeFragment, edge.node),
    ) ?? [];

  return {
    recipes,
    loading,
    error,
  };
}
