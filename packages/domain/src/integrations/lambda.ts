import "server-only";

import type { Allergen } from "@kk/db";
import type { UpdateRecipeInput } from "@kk/shared";

const fileTypes = [
  "image/jpg",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];
const validFileTypes = new Set(fileTypes);

type ImageHandlerInput = {
  fileName: string;
  fileType: string;
  encoded: string;
};

export async function imageCreateHandler({
  fileName,
  fileType,
  encoded,
}: ImageHandlerInput) {
  if (!validFileTypes.has(fileType)) {
    throw new Error(`File must be an image of type: ${fileTypes.join(", ")}`);
  }

  const imageResponse = await fetch(process.env.IMAGE_UPLOAD_ENDPOINT!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-env": process.env.NODE_ENV ?? "development",
    },
    body: JSON.stringify({
      fileName,
      fileType,
      image: encoded,
    }),
  });

  if (!imageResponse.ok) {
    const { message } = await imageResponse.json();
    throw new Error(message);
  }

  return await imageResponse.json();
}

export async function deleteImageInS3(id: string) {
  await fetch(process.env.IMAGE_DELETE_ENDPOINT!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-env": process.env.NODE_ENV ?? "development",
    },
    body: JSON.stringify({ id }),
  });
}

export async function detectAllergens(
  input: Pick<UpdateRecipeInput, "title" | "ingredients">,
): Promise<Allergen[]> {
  const response = await fetch(process.env.DETECT_ALLERGENS_ENDPOINT!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const { message } = await response.json();
    throw new Error(message);
  }

  const { allergens } = await response.json();

  return allergens as Allergen[];
}
