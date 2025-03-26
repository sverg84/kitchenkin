"use server";

import { auth } from "@/auth";
import { AuthError } from "next-auth";
import type {
  CreateRecipeInput,
  UpdateRecipeInput,
} from "../graphql/inputs/recipe-input";
import {
  imageCreateHandler,
  detectAllergens,
  deleteImageInS3,
} from "@/lib/lambda";
import { IngredientInput } from "../graphql/inputs/ingredient-input";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

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

async function authorizedInvariant(): Promise<string> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new AuthError("Unauthorized. Please log in.");
  }

  return session.user.id;
}

/**
 * Throw an error if the acting user is not the same as the recipe's author
 * @param recipeId
 * @param userId
 */
async function recipeAuthorInvariant(recipeId: string): Promise<void> {
  const userId = await authorizedInvariant();
  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId, authorId: userId },
    select: { id: true },
  });

  if (!recipe) {
    throw new Error("Not authorized to make changes to this recipe");
  }
}

export async function createRecipe(
  _previousState: string | null,
  data: unknown
) {
  let recipe = null;
  try {
    const userId = await authorizedInvariant();

    const input = data as CreateRecipeInput;
    const { image: imageInput, ingredients, categoryId, ...recipeData } = input;

    const [imageData, allergens] = await Promise.all([
      imageInput ? imageCreateHandler(imageInput) : undefined,
      detectAllergens(input),
    ]);

    recipe = await prisma.recipe.create({
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
            id: userId,
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
  } catch (error) {
    if (error instanceof Error) {
      return error.message;
    }
  }

  redirect(`/recipe/${recipe!.id}`);
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
export async function updateRecipe(
  _previousState: string | null,
  data: unknown
) {
  let recipe = null;

  try {
    const input = data as UpdateRecipeInput;

    await recipeAuthorInvariant(input.id);

    const {
      id,
      categoryId,
      ingredients,
      image: imageInput,
      ...recipeData
    } = input;

    const [imageData, allergens] = await Promise.all([
      imageInput ? imageCreateHandler(imageInput) : undefined,
      recipeData.title && ingredients ? detectAllergens(input) : undefined,
    ]);

    recipe = await prisma.$transaction(async (client) => {
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
  } catch (error) {
    if (error instanceof Error) {
      return error.message;
    }
  }

  redirect(`/recipe/${recipe!.id}`);
}

export async function deleteRecipe(id: string) {
  await recipeAuthorInvariant(id);

  await Promise.all([
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

  redirect("/");
}
