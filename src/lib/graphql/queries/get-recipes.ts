import { gql } from "@apollo/client";

export const RECIPES_QUERY = gql`
  query GetRecipes($first: Int!, $search: String) {
    recipes(first: $first, search: $search) {
      edges {
        node {
          ...Recipe_commonDetails
        }
      }
      pageInfo {
        hasNextPage
      }
    }
  }
`;
