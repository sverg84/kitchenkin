import { ObjectType, Field, ID } from "type-graphql";
import { CategoryEntity } from "./category";
import { IngredientEntity } from "./ingredient";
import { IsOptional } from "class-validator";

@ObjectType("GqlRecipe")
export class RecipeEntity {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  description: string;

  @IsOptional()
  @Field({ nullable: true })
  image?: string;

  @Field()
  prepTime: string;

  @Field()
  cookTime: string;

  @Field()
  servings: number;

  @Field(() => [String])
  instructions: string[];

  @Field(() => CategoryEntity)
  category: CategoryEntity;

  @Field(() => [IngredientEntity])
  ingredients: IngredientEntity[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
