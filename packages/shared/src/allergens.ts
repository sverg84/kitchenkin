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
 * Bedrock allergen JSON: requires `{ allergens: unknown[] }`, then filters to
 * known enum values, dedupes, and sorts (lenient — ignores hallucinated labels).
 */
export const bedrockAllergensResponseSchema = z
  .object({
    allergens: z.array(z.unknown()),
  })
  .transform(({ allergens }): AllergenLabel[] => {
    const seen = new Set<string>();
    const out: AllergenLabel[] = [];
    for (const item of allergens) {
      const parsed = allergenSchema.safeParse(item);
      if (!parsed.success || seen.has(parsed.data)) continue;
      seen.add(parsed.data);
      out.push(parsed.data);
    }
    out.sort((a, b) => a.localeCompare(b));
    return out;
  });
