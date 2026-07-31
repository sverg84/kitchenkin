import { paginationQuerySchema } from "@kk/shared";
import { listMyRecipes } from "@kk/domain";

import { requireUserId } from "@/lib/api/route-handler";
import { handleDomainError, jsonResponse } from "@/lib/api/json-response";

export async function GET(request: Request) {
  try {
    const userId = await requireUserId(request);
    const { searchParams } = new URL(request.url);
    const query = paginationQuerySchema.parse({
      first: searchParams.get("first") ?? undefined,
      after: searchParams.get("after") ?? undefined,
    });

    const connection = await listMyRecipes(userId, query);
    return jsonResponse(connection);
  } catch (error) {
    return handleDomainError(error);
  }
}
