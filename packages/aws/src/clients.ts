import "server-only";

import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";
import { S3Client } from "@aws-sdk/client-s3";

import {
  getAwsCredentials,
  getBedrockRegion,
  getS3Region,
} from "./env";

let bedrockClient: BedrockRuntimeClient | undefined;
let s3Client: S3Client | undefined;

/**
 * Provides the configured Bedrock Runtime client.
 *
 * @returns The cached Bedrock Runtime client
 */
export function getBedrockClient(): BedrockRuntimeClient {
  if (!bedrockClient) {
    bedrockClient = new BedrockRuntimeClient({
      region: getBedrockRegion(),
    });
  }
  return bedrockClient;
}

/**
 * Provides the configured Amazon S3 client.
 *
 * @returns The cached Amazon S3 client
 */
export function getS3Client(): S3Client {
  if (!s3Client) {
    s3Client = new S3Client({
      region: getS3Region(),
      credentials: getAwsCredentials(),
    });
  }
  return s3Client;
}
