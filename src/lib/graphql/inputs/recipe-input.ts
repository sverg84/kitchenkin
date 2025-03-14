import { InputType, Field, ID, Int } from "type-graphql";
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

@InputType("GqlUpdateRecipeInput")
export class UpdateRecipeInput {
  @Field(() => ID)
  id: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  title?: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  description?: string;

  @IsOptional()
  @Field(() => ImageInput, { nullable: true })
  image?: ImageInput | null;

  @IsOptional()
  @Field(() => String, { nullable: true })
  prepTime?: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  cookTime?: string;

  @IsOptional()
  @Field(() => Int, { nullable: true })
  servings?: number;

  @IsOptional()
  @Field(() => [String], { nullable: true })
  instructions?: string[];

  @IsOptional()
  @Field(() => String, { nullable: true })
  categoryId?: string;

  @IsOptional()
  @Field(() => [IngredientInput], { nullable: true })
  ingredients?: IngredientInput[];
}
