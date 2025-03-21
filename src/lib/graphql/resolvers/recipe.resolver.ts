import {
  Resolver,
  Query,
  Mutation,
  Arg,
  Ctx,
  Authorized,
  ID,
  FieldResolver,
  Root,
} from "type-graphql";
import { RecipeEntity } from "../entities/recipe";
import { CreateRecipeInput, UpdateRecipeInput } from "../inputs/recipe-input";
import { prisma } from "@/lib/prisma";
import type { GraphQLContext } from "../context";
import type { IngredientInput } from "../inputs/ingredient-input";
import { deleteImageInS3, detectAllergens, imageCreateHandler } from "./lambda";

/**
 * For each ingredient input, if the input combination already exists,
 * connect to the existing DB entry. Otherwise, create a new DB entry.
 */
const ingredientsInputToDbOperation = (ingredients: IngredientInput[]) => ({
  connectOrCreate: ingredients.map((ingredient) => ({
    where: {
      name_amount_unit: {
        name: ingredient.name,
        amount: ingredient.amount,
        unit: ingredient.unit,
      },
    },
    create: ingredient,
  })),
});

@Resolver(RecipeEntity)
export class RecipeResolver {
  @FieldResolver(() => ID)
  async authorId(@Root() recipe: RecipeEntity): Promise<string> {
    const { authorId } = await prisma.recipe.findUniqueOrThrow({
      where: { id: recipe.id },
      select: { authorId: true },
    });

    return authorId;
  }

  @Query(() => [RecipeEntity])
  async recipes() {
    return await prisma.recipe.findMany({
      include: {
        category: true,
        ingredients: true,
        image: true,
      },
    });
  }

  @Query(() => RecipeEntity, { nullable: true })
  async recipe(@Arg("id", () => ID) id: string) {
    return await prisma.recipe.findUnique({
      where: { id },
      include: {
        category: true,
        ingredients: true,
        image: true,
      },
    });
  }

  @Query(() => [RecipeEntity])
  async searchRecipes(@Arg("query") query: string) {
    return await prisma.recipe.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
      include: {
        category: true,
        ingredients: true,
        image: true,
      },
    });
  }

  /**
   * Retrieve all Recipes authored by the acting user
   */
  @Authorized()
  @Query(() => [RecipeEntity])
  async myRecipes(@Ctx() { user }: GraphQLContext) {
    return await prisma.recipe.findMany({
      where: {
        authorId: user!.id,
      },
      include: {
        category: true,
        ingredients: true,
        image: true,
      },
    });
  }

  /**
   * Retrieve all Recipes that have been
   * marked as "Favorite" by the acting user
   */
  @Authorized()
  @Query(() => [RecipeEntity])
  async favoriteRecipes(@Ctx() { user }: GraphQLContext) {
    return await prisma.recipe.findMany({
      where: {
        favoritedBy: {
          some: { id: user!.id },
        },
      },
      include: {
        category: true,
        ingredients: true,
        image: true,
      },
    });
  }

  @Authorized()
  @Mutation(() => RecipeEntity)
  async createRecipe(
    @Arg("data", () => CreateRecipeInput) data: CreateRecipeInput,
    @Ctx() { user }: GraphQLContext
  ) {
    const { image: imageInput, ingredients, categoryId, ...recipeData } = data;

    const [imageData, allergens] = await Promise.all([
      imageInput ? imageCreateHandler(imageInput) : undefined,
      detectAllergens(data),
    ]);

    return await prisma.recipe.create({
      data: {
        ...recipeData,
        allergens,
        category: {
          connect: {
            id: categoryId,
          },
        },
        author: {
          connect: {
            id: user!.id,
          },
        },
        ingredients: ingredientsInputToDbOperation(ingredients),
        // Create an image *only* if input data for it exists
        image: imageData
          ? {
              create: imageData,
            }
          : undefined,
      },
      include: {
        category: true,
        ingredients: true,
        image: true,
      },
    });
  }

  /**
   * Update the data for a given recipe with whatever dirty
   * fields have been provided. If a value for a field is
   * provided, that field will be treated as "dirty" and updated
   * for the Recipe.
   *
   * If the "image" field is null and the Recipe has an
   * Image, that image will be removed from the Recipe.
   */
  @Authorized()
  @Mutation(() => RecipeEntity)
  async updateRecipe(
    @Arg("data", () => UpdateRecipeInput) data: UpdateRecipeInput,
    @Ctx() { user }: GraphQLContext
  ) {
    const {
      id,
      categoryId,
      ingredients,
      image: imageInput,
      ...recipeData
    } = data;
    await recipeAuthorInvariant(id, user!.id);

    const [imageData, allergens] = await Promise.all([
      imageInput ? imageCreateHandler(imageInput) : undefined,
      detectAllergens(data),
    ]);

    return await prisma.$transaction(async (client) => {
      // If the image is replaced or removed, delete the old one
      if (imageInput === null || imageInput) {
        await client.image.delete({ where: { recipeId: id } });
      }

      return await client.recipe.update({
        where: { id },
        data: {
          ...recipeData,
          allergens,
          category: categoryId
            ? {
                connect: { id: categoryId },
              }
            : undefined,
          ingredients: ingredients
            ? {
                set: [],
                ...ingredientsInputToDbOperation(ingredients),
              }
            : undefined,
          image: imageData
            ? {
                create: imageData,
              }
            : undefined,
        },
        include: {
          category: true,
          ingredients: true,
          image: true,
        },
      });
    });
  }

  @Authorized()
  @Mutation(() => RecipeEntity, { nullable: true })
  async deleteRecipe(@Arg("id") id: string, @Ctx() { user }: GraphQLContext) {
    await recipeAuthorInvariant(id, user!.id);

    const [_, recipe] = await Promise.all([
      deleteImageInS3(id),
      prisma.recipe.delete({
        where: { id },
        include: {
          category: true,
          ingredients: true,
          image: true,
        },
      }),
    ]);

    return recipe;
  }
}

/**
 * Throw an error if the acting user is not the same as the recipe's author
 * @param recipeId
 * @param userId
 */
async function recipeAuthorInvariant(
  recipeId: string,
  userId: string
): Promise<void> {
  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId },
    select: { authorId: true },
  });

  if (!recipe || recipe.authorId !== userId) {
    throw new Error("Not authorized to make changes to this recipe");
  }
}
