import { getClient } from "./client/apollo-client-server-factory";
import { graphql } from "@/lib/generated/graphql";

// Query definitions
export const GET_RECIPE = graphql(/* GraphQL */ `
  query GetRecipe($id: ID!) {
    recipe(id: $id) {
      ...Recipe_commonDetails
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
`);

export const GET_CATEGORIES = graphql(/* GraphQL */ `
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
`);

// Server-side fetch functions
export async function getRecipe(id: string) {
  const client = await getClient();

  try {
    const { data, error } = await client.query({
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

export async function getCategories() {
  const client = await getClient();

  try {
    const { data, error } = await client.query({
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
