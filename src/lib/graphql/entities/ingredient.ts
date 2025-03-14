import { ObjectType, Field, ID } from "type-graphql";
import { RecipeEntity } from "./recipe";

@ObjectType("GqlIngredient")
export class IngredientEntity {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  amount: string;

  @Field()
  unit: string;

  @Field(() => [RecipeEntity])
  recipes: RecipeEntity[];
}
