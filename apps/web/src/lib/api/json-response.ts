import { NextResponse } from "next/server";
import { unstable_rethrow } from "next/navigation";

import {
  apiErrorCodes,
  type ApiError,
} from "@kk/shared";
import {
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "@kk/domain";

export function jsonResponse<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function jsonError(
  error: string,
  status: number,
  code?: string,
) {
  const body: ApiError = code ? { error, code } : { error };
  return NextResponse.json(body, { status });
}

export function handleDomainError(error: unknown) {
  // Cache Components / PPR bailouts must not become API 500s.
  unstable_rethrow(error);

  if (error instanceof UnauthorizedError) {
    return jsonError(error.message, 401, apiErrorCodes.UNAUTHORIZED);
  }
  if (error instanceof ForbiddenError) {
    return jsonError(error.message, 403, apiErrorCodes.FORBIDDEN);
  }
  if (error instanceof NotFoundError) {
    return jsonError(error.message, 404, apiErrorCodes.NOT_FOUND);
  }
  if (error instanceof Error && error.message === "Invalid cursor") {
    return jsonError(error.message, 400, apiErrorCodes.BAD_REQUEST);
  }
  console.error(error);
  return jsonError("Internal server error", 500);
}
