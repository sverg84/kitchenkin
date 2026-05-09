#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";

function parseArgs(argv) {
  const args = {
    manifest: "",
    force: false,
    dryRun: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--manifest") {
      args.manifest = argv[i + 1] ?? "";
      i += 1;
      continue;
    }
    if (token === "--force") {
      args.force = true;
      continue;
    }
    if (token === "--dry-run") {
      args.dryRun = true;
      continue;
    }
  }

  return args;
}

function usage() {
  console.error(
    "Usage: node scaffold-from-manifest.mjs --manifest <path> [--force] [--dry-run]"
  );
}

function assertInsideRoot(rootDir, targetPath) {
  const normalized = path.resolve(rootDir, targetPath);
  if (!normalized.startsWith(rootDir)) {
    throw new Error(`Refusing to write outside repository root: ${targetPath}`);
  }
  return normalized;
}

function templateContent(templateName, filePath) {
  const ext = path.extname(filePath);
  const name = path.basename(filePath, ext);

  const templates = {
    "ts-module": `export function ${name}() {\n  // TODO: implement\n}\n`,
    "js-module": `export function ${name}() {\n  // TODO: implement\n}\n`,
    "react-component":
      "export function ComponentName() {\n  return <div>TODO</div>;\n}\n",
    markdown: `# ${name}\n\nTODO\n`,
  };

  return templates[templateName] ?? "";
}

async function createDirectory(dir, dryRun) {
  if (dryRun) {
    console.log(`[dry-run] mkdir -p ${dir}`);
    return;
  }
  await fs.mkdir(dir, { recursive: true });
}

async function createFile(filePath, content, force, dryRun) {
  const exists = await fs
    .access(filePath)
    .then(() => true)
    .catch(() => false);

  if (exists && !force) {
    console.log(`[skip] exists ${filePath}`);
    return;
  }

  if (dryRun) {
    const action = exists ? "overwrite" : "create";
    console.log(`[dry-run] ${action} ${filePath}`);
    return;
  }

  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, "utf8");
  console.log(`[ok] ${exists ? "overwrote" : "created"} ${filePath}`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.manifest) {
    usage();
    process.exit(1);
  }

  const rootDir = process.cwd();
  const manifestPath = assertInsideRoot(rootDir, args.manifest);
  const manifestRaw = await fs.readFile(manifestPath, "utf8");
  const manifest = JSON.parse(manifestRaw);

  const directories = Array.isArray(manifest.directories)
    ? manifest.directories
    : [];
  const files = Array.isArray(manifest.files) ? manifest.files : [];

  for (const dir of directories) {
    const absoluteDir = assertInsideRoot(rootDir, dir);
    await createDirectory(absoluteDir, args.dryRun);
  }

  for (const file of files) {
    if (!file || typeof file.path !== "string") {
      throw new Error("Each file entry must include a string path.");
    }
    const absolutePath = assertInsideRoot(rootDir, file.path);
    const content =
      typeof file.contents === "string"
        ? file.contents
        : typeof file.template === "string"
        ? templateContent(file.template, file.path)
        : "";

    await createFile(absolutePath, content, args.force, args.dryRun);
  }
}

main().catch((error) => {
  console.error(`[error] ${error.message}`);
  process.exit(1);
});
