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

export function getBedrockClient(): BedrockRuntimeClient {
  if (!bedrockClient) {
    bedrockClient = new BedrockRuntimeClient({
      region: getBedrockRegion(),
      credentials: getAwsCredentials(),
    });
  }
  return bedrockClient;
}

export function getS3Client(): S3Client {
  if (!s3Client) {
    s3Client = new S3Client({
      region: getS3Region(),
      credentials: getAwsCredentials(),
    });
  }
  return s3Client;
}
