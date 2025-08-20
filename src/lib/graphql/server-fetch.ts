import { getClient } from "./client/apollo-client-server-factory";
import { gql } from "@apollo/client";
import type { RecipeEntity } from "./entities/recipe";

// Query definitions
export const GET_RECIPES = gql`
  query GetRecipesServer {
    recipes {
      ...GqlRecipe_commonDetails
    }
  }
`;

export const GET_RECIPE = gql`
  query GetRecipe($id: ID!) {
    recipe(id: $id) {
      ...GqlRecipe_commonDetails
      allergens
      authorId
      authorName
      servings
      ingredients {
        id
        name
        amount
        unit
      }
      instructions
    }
  }
`;

export const GET_MY_RECIPES = gql`
  query GetMyRecipes {
    myRecipes {
      ...GqlRecipe_commonDetails
    }
  }
`;

export const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      id
      name
    }
  }
`;

// Server-side fetch functions
export async function getRecipes() {
  const client = await getClient();

  try {
    const { data } = await client.query<{ recipes: RecipeEntity[] }>({
      query: GET_RECIPES,
    });
    return data.recipes;
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return [];
  }
}

export async function getRecipe(id: string) {
  const client = await getClient();

  try {
    const { data } = await client.query<{ recipe: RecipeEntity }>({
      query: GET_RECIPE,
      variables: { id },
    });
    return data.recipe;
  } catch (error) {
    console.error("Error fetching recipe:", error);
    return null;
  }
}

export async function getRecipesByUser() {
  const client = await getClient();

  try {
    const { data } = await client.query<{ myRecipes: RecipeEntity[] }>({
      query: GET_MY_RECIPES,
    });
    return data.myRecipes;
  } catch (error) {
    console.error("Error fetching user recipes:", error);
    return [];
  }
}

export async function getCategories() {
  const client = await getClient();

  try {
    const { data } = await client.query<{
      categories: { id: string; name: string }[];
    }>({
      query: GET_CATEGORIES,
    });
    return data.categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}
