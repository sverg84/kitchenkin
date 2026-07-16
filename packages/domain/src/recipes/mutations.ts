import "server-only";

import type {
  CreateRecipeInput,
  IngredientInput,
  UpdateRecipeInput,
} from "@kk/shared";
import { prisma } from "@kk/db";

import { detectAllergens, deleteImageInS3 } from "@kk/aws";

import { ForbiddenError } from "../auth/errors";

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

async function assertRecipeAuthor(
  recipeId: string,
  userId: string,
): Promise<void> {
  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId, authorId: userId },
    select: { id: true },
  });

  if (!recipe) {
    throw new ForbiddenError("Not authorized to make changes to this recipe");
  }
}

export async function createRecipeForUser(
  userId: string,
  input: CreateRecipeInput,
): Promise<{ id: string }> {
  const { image: imageData, ingredients, categoryId, ...recipeData } = input;

  const allergens = await detectAllergens(input);

  const recipe = await prisma.recipe.create({
    data: {
      ...recipeData,
      allergens,
      category: { connect: { id: categoryId } },
      author: { connect: { id: userId } },
      ingredients: ingredientsInputToDbOperation(ingredients),
      image: imageData ? { create: imageData } : undefined,
    },
    select: { id: true },
  });

  return { id: recipe.id };
}

export async function updateRecipeForUser(
  userId: string,
  input: UpdateRecipeInput,
): Promise<{ id: string }> {
  await assertRecipeAuthor(input.id, userId);

  const {
    id,
    categoryId,
    ingredients,
    image: imageInput,
    ...recipeData
  } = input;

  const allergens =
    recipeData.title && ingredients
      ? await detectAllergens(input)
      : undefined;

  const recipe = await prisma.$transaction(async (client) => {
    if (imageInput === null || imageInput) {
      await client.image.deleteMany({ where: { recipeId: id } });
    }

    return client.recipe.update({
      where: { id },
      data: {
        ...recipeData,
        allergens,
        category: categoryId ? { connect: { id: categoryId } } : undefined,
        ingredients: ingredients
          ? {
              set: [],
              ...ingredientsInputToDbOperation(ingredients),
            }
          : undefined,
        image: imageInput ? { create: imageInput } : undefined,
      },
      select: { id: true },
    });
  });

  return { id: recipe.id };
}

export async function deleteRecipeForUser(
  userId: string,
  recipeId: string,
): Promise<void> {
  const existing = await prisma.recipe.findUnique({
    where: { id: recipeId, authorId: userId },
    select: { image: { select: { id: true } } },
  });

  if (!existing) {
    throw new ForbiddenError("Not authorized to make changes to this recipe");
  }

  const imageHashId = existing.image?.id;

  await prisma.recipe.delete({ where: { id: recipeId } });

  if (imageHashId) {
    await deleteImageInS3(imageHashId);
  }
}
