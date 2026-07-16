import "server-only";

import { InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import {
  RECIPE_TAG_LABELS,
  bedrockTagsResponseSchema,
  type RecipeTagLabel,
  type UpdateRecipeInput,
} from "@kk/shared";

import { getBedrockClient } from "./clients";

const tagList = RECIPE_TAG_LABELS.join(", ");

const systemMessage = `You respond with ONLY valid JSON — a single object with this exact shape:
{"tags":["..."]}

Rules:
- Each string in "tags" MUST be exactly one of: ${tagList}.
- Do not use any other labels. Do not invent tags.
- If none apply, use "tags": [].
- Include each allowed value at most once. Sort the array alphabetically (A–Z) by string value.
- Prefer a small set (typically 1–5 tags) that best describe the recipe.
- Output raw JSON only: no markdown, no code fences, no text before or after the JSON.`;

function stripMarkdownFences(text: string): string {
  const trimmed = text.trim();
  const fence = /^```(?:json)?\s*\n?([\s\S]*?)\n?```$/;
  const m = trimmed.match(fence);
  return m ? m[1].trim() : trimmed;
}

/**
 * Suggests closed-allowlist recipe tags via AWS Bedrock.
 *
 * @param input - Recipe title, description, and ingredients to analyze
 * @returns Validated tags from the allowlist
 */
export async function detectTags(
  input: Pick<UpdateRecipeInput, "title" | "description" | "ingredients">,
): Promise<RecipeTagLabel[]> {
  const title = input.title ?? "";
  const description = input.description ?? "";
  const ingredients = input.ingredients ?? [];

  const ingredientLines = ingredients.map((ingredient) =>
    `${ingredient.amount} ${ingredient.unit} ${ingredient.name}`.trim(),
  );

  const prompt = `You are an expert recipe taxonomist. For the recipe below, choose which of these tags apply: ${tagList}.

Only include a tag when it clearly fits the recipe (cooking method, meal type, protein, or diet style).

Recipe title: ${title || "(none)"}

Description: ${description || "(none)"}

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

  const result = bedrockTagsResponseSchema.safeParse(rawJson);
  if (!result.success) {
    throw new Error('Model JSON must be an object with a "tags" array');
  }

  return result.data;
}
