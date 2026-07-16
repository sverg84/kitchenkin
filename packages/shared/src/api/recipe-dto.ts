import { z } from "zod";

import { allergenSchema } from "../allergens";
import { connectionSchema } from "./pagination";

export const categoryDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export type CategoryDTO = z.infer<typeof categoryDtoSchema>;

export const imageDtoSchema = z.object({
  src: z.string(),
});

export type ImageDTO = z.infer<typeof imageDtoSchema>;

export const authorDtoSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
});

export type AuthorDTO = z.infer<typeof authorDtoSchema>;

export const ingredientDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  amount: z.string(),
  unit: z.string(),
});

export type IngredientDTO = z.infer<typeof ingredientDtoSchema>;

/** Full recipe shape for detail views and list cards. */
export const recipeDtoSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  prepTime: z.string(),
  cookTime: z.string(),
  servings: z.number().int(),
  instructions: z.array(z.string()),
  category: categoryDtoSchema,
  image: imageDtoSchema.nullable().optional(),
  author: authorDtoSchema,
  ingredients: z.array(ingredientDtoSchema),
  allergens: z.array(allergenSchema),
});

export type RecipeDTO = z.infer<typeof recipeDtoSchema>;

/** List card subset — same fields, all required in schema for stable API responses. */
export const recipeListItemDtoSchema = recipeDtoSchema.pick({
  id: true,
  title: true,
  description: true,
  prepTime: true,
  cookTime: true,
  category: true,
  image: true,
});

export type RecipeListItemDTO = z.infer<typeof recipeListItemDtoSchema>;

export const recipeConnectionSchema = connectionSchema(recipeDtoSchema);
export type RecipeConnection = z.infer<typeof recipeConnectionSchema>;

export const recipesListQuerySchema = z.object({
  first: z.coerce.number().int().min(1).max(100).default(24),
  after: z.string().optional(),
  search: z.string().optional(),
});

export type RecipesListQuery = z.infer<typeof recipesListQuerySchema>;
