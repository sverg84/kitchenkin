import "server-only";

export type RecipeCursorPayload = {
  createdAt: string;
  id: string;
};

export function encodeRecipeCursor(payload: RecipeCursorPayload): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

export function decodeRecipeCursor(cursor: string): RecipeCursorPayload {
  let parsed: unknown;
  try {
    parsed = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"));
  } catch {
    throw new Error("Invalid cursor");
  }

  if (
    !parsed ||
    typeof parsed !== "object" ||
    typeof (parsed as Record<string, unknown>).createdAt !== "string" ||
    typeof (parsed as Record<string, unknown>).id !== "string"
  ) {
    throw new Error("Invalid cursor");
  }

  return parsed as RecipeCursorPayload;
}
