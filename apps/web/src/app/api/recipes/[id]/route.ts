import {
  apiErrorCodes,
  updateRecipeInputSchema,
} from "@kk/shared";
import {
  deleteRecipeForUser,
  getRecipeById,
  updateRecipeForUser,
} from "@kk/domain";

import { requireUserId } from "@/lib/api/route-handler";
import {
  handleDomainError,
  jsonError,
  jsonResponse,
} from "@/lib/api/json-response";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const recipe = await getRecipeById(id);

    if (!recipe) {
      return jsonError("Recipe not found", 404, apiErrorCodes.NOT_FOUND);
    }

    return jsonResponse(recipe);
  } catch (error) {
    return handleDomainError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const userId = await requireUserId(request);
    const { id } = await context.params;
    const body = await request.json();
    const input = updateRecipeInputSchema.parse({ ...body, id });
    const recipe = await updateRecipeForUser(userId, input);
    return jsonResponse(recipe);
  } catch (error) {
    return handleDomainError(error);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const userId = await requireUserId(request);
    const { id } = await context.params;
    await deleteRecipeForUser(userId, id);
    return jsonResponse({ success: true });
  } catch (error) {
    return handleDomainError(error);
  }
}
