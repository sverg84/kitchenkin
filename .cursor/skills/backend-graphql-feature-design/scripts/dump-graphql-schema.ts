import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { printSchema } from "graphql";

async function main() {
  const outputArgIndex = process.argv.findIndex((arg) => arg === "--out");
  const outputRelative =
    outputArgIndex !== -1
      ? process.argv[outputArgIndex + 1]
      : ".tmp/schema.graphql";

  const outputPath = path.resolve(process.cwd(), outputRelative);

  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const schemaModulePath = path.join(
    scriptDir,
    "../../../../packages/api/src/schema/index.ts",
  );
  const { default: builder } = await import(schemaModulePath);
  const schema = builder.toSchema();
  const sdl = printSchema(schema);

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, `${sdl}\n`, "utf8");

  console.log(`[dump-graphql-schema] wrote ${outputRelative}`);
}

main().catch((error) => {
  console.error(
    `[dump-graphql-schema] error: ${error.message}\n[dump-graphql-schema] hint: local database access may be required to construct this schema in the current project setup`,
  );
  process.exit(1);
});
