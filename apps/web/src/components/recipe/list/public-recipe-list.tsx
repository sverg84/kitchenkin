"use client";

import { useSearchParams } from "next/navigation";

import { useRecipes } from "@/lib/query/hooks/use-recipes";

import { RecipeListShell } from "./recipe-list-shell";

export default function PublicRecipeList() {
  const searchParams = useSearchParams();
  const search = searchParams.get("search");
  const query = useRecipes(search);

  return <RecipeListShell {...query} />;
}
