import { graphql } from "@/lib/generated/graphql";

export const RECIPES_QUERY = graphql(/* GraphQL */ `
  query GetRecipes($first: Int!, $after: String, $search: String) {
    recipes(first: $first, after: $after, search: $search) {
      id
      ...RecipeConnection_connection
      ...RecipeConnection_pagination
      exists(search: $search)
    }
  }
`);
