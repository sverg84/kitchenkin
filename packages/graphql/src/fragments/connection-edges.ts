import { graphql } from "../generated";

export const RecipeConnectionFragment = graphql(/* GraphQL */ `
  fragment RecipeConnection_connection on IRecipeConnection {
    edges {
      node {
        ...Recipe_commonDetails
      }
    }
  }
`);
