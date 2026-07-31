import { unstable_rethrow } from "next/navigation";
import { apiErrorCodes } from "@kk/shared";
import { toggleFavorite } from "@kk/domain";

import { requireUserId } from "@/lib/api/route-handler";
import {
  handleDomainError,
  jsonError,
  jsonResponse,
} from "@/lib/api/json-response";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  try {
    const userId = await requireUserId(request);
    const { id } = await context.params;
    const result = await toggleFavorite(userId, id);
    return jsonResponse(result);
  } catch (error) {
    unstable_rethrow(error);
    if (error instanceof Error && error.message === "Recipe not found") {
      return jsonError("Recipe not found", 404, apiErrorCodes.NOT_FOUND);
    }
    return handleDomainError(error);
  }
}
