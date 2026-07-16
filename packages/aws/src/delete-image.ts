import "server-only";

import {
  DeleteObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";

import { getS3Client } from "./clients";
import { getS3Bucket } from "./env";

/**
 * Deletes the first S3 object whose key starts with the specified image hash.
 *
 * If no matching object exists, the operation completes without making a deletion.
 *
 * @param imageHashId - The image content hash used as the object key prefix
 */
export async function deleteImageInS3(imageHashId: string): Promise<void> {
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
}
