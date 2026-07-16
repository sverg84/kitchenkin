import { z } from "zod";

export const allergenSchema = z.enum([
  "Dairy",
  "Eggs",
  "Fish",
  "Peanuts",
  "Sesame",
  "Shellfish",
  "Soy",
  "TreeNuts",
  "Wheat",
]);

export type AllergenLabel = z.infer<typeof allergenSchema>;

/** Canonical allergen labels for prompts and allowlists (matches Prisma enum). */
export const ALLERGEN_LABELS = allergenSchema.options;

/**
 * Bedrock allergen JSON: `{ allergens: AllergenLabel[] }`.
 * Unknown labels fail validation. Recognized labels are deduped and sorted.
 */
export const bedrockAllergensResponseSchema = z
  .object({
    allergens: z.array(allergenSchema),
  })
  .transform(({ allergens }): AllergenLabel[] => {
    const seen = new Set<string>();
    const out: AllergenLabel[] = [];
    for (const item of allergens) {
      if (seen.has(item)) continue;
      seen.add(item);
      out.push(item);
    }
    out.sort((a, b) => a.localeCompare(b));
    return out;
  });
