import { imageCreateHandler } from "@kk/domain";
import { apiErrorCodes } from "@kk/shared";
import { NextRequest } from "next/server";

import { requireUserId } from "@/lib/api/route-handler";
import {
  handleDomainError,
  jsonError,
  jsonResponse,
} from "@/lib/api/json-response";

export async function POST(req: NextRequest) {
  try {
    await requireUserId();

    const data = await req.formData();
    const image = data.get("image");

    if (!(image instanceof File)) {
      return jsonError("No image provided", 400, apiErrorCodes.BAD_REQUEST);
    }

    const encoded = Buffer.from(await image.arrayBuffer()).toString("base64");

    const lambdaResponse = await imageCreateHandler({
      fileName: image.name,
      fileType: image.type,
      encoded,
    });

    return jsonResponse(lambdaResponse);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.startsWith("File must be an image of type:")
    ) {
      return jsonError(error.message, 400, apiErrorCodes.BAD_REQUEST);
    }
    return handleDomainError(error);
  }
}
