import { graphql } from "../generated";

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
