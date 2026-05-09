import { graphql } from "@/lib/generated/graphql";

export const RecipeFragment = graphql(/* GraphQL */ `
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
`);
