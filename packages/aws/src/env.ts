/** Env reads for AWS clients — keep tiny; no secrets in logs. */

export function envStr(keys: readonly string[]): string {
  for (const k of keys) {
    const v = process.env[k];
    if (v?.trim()) return v.trim();
  }
  return "";
}

export function requireEnv(keys: readonly string[]): string {
  const v = envStr(keys);
  if (!v) {
    throw new Error(
      `Missing required env: ${keys[0]} (fallbacks ${keys.slice(1).join(", ") || "none"})`,
    );
  }
  return v;
}

export function getBedrockRegion(): string {
  return envStr(["AWS_BEDROCK_REGION"]) || "us-west-2";
}

export function getS3Region(): string {
  return envStr(["AWS_S3_REGION"]) || "us-west-1";
}

/** Prefer `AWS_S3_BUCKET`; else kitchenkin-local in development, kitchenkin otherwise. */
export function getS3Bucket(): string {
  const explicit = envStr(["AWS_S3_BUCKET"]);
  if (explicit) return explicit;
  return process.env.NODE_ENV === "development"
    ? "kitchenkin-local"
    : "kitchenkin";
}

export function getAwsCredentials(): {
  accessKeyId: string;
  secretAccessKey: string;
} {
  return {
    accessKeyId: requireEnv(["AWS_ACCESS_KEY_ID"]),
    secretAccessKey: requireEnv(["AWS_SECRET_ACCESS_KEY"]),
  };
}
