import "server-only";

import { prisma } from "@kk/db";

import { mapRecipeToDto, recipeDetailSelect } from "./recipe-select";

export async function getRecipeById(id: string) {
  const recipe = await prisma.recipe.findUnique({
    where: { id },
    select: recipeDetailSelect,
  });

  if (!recipe) {
    return null;
  }

  return mapRecipeToDto(recipe);
}
