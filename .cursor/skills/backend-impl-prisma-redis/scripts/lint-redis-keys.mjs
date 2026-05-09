#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";

const SOURCE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);
const REDIS_METHODS = ["get", "set", "mget", "mset", "del", "expire"];

function parseArgs(argv) {
  const args = {
    root: "src",
    namespace: "kk",
    report: "",
    strict: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--root") {
      args.root = argv[i + 1] ?? args.root;
      i += 1;
      continue;
    }
    if (token === "--namespace") {
      args.namespace = argv[i + 1] ?? args.namespace;
      i += 1;
      continue;
    }
    if (token === "--report") {
      args.report = argv[i + 1] ?? "";
      i += 1;
      continue;
    }
    if (token === "--strict") {
      args.strict = true;
    }
  }

  return args;
}

async function walkFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkFiles(absolute)));
      continue;
    }
    if (entry.isFile() && SOURCE_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(absolute);
    }
  }

  return files;
}

function collectCalls(content) {
  const pattern = new RegExp(
    String.raw`redis\.(?:${REDIS_METHODS.join("|")})\s*\(\s*([^,\n\)]+)`,
    "g"
  );

  const calls = [];
  let match;
  while ((match = pattern.exec(content)) !== null) {
    const keyExpression = (match[1] ?? "").trim();
    const callText = match[0];
    const lineNumber = content.slice(0, match.index).split("\n").length;
    calls.push({ keyExpression, callText, lineNumber });
  }
  return calls;
}

function classifyKeyExpression(keyExpression, namespace) {
  const findings = [];
  const isLiteral =
    (keyExpression.startsWith('"') && keyExpression.endsWith('"')) ||
    (keyExpression.startsWith("'") && keyExpression.endsWith("'")) ||
    (keyExpression.startsWith("`") && keyExpression.endsWith("`"));

  const literalValue = isLiteral ? keyExpression.slice(1, -1) : "";
  const inspectValue = isLiteral ? literalValue : keyExpression;

  if (!inspectValue.startsWith(`${namespace}:`)) {
    findings.push(`missing namespace prefix "${namespace}:"`);
  }
  if (!/:v\d+:/.test(inspectValue)) {
    findings.push("missing version segment (:v<digit>:)");
  }

  return findings;
}

function likelyPerUserContext(content, lineNumber) {
  const lines = content.split("\n");
  const start = Math.max(0, lineNumber - 3);
  const end = Math.min(lines.length, lineNumber + 2);
  const context = lines.slice(start, end).join("\n");
  return /userId|context\.user|authorId|session\.user/i.test(context);
}

function keyHasUserScope(keyExpression) {
  return /user|author|session|context\.user|userId/i.test(keyExpression);
}

function toMarkdown(results, namespace) {
  const lines = [
    "# Redis Key Lint Report",
    "",
    `Namespace expectation: \`${namespace}:\``,
    "Version expectation: `:v<digit>:`",
    "",
  ];

  if (results.length === 0) {
    lines.push("No redis key usages found.");
    return `${lines.join("\n")}\n`;
  }

  for (const result of results) {
    lines.push(`## ${result.file}`);
    lines.push("");
    for (const finding of result.findings) {
      lines.push(
        `- line ${finding.lineNumber}: \`${finding.keyExpression}\` -> ${finding.issues.join(
          "; "
        )}`
      );
    }
    lines.push("");
  }

  return `${lines.join("\n")}\n`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const repoRoot = process.cwd();
  const sourceRoot = path.resolve(repoRoot, args.root);
  const files = await walkFiles(sourceRoot);

  const invalidResults = [];
  let totalCalls = 0;

  for (const file of files) {
    const content = await fs.readFile(file, "utf8");
    const calls = collectCalls(content);
    if (calls.length === 0) {
      continue;
    }

    totalCalls += calls.length;
    const findings = [];
    for (const call of calls) {
      const issues = classifyKeyExpression(call.keyExpression, args.namespace);
      if (
        likelyPerUserContext(content, call.lineNumber) &&
        !keyHasUserScope(call.keyExpression)
      ) {
        issues.push("potential missing user scope in user-related context");
      }
      if (issues.length > 0) {
        findings.push({ ...call, issues });
      }
    }

    if (findings.length > 0) {
      invalidResults.push({
        file: path.relative(repoRoot, file),
        findings,
      });
    }
  }

  console.log(`[lint-redis-keys] scanned files: ${files.length}`);
  console.log(`[lint-redis-keys] redis calls found: ${totalCalls}`);
  if (invalidResults.length === 0) {
    console.log("[lint-redis-keys] OK");
  } else {
    for (const result of invalidResults) {
      for (const finding of result.findings) {
        console.log(
          `[lint-redis-keys] ${result.file}:${finding.lineNumber} ${finding.issues.join(
            ", "
          )} | ${finding.keyExpression}`
        );
      }
    }
    if (!args.strict) {
      console.log(
        "[lint-redis-keys] warnings only (non-strict mode). Use --strict to fail on findings."
      );
    }
  }

  if (args.report) {
    const reportPath = path.resolve(repoRoot, args.report);
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(
      reportPath,
      toMarkdown(invalidResults, args.namespace),
      "utf8"
    );
    console.log(`[lint-redis-keys] report written: ${args.report}`);
  }

  process.exit(args.strict && invalidResults.length > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error(`[lint-redis-keys] error: ${error.message}`);
  process.exit(1);
});
