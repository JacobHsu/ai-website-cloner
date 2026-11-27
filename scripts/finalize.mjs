#!/usr/bin/env node
// Remove the AI cloning tools from a finished clone project, leaving a plain
// Next.js website project.
//
// Usage (from the clone project root): npm run finalize [-- --drop-research]
//   --drop-research  also remove docs/research/ and docs/design-references/

import { existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dropResearch = process.argv.includes("--drop-research");

// The template keeps scaffold.mjs; a scaffolded project does not.
if (existsSync(path.join(projectRoot, "scripts", "scaffold.mjs"))) {
  console.error("finalize: this looks like the template itself. Run it in a scaffolded clone project.");
  process.exit(1);
}

const targets = [
  ".agents",
  ".claude/commands/clone-website.md",
  "AGENTS.md",
  "CLAUDE.md",
  "scripts",
];
if (dropResearch) targets.push("docs/research", "docs/design-references");

const removed = [];
for (const target of targets) {
  const fullPath = path.join(projectRoot, target);
  if (!existsSync(fullPath)) continue;
  rmSync(fullPath, { recursive: true, force: true });
  removed.push(target);
}

// Drop now-empty folders left behind, but keep local settings such as
// .claude/settings.local.json.
for (const folder of [".claude/commands", ".claude", "docs"]) {
  const fullPath = path.join(projectRoot, folder);
  if (existsSync(fullPath) && readdirSync(fullPath).length === 0) {
    rmSync(fullPath, { recursive: true });
  }
}

const packageFile = path.join(projectRoot, "package.json");
const pkg = JSON.parse(readFileSync(packageFile, "utf8"));
if (pkg.scripts?.finalize) {
  delete pkg.scripts.finalize;
  writeFileSync(packageFile, `${JSON.stringify(pkg, null, 2)}\n`);
}

console.log(removed.length > 0 ? `Removed: ${removed.join(", ")}` : "Nothing to remove.");
console.log("This project no longer contains the /clone-website tools.");
