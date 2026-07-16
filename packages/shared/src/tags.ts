import { z } from "zod";

export const recipeTagSchema = z.enum([
  "Weeknight",
  "OnePot",
  "Bake",
  "Grill",
  "Stovetop",
  "Soup",
  "Salad",
  "Breakfast",
  "Dessert",
  "Vegetarian",
  "Vegan",
  "HighProtein",
  "Pasta",
  "Seafood",
  "Chicken",
  "Beef",
  "Pork",
]);

export type RecipeTagLabel = z.infer<typeof recipeTagSchema>;

/** Canonical recipe tag labels for prompts and allowlists (matches Prisma enum). */
export const RECIPE_TAG_LABELS = recipeTagSchema.options;

const TAG_DISPLAY_LABELS: Record<RecipeTagLabel, string> = {
  Weeknight: "Weeknight",
  OnePot: "One Pot",
  Bake: "Bake",
  Grill: "Grill",
  Stovetop: "Stovetop",
  Soup: "Soup",
  Salad: "Salad",
  Breakfast: "Breakfast",
  Dessert: "Dessert",
  Vegetarian: "Vegetarian",
  Vegan: "Vegan",
  HighProtein: "High Protein",
  Pasta: "Pasta",
  Seafood: "Seafood",
  Chicken: "Chicken",
  Beef: "Beef",
  Pork: "Pork",
};

/** Human-readable label for UI badges. */
export function formatRecipeTagLabel(tag: RecipeTagLabel): string {
  return TAG_DISPLAY_LABELS[tag];
}

/** Input tags array: allowlist values only, duplicates removed (first wins). */
export const recipeTagsInputSchema = z
  .array(recipeTagSchema)
  .transform((tags): RecipeTagLabel[] => {
    const seen = new Set<string>();
    const out: RecipeTagLabel[] = [];
    for (const tag of tags) {
      if (seen.has(tag)) continue;
      seen.add(tag);
      out.push(tag);
    }
    return out;
  });

/**
 * Bedrock tags JSON: requires `{ tags: unknown[] }`, then filters to known
 * enum values, dedupes, and sorts (lenient — ignores hallucinated labels).
 */
export const bedrockTagsResponseSchema = z
  .object({
    tags: z.array(z.unknown()),
  })
  .transform(({ tags }): RecipeTagLabel[] => {
    const seen = new Set<string>();
    const out: RecipeTagLabel[] = [];
    for (const item of tags) {
      const parsed = recipeTagSchema.safeParse(item);
      if (!parsed.success || seen.has(parsed.data)) continue;
      seen.add(parsed.data);
      out.push(parsed.data);
    }
    out.sort((a, b) => a.localeCompare(b));
    return out;
  });
