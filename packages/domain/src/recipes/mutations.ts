import "server-only";

import type {
  CreateRecipeInput,
  IngredientInput,
  RecipeTagLabel,
  UpdateRecipeInput,
} from "@kk/shared";
import { prisma } from "@kk/db";

import { detectAllergens, detectTags, deleteImageInS3 } from "@kk/aws";

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

async function resolveTags(
  inputTags: RecipeTagLabel[] | undefined,
  detectInput: Pick<UpdateRecipeInput, "title" | "description" | "ingredients">,
): Promise<RecipeTagLabel[] | undefined> {
  if (inputTags === undefined) return undefined;
  if (inputTags.length > 0) return inputTags;
  return detectTags(detectInput);
}

export async function createRecipeForUser(
  userId: string,
  input: CreateRecipeInput,
): Promise<{ id: string }> {
  const { image: imageData, ingredients, tags: inputTags, ...recipeData } =
    input;

  const allergens = await detectAllergens(input);
  const tags = await resolveTags(inputTags, input);

  const recipe = await prisma.recipe.create({
    data: {
      ...recipeData,
      allergens,
      tags: tags ?? [],
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
    tags: inputTags,
    ingredients,
    image: imageInput,
    ...recipeData
  } = input;

  const allergens =
    recipeData.title && ingredients
      ? await detectAllergens(input)
      : undefined;

  let detectInput: Pick<
    UpdateRecipeInput,
    "title" | "description" | "ingredients"
  > = {
    title: recipeData.title,
    description: recipeData.description,
    ingredients,
  };

  if (
    inputTags !== undefined &&
    inputTags.length === 0 &&
    (!detectInput.title || !detectInput.ingredients)
  ) {
    const existing = await prisma.recipe.findUniqueOrThrow({
      where: { id },
      select: {
        title: true,
        description: true,
        ingredients: {
          select: { name: true, amount: true, unit: true },
        },
      },
    });
    detectInput = {
      title: detectInput.title ?? existing.title,
      description: detectInput.description ?? existing.description,
      ingredients: detectInput.ingredients ?? existing.ingredients,
    };
  }

  const tags = await resolveTags(inputTags, detectInput);

  const recipe = await prisma.$transaction(async (client) => {
    if (imageInput === null || imageInput) {
      await client.image.deleteMany({ where: { recipeId: id } });
    }

    return client.recipe.update({
      where: { id },
      data: {
        ...recipeData,
        allergens,
        tags,
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

/**
 * Deletes a recipe owned by the specified user and its associated image asset.
 *
 * @throws `ForbiddenError` if the recipe does not belong to the user.
 */
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

  // Clean up S3 before removing the recipe so failed cleanup can be retried
  // on a later delete attempt while the recipe (and image hash) still exist.
  if (imageHashId) {
    await deleteImageInS3(imageHashId);
  }

  await prisma.recipe.delete({ where: { id: recipeId } });
}
