"use client";

import { useMyRecipes } from "@/lib/query/hooks/use-recipes";

import { RecipeListShell } from "./recipe-list-shell";

interface MyRecipesListProps {
  emptyState?: React.ReactElement;
}

export default function MyRecipesList({
  emptyState,
}: Readonly<MyRecipesListProps>) {
  const query = useMyRecipes();

  return <RecipeListShell {...query} emptyState={emptyState} />;
}
