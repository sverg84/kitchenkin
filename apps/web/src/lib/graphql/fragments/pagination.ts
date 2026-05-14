import { graphql } from "@/lib/generated/graphql";

export const PaginationFragment = graphql(/* GraphQL */ `
  fragment RecipeConnection_pagination on IRecipeConnection {
    pageInfo {
      endCursor
      hasNextPage
    }
  }
`);
