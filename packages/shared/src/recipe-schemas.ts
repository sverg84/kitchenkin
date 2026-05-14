import { z } from "zod";

// Recipe prep/cook time is stored as "<n> min" or "<n> minutes".
export const recipeTimePattern = /^\d+\s?(min|minutes)$/;

// Ingredient amount accepts whole numbers ("2"), fractions ("1/2"),
// mixed numbers ("2 1/2"), or decimals with up to 2 places ("1.25").
export const ingredientAmountPattern =
  /^\d+(?: \d+\/\d+)?$|^\d+\/\d+$|^\d*(?:\.\d{1,2})?$/;

export const ingredientInputSchema = z.strictObject({
  name: z.string().trim().nonempty(),
  amount: z
    .string()
    .trim()
    .regex(
      ingredientAmountPattern,
      "Amount must be a whole number, a fraction, a mixed number, or a decimal with up to 2 decimal points (e.g., '2' or '1/2')",
    )
    .nonempty(),
  unit: z.string().trim().nonempty("Please select a unit"),
});

/**
 * Client-side image payload captured by the recipe form: a base64-encoded
 * blob plus filename/MIME type. The client uploads this to the image-upload
 * Lambda (via `/api/image-upload` on web), which returns a {@link ImageInput}.
 */
export const clientImageInputSchema = z.strictObject({
  encoded: z.base64().nonempty(),
  fileName: z.string().nonempty(),
  fileType: z.string().nonempty(),
});

/**
 * Persisted image reference attached to a recipe — the id (S3/CloudFront
 * key) and src URL returned by the image-upload Lambda. This is what the
 * server-side recipe create/update server actions receive after the
 * client has finished the upload step.
 */
export const imageInputSchema = z.strictObject({
  id: z.string().nonempty(),
  src: z.string().nonempty(),
});

/**
 * Common recipe fields shared by create and update flows on the server.
 * `image` here is the persisted {@link imageInputSchema} (post-upload).
 */
export const recipeInputBaseSchema = z.strictObject({
  title: z.string().trim().nonempty(),
  description: z.string().trim().nonempty(),
  prepTime: z.string().trim().regex(recipeTimePattern),
  cookTime: z.string().trim().regex(recipeTimePattern),
  servings: z.coerce.number().int().gt(0),
  categoryId: z.cuid(),
  instructions: z.array(z.string().trim().nonempty()),
  image: imageInputSchema.optional(),
  ingredients: ingredientInputSchema.array(),
});

/** Server-action payload for creating a recipe (no `type` discriminator). */
export const createRecipeInputSchema = recipeInputBaseSchema;

/** Server-action payload for updating a recipe — base + id. */
export const updateRecipeInputSchema = recipeInputBaseSchema.extend({
  id: z.string().cuid(),
});

// --- Client-form schemas (image is the raw base64 upload payload) ---

const recipeFormBaseSchema = recipeInputBaseSchema.extend({
  image: clientImageInputSchema.optional(),
});

const createRecipeFormSchema = recipeFormBaseSchema.extend({
  type: z.literal("create"),
});

const updateRecipeFormSchema = recipeFormBaseSchema.extend({
  type: z.literal("update"),
  id: z.string().cuid(),
});

/**
 * Discriminated union for react-hook-form (and equivalent client form
 * libraries). The form holds {@link clientImageInputSchema}-shaped data
 * until the client uploads the image, then replaces it with an
 * {@link imageInputSchema} for the server-action call.
 */
export const recipeFormSchema = z.discriminatedUnion("type", [
  createRecipeFormSchema,
  updateRecipeFormSchema,
]);

export type IngredientInput = z.infer<typeof ingredientInputSchema>;
export type ClientImageInput = z.infer<typeof clientImageInputSchema>;
export type ImageInput = z.infer<typeof imageInputSchema>;
export type CreateRecipeInput = z.infer<typeof createRecipeInputSchema>;
export type UpdateRecipeInput = z.infer<typeof updateRecipeInputSchema>;
export type RecipeFormData = z.infer<typeof recipeFormSchema>;
