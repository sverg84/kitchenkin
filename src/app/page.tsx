import { SearchBar } from "@/components/search-bar";
import RecipeList from "@/components/recipe/list/recipe-list";
import { PreloadQuery } from "@/lib/graphql/client/apollo-client-server-factory";
import { RECIPES_QUERY } from "@/lib/graphql/queries/get-recipes";
import { Suspense } from "react";
import RecipeSkeletonList from "@/components/recipe/list/recipe-skeleton-list";

export default function Home({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  return (
    <main className="mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">Delicious Recipes</h1>
      <Suspense fallback={<div className="mb-8 h-10 rounded-md border" />}>
        <SearchBar className="mb-8" />
      </Suspense>
      <Suspense fallback={<RecipeSkeletonList />}>
        <RecipeResults searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function RecipeResults({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search } = await searchParams;
  const variables = { first: 24, search };

  return (
    <PreloadQuery query={RECIPES_QUERY} variables={variables}>
      {(queryRef) => (
        <Suspense fallback={<RecipeSkeletonList />}>
          <RecipeList query="recipes" variables={variables} queryRef={queryRef} />
        </Suspense>
      )}
    </PreloadQuery>
  );
}
