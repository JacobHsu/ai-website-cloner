#!/usr/bin/env node
// Copy this template's app skeleton and cloning tools into a separate project
// folder, so cloned sites never land in the template repository.
//
// Usage (from the template root): npm run scaffold -- <target-folder>

import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const templateRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// Template-only files: documentation about the template itself, its demo
// image, and this script. Everything else tracked by git is copied.
const EXCLUDED = new Set([
  "README.md",
  "README.zh.md",
  "AGENTS.zh.md",
  "CHANGELOG.md",
  "CONTRIBUTING.md",
  "SECURITY.md",
  "docs/design-references/comparison.png",
  "scripts/scaffold.mjs",
]);

// package.json fields that describe the template rather than the new project.
const TEMPLATE_PACKAGE_FIELDS = ["author", "license", "repository", "homepage", "bugs", "keywords"];

function fail(message) {
  console.error(`scaffold: ${message}`);
  process.exit(1);
}

function isInside(child, parent) {
  const relative = path.relative(parent, child);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
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
if (!targetArg) fail("missing target folder. Usage: npm run scaffold -- <target-folder>");

const targetRoot = path.resolve(process.cwd(), targetArg);
if (isInside(targetRoot, templateRoot)) {
  fail("the target folder must be outside the template folder.");
}

const trackedFiles = execFileSync("git", ["ls-files", "-z"], { cwd: templateRoot, encoding: "utf8" })
  .split("\0")
  .filter(Boolean);

const copied = [];
const skipped = [];

for (const file of trackedFiles) {
  if (EXCLUDED.has(file)) continue;

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
  delete pkg.scripts?.scaffold;
  writeJson(packageFile, pkg);
}

if (copied.includes("package-lock.json")) {
  const lockFile = path.join(targetRoot, "package-lock.json");
  const lock = readJson(lockFile);
  lock.name = packageName;
  lock.version = "0.1.0";
  if (lock.packages?.[""]) {
    const root = lock.packages[""];
    root.name = packageName;
    root.version = "0.1.0";
    delete root.license;
  }
  writeJson(lockFile, lock);
}

console.log(`Scaffolded ${copied.length} files into ${targetRoot}`);
if (skipped.length > 0) {
  console.log(`Kept ${skipped.length} existing files in the target unchanged:`);
  for (const file of skipped) console.log(`  ${file}`);
}
console.log(`
Next steps:
  cd ${targetArg}
  npm install
  npm run check
Then open that folder in your editor and run /clone-website <url> there.`);
