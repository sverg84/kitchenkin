import Link from "next/link";
import { RecipeCard } from "@/components/recipe/recipe-card";
import { SearchBar } from "@/components/search-bar";
import { getClient } from "@/lib/graphql/client/apollo-client-server-factory";
import type { QueryRecipesConnection } from "@/graphql";
import { RECIPES_QUERY } from "@/lib/graphql/queries/get-recipes";

const PAGE_SIZE = 24;

async function getRecipes(search?: string) {
  const client = await getClient();

  // await new Promise((resolve) => setTimeout(resolve, 5000));

  const result = await client.query<{ recipes: QueryRecipesConnection }>({
    query: RECIPES_QUERY,
    variables: { first: PAGE_SIZE, search },
  });

  if (result.error) {
    throw result.error;
  }

  return result.data!.recipes.edges.map((edge) => edge.node);
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search } = await searchParams;
  const recipes = await getRecipes(search);

  return (
    <main className="mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">Delicious Recipes</h1>
      <SearchBar className="mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes?.map((recipe) => (
          <Link key={recipe.rawId} href={`/recipe/${recipe.rawId}`}>
            <RecipeCard recipe={recipe} />
          </Link>
        ))}
      </div>
    </main>
  );
}
