import { ObjectType, Field, ID } from "type-graphql";
import { RecipeEntity } from "./recipe";

@ObjectType("GqlCategory")
export class CategoryEntity {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => [RecipeEntity])
  recipes: RecipeEntity[];
}
