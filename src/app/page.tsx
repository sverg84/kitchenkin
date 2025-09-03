import Link from "next/link";
import { RecipeCard } from "@/components/recipe/recipe-card";
import { SearchBar } from "@/components/search-bar";
import { getClient } from "@/lib/graphql/client/apollo-client-server-factory";
import { gql } from "@apollo/client";
import { type QueryRecipesConnection } from "@/lib/generated/graphql/graphql";

const query = gql`
  query GetRecipesLocal {
    recipes {
      edges {
        node {
          rawId
          title
          description
          prepTime
          cookTime
          category {
            name
          }
          image {
            small
            medium
            large
            optimized
          }
        }
      }
    }
  }
`;

async function getRecipes() {
  const client = await getClient();

  const result = await client.query<{ recipes: QueryRecipesConnection }>({
    query,
  });

  if (result.error) {
    throw result.error;
  }

  return result.data!.recipes.edges.map((edge) => edge.node);
}

export default async function Home() {
  const recipes = await getRecipes();

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
