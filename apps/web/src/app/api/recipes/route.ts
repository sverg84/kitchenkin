import { createRecipeInputSchema, recipesListQuerySchema } from "@kk/shared";
import { createRecipeForUser, listRecipes } from "@kk/domain";

import { getOptionalUserId, requireUserId } from "@/lib/api/route-handler";
import { handleDomainError, jsonResponse } from "@/lib/api/json-response";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = recipesListQuerySchema.parse({
      first: searchParams.get("first") ?? undefined,
      after: searchParams.get("after") ?? undefined,
      search: searchParams.get("search") ?? undefined,
    });

    const viewerUserId = await getOptionalUserId(request);
    const connection = await listRecipes({ ...query, viewerUserId });
    return jsonResponse(connection);
  } catch (error) {
    return handleDomainError(error);
  }
}

export async function POST(request: Request) {
  try {
    const userId = await requireUserId(request);
    const body = await request.json();
    const input = createRecipeInputSchema.parse(body);
    const recipe = await createRecipeForUser(userId, input);
    return jsonResponse(recipe, 201);
  } catch (error) {
    return handleDomainError(error);
  }
}
