import {
  DeleteObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";

const s3 = new S3Client({ region: "us-west-1" });

export const handler = async (event) => {
  try {
    const isDev = event.headers["x-env"] === "development";
    const BUCKET_NAME = isDev ? "kitchenkin-local" : "kitchenkin";

    const body = JSON.parse(event.body);
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: `${body.id}`,
      MaxKeys: 1,
    });
    const listResult = await s3.send(command);

    if (listResult.KeyCount === 0) {
      return { statusCode: 204 };
    }

    await s3.send(
      new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: listResult.Contents[0].Key,
      }),
    );

    return { statusCode: 204 };
  } catch (error) {
    console.error("Error deleting image:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Image deletion failed" }),
    };
  }
};
