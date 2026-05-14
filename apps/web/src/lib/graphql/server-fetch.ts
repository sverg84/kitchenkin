import { getClient } from "./client/apollo-client-server-factory";
import { GET_RECIPE, GET_CATEGORIES } from "@kk/graphql";

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
