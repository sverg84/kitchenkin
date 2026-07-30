import { imageCreateHandler } from "@kk/domain";
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
    const image = data.get("image") as File | null;

    if (!image) {
      return jsonError("No image provided", 400);
    }

    const encoded = Buffer.from(await image.arrayBuffer()).toString("base64");

    const lambdaResponse = await imageCreateHandler({
      fileName: image.name,
      fileType: image.type,
      encoded,
    });

    return jsonResponse(lambdaResponse);
  } catch (error) {
    return handleDomainError(error);
  }
}
