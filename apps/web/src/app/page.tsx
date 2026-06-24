import { SearchBar } from "@/components/search-bar";
import PublicRecipeList from "@/components/recipe/list/public-recipe-list";
import { Suspense } from "react";
import RecipeSkeletonList from "@/components/recipe/list/recipe-skeleton-list";

export default function Home() {
  return (
    <main className="mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">Delicious Recipes</h1>
      <Suspense fallback={<div className="mb-8 h-10 rounded-md border" />}>
        <SearchBar className="mb-8" />
      </Suspense>
      <Suspense fallback={<RecipeSkeletonList />}>
        <PublicRecipeList />
      </Suspense>
    </main>
  );
}
