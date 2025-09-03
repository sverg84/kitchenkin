import type { Allergen } from "@prisma/client";
import type { UpdateRecipeInput } from "../graphql/inputs/recipe-input";

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

/**
 * Invoke Lambda function, add image to S3, return CloudFront URLs
 * @param {ImageHandlerInput} input the image input provided by the recipe form
 * @param {string} input.fileName the name of the uploaded image file
 * @param {string} input.fileType the MIME type of the image file
 * @param {string} input.encoded the base64 encoded image data
 * @async
 */
export async function imageCreateHandler({
  fileName,
  fileType,
  encoded,
}: ImageHandlerInput) {
  // The image must be of a valid MIME type
  if (!validFileTypes.has(fileType)) {
    throw new Error(`File must be an image of type: ${fileTypes.join(", ")}`);
  }

  const imageResponse = await fetch(process.env.IMAGE_UPLOAD_ENDPOINT!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
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

/**
 * Invoke a Lambda function to delete all versions of an image from S3.
 *
 * It's okay if the Lambda function fails. This is mostly a side effect.
 *
 * @param id The SHA256 hash ID of the image
 * @async
 */
export async function deleteImageInS3(id: string) {
  await fetch(process.env.IMAGE_DELETE_ENDPOINT!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id }),
  });
}

/**
 * Invoke a Lambda function to automatically detect allergens
 * in a recipe given its title and ingredients
 *
 * @param {Object} eekle The title and ingredients of a recipe form input
 * @returns {Promise<Allergen[]>}
 * @async
 */
export async function detectAllergens(
  eekle: Pick<UpdateRecipeInput, "title" | "ingredients">
): Promise<Allergen[]> {
  const response = await fetch(process.env.DETECT_ALLERGENS_ENDPOINT!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(eekle),
  });

  if (!response.ok) {
    const { message } = await response.json();
    throw new Error(message);
  }

  const { allergens } = await response.json();

  return allergens as Allergen[];
}
