import { unstable_rethrow } from "next/navigation";
import { ZodError } from "zod";
import { apiErrorCodes, setFavoriteBodySchema } from "@kk/shared";
import { setFavorite } from "@kk/domain";

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

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonError(
        "Invalid request body",
        400,
        apiErrorCodes.INVALID_REQUEST_BODY,
      );
    }

    const { favorited } = setFavoriteBodySchema.parse(body);
    const result = await setFavorite(userId, id, favorited);
    return jsonResponse(result);
  } catch (error) {
    unstable_rethrow(error);
    if (error instanceof ZodError) {
      return jsonError("Invalid request body", 400, apiErrorCodes.BAD_REQUEST);
    }
    if (error instanceof Error && error.message === "Recipe not found") {
      return jsonError("Recipe not found", 404, apiErrorCodes.NOT_FOUND);
    }
    return handleDomainError(error);
  }
}
