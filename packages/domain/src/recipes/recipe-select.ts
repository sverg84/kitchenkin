import "server-only";

import type { RecipeDTO } from "@kk/shared";
import type { Prisma } from "@kk/db";

export const recipeDetailSelect = {
  id: true,
  title: true,
  description: true,
  prepTime: true,
  cookTime: true,
  servings: true,
  instructions: true,
  allergens: true,
  tags: true,
  image: { select: { src: true } },
  author: { select: { id: true, name: true } },
  ingredients: { select: { id: true, name: true, amount: true, unit: true } },
} satisfies Prisma.RecipeSelect;

export type RecipeDetailRecord = Prisma.RecipeGetPayload<{
  select: typeof recipeDetailSelect;
}>;

export type RecipeDetailWithFavorite = RecipeDetailRecord & {
  favoritedBy?: { id: string }[];
};

/**
 * Select for recipe reads. When `viewerUserId` is set, includes a filtered
 * `favoritedBy` relation (at most one row) for `isFavorited`.
 */
export function recipeSelectWithViewer(viewerUserId?: string | null) {
  if (!viewerUserId) {
    return recipeDetailSelect;
  }

  return {
    ...recipeDetailSelect,
    favoritedBy: {
      where: { id: viewerUserId },
      select: { id: true },
      take: 1,
    },
  } satisfies Prisma.RecipeSelect;
}

export function mapRecipeToDto(
  recipe: RecipeDetailWithFavorite,
  options?: { isFavorited?: boolean },
): RecipeDTO {
  const isFavorited =
    options?.isFavorited ??
    (Array.isArray(recipe.favoritedBy) ? recipe.favoritedBy.length > 0 : false);

  return {
    id: recipe.id,
    title: recipe.title,
    description: recipe.description,
    prepTime: recipe.prepTime,
    cookTime: recipe.cookTime,
    servings: recipe.servings,
    instructions: recipe.instructions,
    allergens: recipe.allergens,
    tags: recipe.tags,
    image: recipe.image ?? null,
    author: recipe.author,
    ingredients: recipe.ingredients,
    isFavorited,
  };
}
