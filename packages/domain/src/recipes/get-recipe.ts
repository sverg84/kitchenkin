import "server-only";

import { prisma } from "@kk/db";

import {
  mapRecipeToDto,
  recipeSelectWithViewer,
} from "./recipe-select";

export async function getRecipeById(
  id: string,
  viewerUserId?: string | null,
) {
  const recipe = await prisma.recipe.findUnique({
    where: { id },
    select: recipeSelectWithViewer(viewerUserId),
  });

  if (!recipe) {
    return null;
  }

  return mapRecipeToDto(recipe);
}
