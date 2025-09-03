import { gql } from "@apollo/client";

export const RecipeFragment = gql`
  fragment GqlRecipe_commonDetails on Recipe {
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
      optimized
      small
      medium
      large
    }
  }
`;
