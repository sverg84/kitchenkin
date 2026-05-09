#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";

const SOURCE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);
const REDIS_METHODS = ["get", "set", "mget", "mset", "del", "expire"];

function parseArgs(argv) {
  const args = {
    root: "src",
    out: ".review/redis-cache-report.md",
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--root") {
      args.root = argv[i + 1] ?? args.root;
      i += 1;
      continue;
    }
    if (token === "--out") {
      args.out = argv[i + 1] ?? args.out;
      i += 1;
    }
  }
  return args;
}

async function walkFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkFiles(full)));
      continue;
    }
    if (entry.isFile() && SOURCE_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(full);
    }
  }

  return files;
}

function extractCalls(content) {
  const pattern = new RegExp(
    String.raw`redis\.(?<method>${REDIS_METHODS.join("|")})\s*\(\s*(?<key>[^,\n\)]+)`,
    "g"
  );

  const calls = [];
  let match;
  while ((match = pattern.exec(content)) !== null) {
    const lineNumber = content.slice(0, match.index).split("\n").length;
    calls.push({
      method: match.groups?.method ?? "unknown",
      keyExpression: (match.groups?.key ?? "").trim(),
      lineNumber,
    });
  }
  return calls;
}

function groupKeyShape(keyExpression) {
  const literal =
    (keyExpression.startsWith("'") && keyExpression.endsWith("'")) ||
    (keyExpression.startsWith('"') && keyExpression.endsWith('"')) ||
    (keyExpression.startsWith("`") && keyExpression.endsWith("`"));
  const value = literal ? keyExpression.slice(1, -1) : keyExpression;
  return value.replace(/\$\{[^}]+\}/g, "{expr}").replace(/\d+/g, "{n}");
}

function renderReport(repoRoot, callSites) {
  const lines = [
    "# Redis Cache Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Call Sites",
    "",
  ];

  if (callSites.length === 0) {
    lines.push("No redis usage found.");
    return `${lines.join("\n")}\n`;
  }

  for (const site of callSites) {
    lines.push(
      `- \`${site.method}\` \`${site.keyExpression}\` at \`${path.relative(
        repoRoot,
        site.file
      )}:${site.lineNumber}\``
    );
  }

  const shapeMap = new Map();
  for (const site of callSites) {
    const shape = groupKeyShape(site.keyExpression);
    shapeMap.set(shape, (shapeMap.get(shape) ?? 0) + 1);
  }

  lines.push("", "## Key Shapes", "");
  for (const [shape, count] of shapeMap.entries()) {
    lines.push(`- \`${shape}\` (${count})`);
  }

  lines.push(
    "",
    "## Suggested Invalidation Checklist",
    "",
    "- List write paths that touch cached entities.",
    "- For each write path, list key prefixes to invalidate.",
    "- Prefer prefix/version invalidation strategy over ad hoc key deletes.",
    "- Verify user-scoped caches include user identity in key shape."
  );

  return `${lines.join("\n")}\n`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const root = process.cwd();
  const sourceRoot = path.resolve(root, args.root);
  const files = await walkFiles(sourceRoot);
  const callSites = [];

  for (const file of files) {
    const content = await fs.readFile(file, "utf8");
    for (const call of extractCalls(content)) {
      callSites.push({ ...call, file });
    }
  }

  const outFile = path.resolve(root, args.out);
  await fs.mkdir(path.dirname(outFile), { recursive: true });
  await fs.writeFile(outFile, renderReport(root, callSites), "utf8");

  console.log(`[redis-cache-report] wrote ${args.out}`);
}

main().catch((error) => {
  console.error(`[redis-cache-report] error: ${error.message}`);
  process.exit(1);
});
