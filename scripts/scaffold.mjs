#!/usr/bin/env node
// Create the Next.js site skeleton in a separate output folder. Only the
// website itself goes there: the cloning tools (skill, agent instructions,
// scripts) stay in this template, which writes into the output folder.
//
// Usage (from the template root): npm run scaffold -- <output-folder>

import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const templateRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// Template-only paths: the cloning tools, the template's own docs, and its
// license (which must not appear to license someone else's cloned content).
const EXCLUDED_PREFIXES = [".agents/", ".claude/", "scripts/", "docs/"];
const EXCLUDED_FILES = new Set([
  "AGENTS.md",
  "AGENTS.zh.md",
  "CLAUDE.md",
  "README.md",
  "README.zh.md",
  "CHANGELOG.md",
  "CONTRIBUTING.md",
  "SECURITY.md",
  "LICENSE",
  ".github/PULL_REQUEST_TEMPLATE.md",
]);

// package.json fields and scripts that describe the template, not the site.
const TEMPLATE_PACKAGE_FIELDS = ["author", "license", "repository", "homepage", "bugs", "keywords"];
const TEMPLATE_SCRIPTS = ["scaffold"];

function fail(message) {
  console.error(`scaffold: ${message}`);
  process.exit(1);
}

function isInside(child, parent) {
  const relative = path.relative(parent, child);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function isExcluded(file) {
  return EXCLUDED_FILES.has(file) || EXCLUDED_PREFIXES.some((prefix) => file.startsWith(prefix));
}

function toPackageName(folderName) {
  const name = folderName
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^[._-]+|[-]+$/g, "");
  return name || "website-clone";
}

function readJson(file) {
  return JSON.parse(readFileSync(file, "utf8"));
}

function writeJson(file, value) {
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

const targetArg = process.argv[2];
if (!targetArg) fail("missing output folder. Usage: npm run scaffold -- <output-folder>");

const targetRoot = path.resolve(process.cwd(), targetArg);
if (isInside(targetRoot, templateRoot)) {
  fail("the output folder must be outside the template folder.");
}

const trackedFiles = execFileSync("git", ["ls-files", "-z"], { cwd: templateRoot, encoding: "utf8" })
  .split("\0")
  .filter(Boolean);

const copied = [];
const skipped = [];

for (const file of trackedFiles) {
  if (isExcluded(file)) continue;

  const source = path.join(templateRoot, file);
  if (!existsSync(source)) continue; // tracked but deleted in the working tree

  const destination = path.join(targetRoot, file);
  if (existsSync(destination)) {
    skipped.push(file);
    continue;
  }

  mkdirSync(path.dirname(destination), { recursive: true });
  copyFileSync(source, destination);
  copied.push(file);
}

const packageName = toPackageName(path.basename(targetRoot));

if (copied.includes("package.json")) {
  const packageFile = path.join(targetRoot, "package.json");
  const pkg = readJson(packageFile);
  pkg.name = packageName;
  pkg.version = "0.1.0";
  pkg.description = "Website clone built with Next.js";
  for (const field of TEMPLATE_PACKAGE_FIELDS) delete pkg[field];
  for (const script of TEMPLATE_SCRIPTS) delete pkg.scripts?.[script];
  writeJson(packageFile, pkg);
}

if (copied.includes("package-lock.json")) {
  const lockFile = path.join(targetRoot, "package-lock.json");
  const lock = readJson(lockFile);
  lock.name = packageName;
  lock.version = "0.1.0";
  const root = lock.packages?.[""];
  if (root) {
    root.name = packageName;
    root.version = "0.1.0";
    delete root.license;
  }
  writeJson(lockFile, lock);
}

// Agents run `next dev` in the output folder; keep Next.js from writing an
// AGENTS.md there; the agent instructions live in the template.
if (copied.includes("next.config.ts")) {
  const configFile = path.join(targetRoot, "next.config.ts");
  const config = readFileSync(configFile, "utf8");
  const marker = 'output: "standalone",';
  if (config.includes(marker) && !config.includes("agentRules")) {
    writeFileSync(configFile, config.replace(marker, `${marker}\n  agentRules: false,`));
  } else {
    console.warn("scaffold: could not set agentRules: false in next.config.ts; set it by hand.");
  }
}

console.log(`Scaffolded ${copied.length} site files into ${targetRoot}`);
if (skipped.length > 0) {
  console.log(`Kept ${skipped.length} existing files unchanged:`);
  for (const file of skipped) console.log(`  ${file}`);
}
console.log(`
Next steps:
  cd ${targetArg}
  npm install
Then, from this template, run: /clone-website <url> --out ${targetArg}`);
