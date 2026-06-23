import { categoriesListQuerySchema } from "@kk/shared";
import { listCategories } from "@kk/domain";

import { handleDomainError, jsonResponse } from "@/lib/api/json-response";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = categoriesListQuerySchema.parse({
      first: searchParams.get("first") ?? undefined,
      after: searchParams.get("after") ?? undefined,
    });

    const connection = await listCategories(query);
    return jsonResponse(connection);
  } catch (error) {
    return handleDomainError(error);
  }
}
