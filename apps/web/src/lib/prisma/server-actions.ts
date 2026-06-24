"use server";

import { auth } from "@/auth";
import {
  createRecipeInputSchema,
  updateRecipeInputSchema,
  type CreateRecipeInput,
  type UpdateRecipeInput,
} from "@kk/shared";
import {
  createRecipeForUser,
  updateRecipeForUser,
  deleteRecipeForUser,
} from "@kk/domain";
import { redirect } from "next/navigation";

async function authorizedInvariant(): Promise<string> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized. Please log in.");
  }

  return session.user.id;
}

export async function createRecipe(
  _previousState: string | null,
  data: unknown,
) {
  let recipeId: string | null = null;
  try {
    const userId = await authorizedInvariant();
    const input = createRecipeInputSchema.parse(data) satisfies CreateRecipeInput;
    const recipe = await createRecipeForUser(userId, input);
    recipeId = recipe.id;
  } catch (error) {
    if (error instanceof Error) {
      return error.message;
    }
  }

  redirect(`/recipe/${recipeId!}`);
}

export async function updateRecipe(
  _previousState: string | null,
  data: unknown,
) {
  let recipeId: string | null = null;

  try {
    const userId = await authorizedInvariant();
    const input = updateRecipeInputSchema.parse(data) satisfies UpdateRecipeInput;
    const recipe = await updateRecipeForUser(userId, input);
    recipeId = recipe.id;
  } catch (error) {
    if (error instanceof Error) {
      return error.message;
    }
  }

  redirect(`/recipe/${recipeId!}`);
}

export async function deleteRecipe(id: string) {
  const userId = await authorizedInvariant();
  await deleteRecipeForUser(userId, id);
  redirect("/");
}
