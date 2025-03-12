import { InputType, Field } from "type-graphql";
import { IngredientInput } from "./ingredient-input";
import { IsOptional } from "class-validator";
import { ImageInput } from "./image-input";

@InputType("GqlCreateRecipeInput")
export class CreateRecipeInput {
  @Field()
  title: string;

  @Field()
  description: string;

  @IsOptional()
  @Field(() => ImageInput, { nullable: true })
  image?: ImageInput;

  @Field()
  prepTime: string;

  @Field()
  cookTime: string;

  @Field()
  servings: number;

  @Field(() => [String])
  instructions: string[];

  @Field()
  categoryId: string;

  @Field(() => [IngredientInput])
  ingredients: IngredientInput[];
}
