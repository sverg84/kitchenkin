import {
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { createHash } from "crypto";
import sharp from "sharp";

const s3 = new S3Client({ region: "us-west-1" });

function hashImage(imageBuffer) {
  const hash = createHash("sha256");
  hash.update(imageBuffer);
  return hash.digest("hex");
}

export const handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const imageBase64 = body.image;
    const fileName = body.fileName;
    const fileType = body.fileType;

    const isDev = event.headers["x-env"] === "development";

    const BUCKET_NAME = isDev ? "kitchenkin-local" : "kitchenkin";
    const CLOUDFRONT_URL = isDev
      ? "https://d32xnewsgayu64.cloudfront.net"
      : "https://d2uormq82zl5xd.cloudfront.net";

    if (!imageBase64 || !fileName || !fileType) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "No image provided" }),
      };
    }
    const buffer = Buffer.from(imageBase64, "base64");
    const imageHash = hashImage(buffer);

    const listResult = await s3.send(
      new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: `${imageHash}`,
        MaxKeys: 1,
      }),
    );

    if (listResult.KeyCount !== 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          id: imageHash,
          src: `${CLOUDFRONT_URL}/${listResult.Contents[0].Key}`,
        }),
      };
    }

    const webpKey = `${imageHash}.webp`;
    const webpBuffer = await sharp(buffer).toFormat("webp").toBuffer();

    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: webpKey,
        Body: webpBuffer,
        ContentType: "image/webp",
      }),
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        id: imageHash,
        src: `${CLOUDFRONT_URL}/${webpKey}`,
      }),
    };
  } catch (error) {
    console.error("Error processing image:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Image upload failed" }),
    };
  }
};
