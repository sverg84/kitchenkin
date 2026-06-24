import { z } from "zod";

import { connectionSchema } from "./pagination";
import { categoryDtoSchema } from "./recipe-dto";

export const categoryConnectionSchema = connectionSchema(categoryDtoSchema);
export type CategoryConnection = z.infer<typeof categoryConnectionSchema>;

export const categoriesListQuerySchema = z.object({
  first: z.coerce.number().int().min(1).max(100).default(100),
  after: z.string().optional(),
});

export type CategoriesListQuery = z.infer<typeof categoriesListQuerySchema>;
