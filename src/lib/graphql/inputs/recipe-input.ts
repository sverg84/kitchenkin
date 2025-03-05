import { InputType, Field } from "type-graphql"
import { IngredientInput } from "./ingredient-input"

@InputType()
export class CreateRecipeInput {
  @Field()
  title: string

  @Field()
  description: string

  @Field({ nullable: true })
  image?: string

  @Field()
  prepTime: string

  @Field()
  cookTime: string

  @Field()
  servings: number

  @Field(() => [String])
  instructions: string[]

  @Field()
  categoryId: string

  @Field(() => [IngredientInput])
  ingredients: IngredientInput[]
}

