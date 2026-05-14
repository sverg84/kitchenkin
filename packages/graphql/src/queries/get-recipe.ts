import { graphql } from "../generated";

export const GET_RECIPE = graphql(/* GraphQL */ `
  query GetRecipe($id: ID!) {
    recipe(id: $id) {
      ...Recipe_commonDetails
      allergens
      author {
        rawId
        name
      }
      servings
      ingredients {
        id
        name
        amount
        unit
      }
      instructions
    }
  }
`);
