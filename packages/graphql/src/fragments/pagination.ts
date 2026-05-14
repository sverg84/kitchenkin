import { graphql } from "../generated";

export const PaginationFragment = graphql(/* GraphQL */ `
  fragment RecipeConnection_pagination on IRecipeConnection {
    pageInfo {
      endCursor
      hasNextPage
    }
  }
`);
