import { gql } from "@apollo/client";

export const RecipeFragment = gql`
  fragment GqlRecipe_commonDetails on GqlRecipe {
    id
    title
    description
    prepTime
    cookTime
    category {
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
