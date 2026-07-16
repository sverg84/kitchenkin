import "server-only";

import {
  DeleteObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";

import { getS3Client } from "./clients";
import { getS3Bucket } from "./env";

/**
 * Delete the first S3 object whose key is prefixed by the image content hash.
 * Logs errors; does not throw (fire-and-forget cleanup).
 */
export async function deleteImageInS3(imageHashId: string): Promise<void> {
  try {
    const bucket = getS3Bucket();
    const s3 = getS3Client();

    const listResult = await s3.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: imageHashId,
        MaxKeys: 1,
      }),
    );

    const key = listResult.Contents?.[0]?.Key;
    if (!key) return;

    await s3.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    );
  } catch (error) {
    console.error("Error deleting image from S3:", error);
  }
}
