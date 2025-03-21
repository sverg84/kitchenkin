import { GraphQLDateTimeISO } from "graphql-scalars";
import * as TypeGraphQL from "type-graphql";
export { TypeGraphQL };
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type FixDecorator<T> = T;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar.This scalar is serialized to a string in ISO 8601 format and parsed from a string in ISO 8601 format. */
  DateTimeISO: any;
};

export enum Allergen {
  Dairy = "Dairy",
  Eggs = "Eggs",
  Fish = "Fish",
  Peanuts = "Peanuts",
  Sesame = "Sesame",
  Shellfish = "Shellfish",
  Soy = "Soy",
  TreeNuts = "TreeNuts",
  Wheat = "Wheat",
}
TypeGraphQL.registerEnumType(Allergen, { name: "Allergen" });

@TypeGraphQL.ObjectType()
export class GqlCategory {
  __typename?: "GqlCategory";

  @TypeGraphQL.Field((type) => TypeGraphQL.ID)
  id!: Scalars["ID"];

  @TypeGraphQL.Field((type) => String)
  name!: Scalars["String"];

  @TypeGraphQL.Field((type) => [GqlRecipe])
  recipes!: Array<GqlRecipe>;
}

@TypeGraphQL.InputType()
export class GqlCreateRecipeInput {
  @TypeGraphQL.Field((type) => String)
  categoryId!: Scalars["String"];

  @TypeGraphQL.Field((type) => String)
  cookTime!: Scalars["String"];

  @TypeGraphQL.Field((type) => String)
  description!: Scalars["String"];

  @TypeGraphQL.Field((type) => GqlImageInput, { nullable: true })
  image?: Maybe<GqlImageInput>;

  @TypeGraphQL.Field((type) => [GqlIngredientInput])
  ingredients!: Array<GqlIngredientInput>;

  @TypeGraphQL.Field((type) => [String])
  instructions!: Array<Scalars["String"]>;

  @TypeGraphQL.Field((type) => String)
  prepTime!: Scalars["String"];

  @TypeGraphQL.Field((type) => TypeGraphQL.Float)
  servings!: Scalars["Float"];

  @TypeGraphQL.Field((type) => String)
  title!: Scalars["String"];
}

@TypeGraphQL.ObjectType()
export class GqlImage {
  __typename?: "GqlImage";

  @TypeGraphQL.Field((type) => TypeGraphQL.ID)
  id!: Scalars["ID"];

  @TypeGraphQL.Field((type) => String)
  large!: Scalars["String"];

  @TypeGraphQL.Field((type) => String)
  medium!: Scalars["String"];

  @TypeGraphQL.Field((type) => String)
  optimized!: Scalars["String"];

  @TypeGraphQL.Field((type) => String)
  original!: Scalars["String"];

  @TypeGraphQL.Field((type) => String)
  small!: Scalars["String"];
}

@TypeGraphQL.InputType()
export class GqlImageInput {
  @TypeGraphQL.Field((type) => String)
  encoded!: Scalars["String"];

  @TypeGraphQL.Field((type) => String)
  fileName!: Scalars["String"];

  @TypeGraphQL.Field((type) => String)
  fileType!: Scalars["String"];
}

@TypeGraphQL.ObjectType()
export class GqlIngredient {
  __typename?: "GqlIngredient";

  @TypeGraphQL.Field((type) => String)
  amount!: Scalars["String"];

  @TypeGraphQL.Field((type) => TypeGraphQL.ID)
  id!: Scalars["ID"];

  @TypeGraphQL.Field((type) => String)
  name!: Scalars["String"];

  @TypeGraphQL.Field((type) => [GqlRecipe])
  recipes!: Array<GqlRecipe>;

  @TypeGraphQL.Field((type) => String)
  unit!: Scalars["String"];
}

@TypeGraphQL.InputType()
export class GqlIngredientInput {
  @TypeGraphQL.Field((type) => String)
  amount!: Scalars["String"];

  @TypeGraphQL.Field((type) => String)
  name!: Scalars["String"];

  @TypeGraphQL.Field((type) => String)
  unit!: Scalars["String"];
}

@TypeGraphQL.ObjectType()
export class GqlRecipe {
  __typename?: "GqlRecipe";

  @TypeGraphQL.Field((type) => [Allergen])
  allergens!: Array<Allergen>;

  @TypeGraphQL.Field((type) => TypeGraphQL.ID)
  authorId!: Scalars["ID"];

  @TypeGraphQL.Field((type) => GqlCategory)
  category!: FixDecorator<GqlCategory>;

  @TypeGraphQL.Field((type) => String)
  cookTime!: Scalars["String"];

  @TypeGraphQL.Field((type) => GraphQLDateTimeISO)
  createdAt!: Scalars["DateTimeISO"];

  @TypeGraphQL.Field((type) => String)
  description!: Scalars["String"];

  @TypeGraphQL.Field((type) => TypeGraphQL.ID)
  id!: Scalars["ID"];

  @TypeGraphQL.Field((type) => GqlImage, { nullable: true })
  image?: Maybe<GqlImage>;

  @TypeGraphQL.Field((type) => [GqlIngredient])
  ingredients!: Array<GqlIngredient>;

  @TypeGraphQL.Field((type) => [String])
  instructions!: Array<Scalars["String"]>;

  @TypeGraphQL.Field((type) => String)
  prepTime!: Scalars["String"];

  @TypeGraphQL.Field((type) => TypeGraphQL.Float)
  servings!: Scalars["Float"];

  @TypeGraphQL.Field((type) => String)
  title!: Scalars["String"];

  @TypeGraphQL.Field((type) => GraphQLDateTimeISO)
  updatedAt!: Scalars["DateTimeISO"];
}

@TypeGraphQL.InputType()
export class GqlUpdateRecipeInput {
  @TypeGraphQL.Field((type) => String, { nullable: true })
  categoryId?: Maybe<Scalars["String"]>;

  @TypeGraphQL.Field((type) => String, { nullable: true })
  cookTime?: Maybe<Scalars["String"]>;

  @TypeGraphQL.Field((type) => String, { nullable: true })
  description?: Maybe<Scalars["String"]>;

  @TypeGraphQL.Field((type) => TypeGraphQL.ID)
  id!: Scalars["ID"];

  @TypeGraphQL.Field((type) => GqlImageInput, { nullable: true })
  image?: Maybe<GqlImageInput>;

  @TypeGraphQL.Field((type) => [GqlIngredientInput], { nullable: true })
  ingredients?: Maybe<Array<GqlIngredientInput>>;

  @TypeGraphQL.Field((type) => [String], { nullable: true })
  instructions?: Maybe<Array<Scalars["String"]>>;

  @TypeGraphQL.Field((type) => String, { nullable: true })
  prepTime?: Maybe<Scalars["String"]>;

  @TypeGraphQL.Field((type) => TypeGraphQL.Int, { nullable: true })
  servings?: Maybe<Scalars["Int"]>;

  @TypeGraphQL.Field((type) => String, { nullable: true })
  title?: Maybe<Scalars["String"]>;
}

export type Mutation = {
  __typename?: "Mutation";
  createRecipe: GqlRecipe;
  deleteRecipe?: Maybe<GqlRecipe>;
  updateRecipe: GqlRecipe;
};

@TypeGraphQL.ArgsType()
export class MutationCreateRecipeArgs {
  @TypeGraphQL.Field((type) => GqlCreateRecipeInput)
  data!: FixDecorator<GqlCreateRecipeInput>;
}

@TypeGraphQL.ArgsType()
export class MutationDeleteRecipeArgs {
  @TypeGraphQL.Field((type) => String)
  id!: Scalars["String"];
}

@TypeGraphQL.ArgsType()
export class MutationUpdateRecipeArgs {
  @TypeGraphQL.Field((type) => GqlUpdateRecipeInput)
  data!: FixDecorator<GqlUpdateRecipeInput>;
}

export type Query = {
  __typename?: "Query";
  categories: Array<GqlCategory>;
  category?: Maybe<GqlCategory>;
  favoriteRecipes: Array<GqlRecipe>;
  myRecipes: Array<GqlRecipe>;
  recipe?: Maybe<GqlRecipe>;
  recipes: Array<GqlRecipe>;
  searchRecipes: Array<GqlRecipe>;
};

@TypeGraphQL.ArgsType()
export class QueryCategoryArgs {
  @TypeGraphQL.Field((type) => String)
  id!: Scalars["String"];
}

@TypeGraphQL.ArgsType()
export class QueryRecipeArgs {
  @TypeGraphQL.Field((type) => TypeGraphQL.ID)
  id!: Scalars["ID"];
}

@TypeGraphQL.ArgsType()
export class QuerySearchRecipesArgs {
  @TypeGraphQL.Field((type) => String)
  query!: Scalars["String"];
}
