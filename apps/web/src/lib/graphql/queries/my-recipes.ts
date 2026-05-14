import { graphql } from "@/lib/generated/graphql";

export const RECIPES_FOR_USER_QUERY = graphql(/* GraphQL */ `
  query RecipesForUserQuery($first: Int!, $after: String) {
    recipes: myRecipes(first: $first, after: $after) {
      id
      ...RecipeConnection_connection
      ...RecipeConnection_pagination
      exists
    }
  }
`);
