import "server-only";

import { InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import {
  ALLERGEN_LABELS,
  bedrockAllergensResponseSchema,
  type AllergenLabel,
  type UpdateRecipeInput,
} from "@kk/shared";

import { getBedrockClient } from "./clients";

const allergenList = ALLERGEN_LABELS.join(", ");

const systemMessage = `You respond with ONLY valid JSON — a single object with this exact shape:
{"allergens":["..."]}

Rules:
- Each string in "allergens" MUST be exactly one of: ${allergenList}.
- Do not use any other labels. Do not invent categories.
- If none apply, use "allergens": [].
- Include each allowed value at most once. Sort the array alphabetically (A–Z) by string value.
- Output raw JSON only: no markdown, no code fences, no text before or after the JSON.`;

/**
 * Removes an optional Markdown code fence from text and trims the result.
 *
 * @param text - The text that may be wrapped in a JSON or generic Markdown code fence
 * @returns The trimmed inner text or the trimmed original text
 */
function stripMarkdownFences(text: string): string {
  const trimmed = text.trim();
  const fence = /^```(?:json)?\s*\n?([\s\S]*?)\n?```$/;
  const m = trimmed.match(fence);
  return m ? m[1].trim() : trimmed;
}

/**
 * Detects the allergen categories present in a recipe using AWS Bedrock.
 *
 * @param input - The recipe title and ingredients to analyze
 * @returns The validated allergen categories identified in the recipe
 */
export async function detectAllergens(
  input: Pick<UpdateRecipeInput, "title" | "ingredients">,
): Promise<AllergenLabel[]> {
  const title = input.title ?? "";
  const ingredients = input.ingredients ?? [];

  const ingredientLines = ingredients.map((ingredient) =>
    `${ingredient.amount} ${ingredient.unit} ${ingredient.name}`.trim(),
  );

  const prompt = `You are an expert in food allergens. For the recipe below, list which of these categories apply: ${allergenList}.

Only include a category if the recipe clearly contains that allergen or a common derivative (e.g. whey implies Dairy).

Recipe title: ${title || "(none)"}

Ingredients (one per line):
${ingredientLines.length ? ingredientLines.join("\n") : "(none)"}`;

  let data: { content?: Array<{ text?: string }> };
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25_000);
  try {
    const command = new InvokeModelCommand({
      modelId: "global.anthropic.claude-haiku-4-5-20251001-v1:0",
      body: JSON.stringify({
        max_tokens: 256,
        temperature: 0,
        anthropic_version: "bedrock-2023-05-31",
        system: systemMessage,
        messages: [
          {
            role: "user",
            content: [{ type: "text", text: prompt }],
          },
        ],
      }),
      contentType: "application/json",
      accept: "application/json",
    });

    const resp = await getBedrockClient().send(command, {
      abortSignal: controller.signal,
    });
    data = JSON.parse(new TextDecoder().decode(resp.body));
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Bedrock invocation failed";
    throw new Error(message);
  } finally {
    clearTimeout(timeoutId);
  }

  const text = data?.content?.[0]?.text;
  if (typeof text !== "string") {
    throw new Error("Empty or invalid model response");
  }

  let rawJson: unknown;
  try {
    rawJson = JSON.parse(stripMarkdownFences(text));
  } catch {
    throw new Error("Model response was not valid JSON");
  }

  const result = bedrockAllergensResponseSchema.safeParse(rawJson);
  if (!result.success) {
    throw new Error('Model JSON must be an object with an "allergens" array');
  }

  return result.data;
}
