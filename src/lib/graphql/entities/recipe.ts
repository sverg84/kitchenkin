import { ObjectType, Field, ID, registerEnumType } from "type-graphql";
import { CategoryEntity } from "./category";
import { IngredientEntity } from "./ingredient";
import { IsOptional } from "class-validator";
import { ImageEntity } from "./image";
import { Allergen } from "@prisma/client";

registerEnumType(Allergen, { name: "Allergen" });

@ObjectType("GqlRecipe")
export class RecipeEntity {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  description: string;

  @Field(() => ID)
  authorId: string;

  @IsOptional()
  @Field(() => ImageEntity, { nullable: true })
  image?: ImageEntity;

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

  @Field(() => [Allergen])
  allergens: Allergen[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
