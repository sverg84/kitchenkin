"use client";

import { useFavoriteRecipes } from "@/lib/query/hooks/use-recipes";

import { RecipeListShell } from "./recipe-list-shell";

interface FavoritesRecipeListProps {
  emptyState?: React.ReactElement;
}

export default function FavoritesRecipeList({
  emptyState,
}: Readonly<FavoritesRecipeListProps>) {
  const query = useFavoriteRecipes();

  return <RecipeListShell {...query} emptyState={emptyState} />;
}
