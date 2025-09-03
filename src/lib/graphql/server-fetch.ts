import {
  QueryCategoriesConnection,
  QueryMyRecipesConnection,
  Recipe,
} from "../generated/graphql/graphql";
import { getClient } from "./client/apollo-client-server-factory";
import { gql } from "@apollo/client";

// Query definitions
export const GET_RECIPES = gql`
  query GetRecipesServer {
    recipes {
      __typename
    }
  }
`;

export const GET_RECIPE = gql`
  query GetRecipe($id: ID!) {
    recipe(id: $id) {
      ...GqlRecipe_commonDetails
      allergens
      author {
        rawId
        name
      }
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
      edges {
        node {
          ...GqlRecipe_commonDetails
        }
      }
    }
  }
`;

export const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      edges {
        node {
          rawId
          name
        }
      }
    }
  }
`;

// Server-side fetch functions
export async function getRecipe(id: string) {
  const client = await getClient();

  try {
    const { data, error } = await client.query<{ recipe: Recipe }>({
      query: GET_RECIPE,
      variables: { id },
    });

    if (error) {
      throw error;
    }

    return data!.recipe;
  } catch (error) {
    console.error("Error fetching recipe:", error);
    return null;
  }
}

export async function getRecipesByUser() {
  const client = await getClient();

  try {
    const { data, error } = await client.query<{
      myRecipes: QueryMyRecipesConnection;
    }>({
      query: GET_MY_RECIPES,
    });

    if (error) {
      throw error;
    }

    return data!.myRecipes.edges?.map((edge) => edge?.node);
  } catch (error) {
    console.error("Error fetching user recipes:", error);
    return [];
  }
}

export async function getCategories() {
  const client = await getClient();

  try {
    const { data, error } = await client.query<{
      categories: QueryCategoriesConnection;
    }>({
      query: GET_CATEGORIES,
    });

    if (error) {
      throw error;
    }

    return data!.categories.edges?.map((edge) => edge?.node);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}
