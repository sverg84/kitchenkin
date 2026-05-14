import { IngredientInput } from "./ingredient-input";
import { ImageInput } from "./image-input";

export class CreateRecipeInput {
  title: string;

  description: string;

  image?: ImageInput;

  prepTime: string;

  cookTime: string;

  servings: number;

  instructions: string[];

  categoryId: string;

  ingredients: IngredientInput[];
}

export class UpdateRecipeInput {
  id: string;

  title?: string;

  description?: string;

  image?: ImageInput | null;

  prepTime?: string;

  cookTime?: string;

  servings?: number;

  instructions?: string[];

  categoryId?: string;

  ingredients?: IngredientInput[];
}
