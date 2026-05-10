import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

const bedrockClient = new BedrockRuntimeClient({ region: "us-west-2" });

/** Matches Prisma `Allergen` enum in prisma/schema.prisma */
const ALLOWED_ALLERGENS = new Set([
  "Dairy",
  "Eggs",
  "Fish",
  "Peanuts",
  "Sesame",
  "Shellfish",
  "Soy",
  "TreeNuts",
  "Wheat",
]);

const systemMessage = `You respond with ONLY valid JSON — a single object with this exact shape:
{"allergens":["..."]}

Rules:
- Each string in "allergens" MUST be exactly one of: Dairy, Eggs, Fish, Peanuts, Sesame, Shellfish, Soy, TreeNuts, Wheat.
- Do not use any other labels. Do not invent categories.
- If none apply, use "allergens": [].
- Include each allowed value at most once. Sort the array alphabetically (A–Z) by string value.
- Output raw JSON only: no markdown, no code fences, no text before or after the JSON.`;

function stripMarkdownFences(text) {
  const trimmed = text.trim();
  const fence = /^```(?:json)?\s*\n?([\s\S]*?)\n?```$/;
  const m = trimmed.match(fence);
  return m ? m[1].trim() : trimmed;
}

/**
 * @param {unknown} parsed
 * @returns {string[] | null}
 */
function normalizeAllergens(parsed) {
  if (
    !parsed ||
    typeof parsed !== "object" ||
    !Array.isArray(parsed.allergens)
  ) {
    return null;
  }
  const seen = new Set();
  const out = [];
  for (const item of parsed.allergens) {
    if (
      typeof item !== "string" ||
      !ALLOWED_ALLERGENS.has(item) ||
      seen.has(item)
    ) {
      continue;
    }
    seen.add(item);
    out.push(item);
  }
  out.sort((a, b) => a.localeCompare(b));
  return out;
}

function jsonResponse(statusCode, payload) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  };
}

export const handler = async (event) => {
  let payload;
  try {
    const raw = event.body;
    if (raw == null || raw === "") {
      return jsonResponse(400, { message: "Request body is required" });
    }
    payload = typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch {
    return jsonResponse(400, { message: "Invalid JSON body" });
  }

  const title = typeof payload.title === "string" ? payload.title : "";
  const rawIngredients = payload.ingredients;
  const ingredients = Array.isArray(rawIngredients) ? rawIngredients : [];

  const ingredientLines = ingredients.map((ingredient) => {
    const amount = ingredient?.amount ?? "";
    const unit = ingredient?.unit ?? "";
    const name = ingredient?.name ?? "";
    return `${amount} ${unit} ${name}`.trim();
  });

  const prompt = `You are an expert in food allergens. For the recipe below, list which of these categories apply: Dairy, Eggs, Fish, Peanuts, Sesame, Shellfish, Soy, TreeNuts, Wheat.

Only include a category if the recipe clearly contains that allergen or a common derivative (e.g. whey implies Dairy).

Recipe title: ${title || "(none)"}

Ingredients (one per line):
${ingredientLines.length ? ingredientLines.join("\n") : "(none)"}`;

  let data;
  try {
    const command = new InvokeModelCommand({
      modelId: "anthropic.claude-haiku-4-5-20251001-v1:0",
      body: JSON.stringify({
        max_tokens: 256,
        temperature: 0,
        anthropic_version: "bedrock-2023-05-31",
        system: systemMessage,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt,
              },
            ],
          },
        ],
      }),
      contentType: "application/json",
      accept: "application/json",
    });

    const resp = await bedrockClient.send(command);
    data = JSON.parse(new TextDecoder().decode(resp.body));
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Bedrock invocation failed";
    return jsonResponse(502, { message });
  }

  const text = data?.content?.[0]?.text;
  if (typeof text !== "string") {
    return jsonResponse(502, { message: "Empty or invalid model response" });
  }

  let parsed;
  try {
    parsed = JSON.parse(stripMarkdownFences(text));
  } catch {
    return jsonResponse(502, { message: "Model response was not valid JSON" });
  }

  const allergens = normalizeAllergens(parsed);
  if (allergens === null) {
    return jsonResponse(502, {
      message: 'Model JSON must be an object with an "allergens" array',
    });
  }

  return jsonResponse(200, { allergens });
};
