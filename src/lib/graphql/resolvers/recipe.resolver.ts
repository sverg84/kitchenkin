import {
  Resolver,
  Query,
  Mutation,
  Arg,
  Ctx,
  Authorized,
  ID,
} from "type-graphql";
import { RecipeEntity } from "../entities/recipe";
import { CreateRecipeInput, UpdateRecipeInput } from "../inputs/recipe-input";
import { prisma } from "@/lib/prisma";
import type { GraphQLContext } from "../context";
import type { ImageInput } from "../inputs/image-input";
import type { IngredientInput } from "../inputs/ingredient-input";

const fileTypes = [
  "image/jpg",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];
const validFileTypes = new Set(fileTypes);

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

    const imageData = imageInput
      ? await imageCreateHandler(imageInput)
      : undefined;

    return await prisma.recipe.create({
      data: {
        ...recipeData,
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
    @Arg("data") data: UpdateRecipeInput,
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

    const imageData = imageInput
      ? await imageCreateHandler(imageInput)
      : undefined;

    await prisma.$transaction(async (client) => {
      const deleteOperations = [];

      // If the image is replaced or removed, delete the old one
      if (imageInput === null || imageInput) {
        deleteOperations.push(client.image.delete({ where: { recipeId: id } }));
      }

      await client.recipe.update({
        where: { id },
        data: {
          ...recipeData,
          category: categoryId
            ? {
                connect: { id: categoryId },
              }
            : undefined,
          ingredients: ingredients
            ? ingredientsInputToDbOperation(ingredients)
            : undefined,
          image: imageData
            ? {
                create: imageData,
              }
            : undefined,
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
 * Invoke Lambda function, add image to S3, return CloudFront URLs
 * @param input the image input provided by the recipe form
 */
async function imageCreateHandler({ fileName, fileType, encoded }: ImageInput) {
  // The image must be of a valid MIME type
  if (!validFileTypes.has(fileType)) {
    throw new Error(`File must be an image of type: ${fileTypes.join(", ")}`);
  }

  const imageResponse = await fetch(process.env.IMAGE_UPLOAD_ENDPOINT!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fileName,
      fileType,
      image: encoded,
    }),
  });

  if (!imageResponse.ok) {
    const { error } = await imageResponse.json();
    throw new Error(error);
  }

  return await imageResponse.json();
}

/**
 * Invoke a Lambda function to delete all versions of an image from S3.
 *
 * It's okay if the Lambda function fails. This is mostly a side effect.
 * @param id The SHA256 hash ID of the image
 */
async function deleteImageInS3(id: string) {
  await fetch(process.env.IMAGE_DELETE_ENDPOINT!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id }),
  });
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
