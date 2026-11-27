<div align="center">

# AI Website Cloner Template

### Clone any website with one command

Give your AI coding agent a URL and watch it recreate the website as a clean Next.js app.

**Best results with [Claude Code](https://docs.anthropic.com/en/docs/claude-code) + Opus 5.5. Also supports Codex, Cursor, and OpenCode.**

[Quick Start](#quick-start) · [Watch Demo](#demo) · [Supported Platforms](#supported-platforms)

English · [繁體中文](README.zh.md)

</div>

---

## Demo

[![Watch the demo](docs/design-references/comparison.png)](https://youtu.be/O669pVZ_qr0)

> Click the image above to watch the full demo on YouTube.

## Quick Start

> **Rule of thumb: this repo is only the template. Don't clone sites inside it.**
> Output each cloned site into **its own project folder** (ideally backed by a private repo), so cloned content never ends up in this public template.

The steps below output to `../storemap` as an example.

### 0. Prepare the template (once)

```bash
git clone https://github.com/JacobHsu/ai-website-cloner.git
cd ai-website-cloner
npm install
```

### 1. Prepare the output project

Create an empty folder for the output project. To keep it on GitHub, create a **private** repo first and clone it:

```bash
gh repo create <your-account>/storemap --private --add-readme
git clone git@github.com:<your-account>/storemap.git ../storemap
```

To keep it local only, an empty folder is enough.

### 2. Scaffold the template into the project

From the **template folder**, run:

```bash
npm run scaffold -- ../storemap
```

This copies the app skeleton and the agent setup needed for cloning, and:

- leaves the target's `.git` and origin alone, so the private repo link is unchanged
- never overwrites files the target already has (such as its own `README.md`)
- skips template-only docs (README, CHANGELOG, CONTRIBUTING, and so on)
- renames `package.json` after the target folder

Then install and check in the output project:

```bash
cd ../storemap
npm install
npm run check
```

### 3. Clone a website in the output project

Open the **output project folder** (not the template) in your editor, start a new agent session with browser access enabled, and in Claude Code or Cursor run:

```text
/clone-website https://example.com
```

Replace the URL with the website you want to recreate. Preview with `npm run dev` at http://localhost:3000.

### 4. Finalize and save

Once the site looks right, you can strip the cloning-only agent files to leave a plain website project:

```bash
npm run finalize                    # keeps docs/research and docs/design-references
npm run finalize -- --drop-research # also removes them
```

This removes `.agents/`, `.claude/commands/clone-website.md`, `AGENTS.md`, `CLAUDE.md`, and `scripts/`. Afterwards `/clone-website` no longer works in that project, so run it only when you are done cloning. (Running `npm run dev` under an AI agent may let Next.js recreate an `AGENTS.md` containing only its own instructions; set `agentRules: false` in `next.config.ts` to turn that off.)

Then commit and push to your private repo:

```bash
git add -A
git commit -m "Clone storemap"
git push
```

## Supported Platforms

| Agent                                                         | Status                     |
| ------------------------------------------------------------- | -------------------------- |
| [Claude Code](https://docs.anthropic.com/en/docs/claude-code) | **Recommended** — Opus 5.5 |
| [Codex CLI](https://github.com/openai/codex)                  | Supported                  |
| [OpenCode](https://opencode.ai/)                              | Supported                  |
| [Cursor](https://cursor.com/)                                 | Supported                  |

## Prerequisites

- [Node.js](https://nodejs.org/) 24+
- An AI coding agent (see [Supported Platforms](#supported-platforms))

## Tech Stack

- **Next.js 16** — App Router, React 19, TypeScript strict
- **shadcn/ui** — Base UI primitives + Tailwind CSS v4
- **Tailwind CSS v4** — oklch design tokens
- **Lucide React** — default icons (replaced by extracted SVGs during cloning)

## How It Works

The `/clone-website` skill follows four steps:

1. **Map** — map source URLs to local routes and preserve existing work.
2. **Observe** — inspect desktop/mobile pages, extract real assets and fonts, and exercise alternate states.
3. **Build** — implement editable components and working interactions; delegate independent sections when useful.
4. **Compare** — review source and local pages at matched sizes/states, repair visible differences, and run the production check.

Framer pages and animated sites have focused inspection guidance for responsive variants, media, sticky scenes, and scroll/time-driven motion. Direct HTTP or asset tools handle extraction where practical; browser comparisons establish appearance and behavior. Deliverables include route mappings, run instructions, comparison screenshots, and any remaining gaps.

## Use Cases

- **Platform migration** — rebuild a site you own from WordPress/Webflow/Squarespace into a modern Next.js codebase
- **Lost source code** — your site is live but the repo is gone, the developer left, or the stack is legacy. Get the code back in a modern format
- **Learning** — deconstruct how production sites achieve specific layouts, animations, and responsive behavior by working with real code

## Not Intended For

- **Phishing or impersonation** — this project must not be used for deceptive purposes, impersonation, or any activity that breaks the law.
- **Passing off someone's design as your own** — logos, brand assets, and original copy belong to their owners.
- **Violating terms of service** — some sites explicitly prohibit scraping or reproduction. Check first.

## Project Structure

```
src/
  app/              # Next.js routes
  components/       # React components
    ui/             # shadcn/ui primitives
    sites/<site>/   # Source-specific components and extracted SVGs
  lib/utils.ts      # cn() utility
  types/            # TypeScript interfaces
  hooks/            # Custom React hooks
public/
  sites/<site>/     # Source-specific images, fonts, videos, and other assets
docs/
  research/<site>/  # Page brief, asset map, and inspection evidence
  design-references/ # Screenshots
.agents/skills/
  clone-website/    # Canonical skill and inspection reference
.claude/commands/
  clone-website.md  # Thin Claude Code bridge
AGENTS.md           # Agent instructions (single source of truth)
CLAUDE.md           # Claude Code config (imports AGENTS.md)
```

## Commands

```bash
npm run dev    # Start dev server
npm run build  # Production build
npm run lint   # ESLint check
npm run typecheck # TypeScript check
npm run check  # Run lint + typecheck + build
npm run scaffold -- <target-folder>  # (in the template) scaffold a separate clone project
npm run finalize  # (in a clone project) remove the agent tools, leaving a plain site
```

### If using docker

```bash
docker compose up app --build # build and run the app
docker compose up dev --build # run the app in dev mode on port 3001
```

## Agent Support

The project keeps one portable Agent Skill at `.agents/skills/clone-website/`. Codex, Cursor, and OpenCode read it directly. Claude Code uses the small command bridge at `.claude/commands/clone-website.md` so `/clone-website` and its arguments continue to work without exposing a duplicate skill to the other agents.

## License

MIT
