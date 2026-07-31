import "server-only";

import { prisma } from "@kk/db";

/**
 * Sets whether the user has favorited a recipe (idempotent).
 *
 * Always issues the corresponding Prisma relation update so concurrent
 * requests converge on the requested state.
 *
 * @returns The resulting favorited state after the operation.
 * @throws Error with message "Recipe not found" when the recipe does not exist.
 */
export async function setFavorite(
  userId: string,
  recipeId: string,
  favorited: boolean,
): Promise<{ favorited: boolean }> {
  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId },
    select: { id: true },
  });

  if (!recipe) {
    throw new Error("Recipe not found");
  }

  if (favorited) {
    await prisma.recipe.update({
      where: { id: recipeId },
      data: {
        favoritedBy: { connect: { id: userId } },
      },
    });
    return { favorited: true };
  }

  await prisma.recipe.update({
    where: { id: recipeId },
    data: {
      favoritedBy: { disconnect: { id: userId } },
    },
  });

  return { favorited: false };
}
