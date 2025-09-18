import { gql } from "@apollo/client";

export const RecipeFragment = gql`
  fragment Recipe_commonDetails on Recipe {
    rawId
    title
    description
    prepTime
    cookTime
    category {
      rawId
      name
    }
    image {
      src
    }
  }
`;
