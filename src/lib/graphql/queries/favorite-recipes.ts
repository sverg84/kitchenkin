import { graphql } from "@/lib/generated/graphql";

export const FAVORITE_RECIPES_QUERY = graphql(/* GraphQL */ `
  query FavoriteRecipes($first: Int!, $after: String) {
    recipes: favoriteRecipes(first: $first, after: $after) {
      id
      ...RecipeConnection_connection
      ...RecipeConnection_pagination
      exists
    }
  }
`);
