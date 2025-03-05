import Link from "next/link";
import { RecipeCard } from "@/components/recipe-card";
import { SearchBar } from "@/components/search-bar";
import { getRecipes } from "@/lib/graphql/server-fetch";

export default async function Home() {
  const recipes = await getRecipes();

  return (
    <main className="mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">Delicious Recipes</h1>
      <SearchBar className="mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes?.map((recipe) => (
          <Link key={recipe.id} href={`/recipes/${recipe.id}`}>
            <RecipeCard recipe={recipe} />
          </Link>
        ))}
      </div>
    </main>
  );
}
