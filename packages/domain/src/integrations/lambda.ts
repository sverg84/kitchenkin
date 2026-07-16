import "server-only";

const fileTypes = [
  "image/jpg",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
] as const;

const validFileTypes = new Set<string>(fileTypes);

type ImageHandlerInput = {
  fileName: string;
  fileType: string;
  encoded: string;
};

/**
 * Retrieves the configured image upload endpoint.
 *
 * @returns The trimmed image upload endpoint.
 * @throws If `IMAGE_UPLOAD_ENDPOINT` is missing or empty.
 */
function requireImageUploadEndpoint(): string {
  const endpoint = process.env.IMAGE_UPLOAD_ENDPOINT?.trim();
  if (!endpoint) {
    throw new Error("Missing required env: IMAGE_UPLOAD_ENDPOINT");
  }
  return endpoint;
}

/**
 * Uploads an image for processing and provides its hosted location.
 *
 * @param fileName - The name of the image file
 * @param fileType - The image MIME type
 * @param encoded - The encoded image data
 * @returns The uploaded image's CloudFront identifier and source URL
 */
export async function imageCreateHandler({
  fileName,
  fileType,
  encoded,
}: ImageHandlerInput) {
  if (!validFileTypes.has(fileType)) {
    throw new Error(`File must be an image of type: ${fileTypes.join(", ")}`);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60_000);
  try {
    const imageResponse = await fetch(requireImageUploadEndpoint(), {
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
      signal: controller.signal,
    });

    if (!imageResponse.ok) {
      const { message } = await imageResponse.json();
      throw new Error(message);
    }

    return await imageResponse.json();
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("Image upload timed out");
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}
