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
  category: { select: { id: true, name: true } },
  image: { select: { src: true } },
  author: { select: { id: true, name: true } },
  ingredients: { select: { id: true, name: true, amount: true, unit: true } },
} satisfies Prisma.RecipeSelect;

export type RecipeDetailRecord = Prisma.RecipeGetPayload<{
  select: typeof recipeDetailSelect;
}>;

export function mapRecipeToDto(recipe: RecipeDetailRecord): RecipeDTO {
  return {
    id: recipe.id,
    title: recipe.title,
    description: recipe.description,
    prepTime: recipe.prepTime,
    cookTime: recipe.cookTime,
    servings: recipe.servings,
    instructions: recipe.instructions,
    allergens: recipe.allergens,
    category: recipe.category,
    image: recipe.image ?? null,
    author: recipe.author,
    ingredients: recipe.ingredients,
  };
}
