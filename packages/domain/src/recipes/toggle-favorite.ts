import "server-only";

import { prisma } from "@kk/db";

export async function toggleFavorite(
  userId: string,
  recipeId: string,
): Promise<{ favorited: boolean }> {
  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId },
    select: {
      id: true,
      favoritedBy: {
        where: { id: userId },
        select: { id: true },
      },
    },
  });

  if (!recipe) {
    throw new Error("Recipe not found");
  }

  const isFavorited = recipe.favoritedBy.length > 0;

  if (isFavorited) {
    await prisma.recipe.update({
      where: { id: recipeId },
      data: {
        favoritedBy: { disconnect: { id: userId } },
      },
    });
    return { favorited: false };
  }

  await prisma.recipe.update({
    where: { id: recipeId },
    data: {
      favoritedBy: { connect: { id: userId } },
    },
  });

  return { favorited: true };
}
