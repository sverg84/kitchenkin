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

function requireImageUploadEndpoint(): string {
  const endpoint = process.env.IMAGE_UPLOAD_ENDPOINT?.trim();
  if (!endpoint) {
    throw new Error("Missing required env: IMAGE_UPLOAD_ENDPOINT");
  }
  return endpoint;
}

/** Upload/convert image via Lambda Function URL; returns CloudFront id + src. */
export async function imageCreateHandler({
  fileName,
  fileType,
  encoded,
}: ImageHandlerInput) {
  if (!validFileTypes.has(fileType)) {
    throw new Error(`File must be an image of type: ${fileTypes.join(", ")}`);
  }

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
  });

  if (!imageResponse.ok) {
    const { message } = await imageResponse.json();
    throw new Error(message);
  }

  return await imageResponse.json();
}
