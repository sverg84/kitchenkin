/**
 * Resolves the first non-empty environment variable value from the provided keys.
 *
 * @param keys - Environment variable names to check in order
 * @returns The first trimmed non-empty value, or an empty string if none are set
 */

export function envStr(keys: readonly string[]): string {
  for (const k of keys) {
    const v = process.env[k];
    if (v?.trim()) return v.trim();
  }
  return "";
}

/**
 * Resolves the first configured environment variable from the provided keys.
 *
 * @param keys - Environment variable names checked in priority order
 * @returns The first non-empty trimmed environment value
 */
export function requireEnv(keys: readonly string[]): string {
  const v = envStr(keys);
  if (!v) {
    throw new Error(
      `Missing required env: ${keys[0]} (fallbacks ${keys.slice(1).join(", ") || "none"})`,
    );
  }
  return v;
}

/**
 * Gets the AWS Bedrock region from the environment or uses the default region.
 *
 * @returns The configured Bedrock region, or `"us-west-2"` when `AWS_BEDROCK_REGION` is empty or unset.
 */
export function getBedrockRegion(): string {
  return envStr(["AWS_BEDROCK_REGION"]) || "us-west-2";
}

/**
 * Resolves the AWS S3 region from the environment.
 *
 * @returns The configured `AWS_S3_REGION` value, or `"us-west-1"` when it is unset or empty.
 */
export function getS3Region(): string {
  return envStr(["AWS_S3_REGION"]) || "us-west-1";
}

/**
 * Resolves the S3 bucket name from the environment or development fallback.
 *
 * @returns The configured `AWS_S3_BUCKET` value, or `kitchenkin-local` in development.
 * @throws Error if the bucket is not configured outside development.
 */
export function getS3Bucket(): string {
  const explicit = envStr(["AWS_S3_BUCKET"]);
  if (explicit) return explicit;
  if (process.env.NODE_ENV === "development") {
    return "kitchenkin-local";
  }
  throw new Error(
    "Missing required env: AWS_S3_BUCKET (required when NODE_ENV is not development)",
  );
}

/**
 * Retrieves the required AWS access credentials from environment variables.
 *
 * @returns An object containing the AWS access key ID and secret access key
 */
export function getAwsCredentials(): {
  accessKeyId: string;
  secretAccessKey: string;
} {
  return {
    accessKeyId: requireEnv(["AWS_ACCESS_KEY_ID"]),
    secretAccessKey: requireEnv(["AWS_SECRET_ACCESS_KEY"]),
  };
}
