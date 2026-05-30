# AI 網站克隆模板

<a href="https://github.com/JCodesMore/ai-website-cloner-template/blob/master/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT License" /></a> <a href="https://github.com/JCodesMore/ai-website-cloner-template/stargazers"><img src="https://img.shields.io/github/stars/JCodesMore/ai-website-cloner-template?style=flat" alt="Stars" /></a> <a href="https://discord.gg/hrTSX5yTpB"><img src="https://img.shields.io/discord/1400896964597383279?label=discord" alt="Discord" /></a>

[English](./README.en.md) | 繁體中文

一個可重複使用的模板，透過 AI 編碼代理將任何網站逆向工程成乾淨、現代的 Next.js 程式碼庫。

**推薦使用 [Claude Code](https://docs.anthropic.com/en/docs/claude-code) 搭配 Opus 4.7 以獲得最佳效果** —— 但也支援多種 AI 編碼代理。

只需指向一個 URL，執行 `/clone-website`,你的 AI 代理就會檢查網站、提取設計 token 與資源、撰寫元件規格,並派遣並行的 builder 重建每個區塊。

## 示範

[![觀看示範](docs/design-references/comparison.png)](https://youtu.be/O669pVZ_qr0)

> 點擊上方圖片觀看 YouTube 完整示範。

## 快速開始

1. **Clone 此 repo**
   ```bash
   git clone https://github.com/JCodesMore/ai-website-cloner-template.git my-clone
   cd my-clone
   ```
2. **安裝相依套件**
   ```bash
   npm install
   ```
3. **啟動你的 AI 代理** —— 推薦使用 Claude Code：
   ```bash
   claude --chrome
   ```
4. **執行 skill**：
   ```
   /clone-website <目標網址1> [<目標網址2> ...]
   ```
5. **客製化** (選用) —— 基礎克隆完成後,依需求修改

> 使用其他代理？開啟 `AGENTS.md` 查看專案說明 —— 多數代理會自動讀取。

## 支援的平台

| 代理                                                          | 狀態                       |
| ------------------------------------------------------------- | -------------------------- |
| [Claude Code](https://docs.anthropic.com/en/docs/claude-code) | **推薦** —— Opus 4.7       |
| [Codex CLI](https://github.com/openai/codex)                  | 支援                       |
| [OpenCode](https://opencode.ai/)                              | 支援                       |
| [GitHub Copilot](https://github.com/features/copilot)         | 支援                       |
| [Cursor](https://cursor.com/)                                 | 支援                       |
| [Windsurf](https://codeium.com/windsurf)                      | 支援                       |
| [Gemini CLI](https://github.com/google-gemini/gemini-cli)     | 支援                       |
| [Cline](https://github.com/cline/cline)                       | 支援                       |
| [Roo Code](https://github.com/RooCodeInc/Roo-Code)            | 支援                       |
| [Continue](https://continue.dev/)                             | 支援                       |
| [Amazon Q](https://aws.amazon.com/q/developer/)               | 支援                       |
| [Augment Code](https://www.augmentcode.com/)                  | 支援                       |
| [Aider](https://aider.chat/)                                  | 支援                       |

## 環境需求

- [Node.js](https://nodejs.org/) 24+
- 一個 AI 編碼代理 (見[支援的平台](#支援的平台))

## 技術棧

- **Next.js 16** —— App Router、React 19、TypeScript strict
- **shadcn/ui** —— Radix primitives + Tailwind CSS v4
- **Tailwind CSS v4** —— oklch 設計 token
- **Lucide React** —— 預設圖示 (克隆過程中會被提取的 SVG 取代)

## 運作原理

`/clone-website` skill 執行多階段流程：

1. **偵察 (Reconnaissance)** —— 截圖、提取設計 token、互動掃描 (捲動、點擊、hover、響應式)
2. **基礎 (Foundation)** —— 更新字型、顏色、globals,下載所有資源
3. **元件規格 (Component Specs)** —— 在 `docs/research/components/` 撰寫詳細規格檔,包含精確的 computed CSS 值、狀態、行為與內容
4. **並行建構 (Parallel Build)** —— 在 git worktree 中派遣 builder 代理,每個區塊/元件一個
5. **組裝與 QA** —— 合併 worktree、組裝頁面,並與原始網站進行視覺 diff

每個 builder 代理會直接收到完整的元件規格 —— 精確的 `getComputedStyle()` 數值、互動模型、多狀態內容、響應式斷點與資源路徑。不需要猜測。

## 使用場景

- **平台遷移** —— 將你擁有的網站從 WordPress/Webflow/Squarespace 重建為現代 Next.js 程式碼庫
- **失落的原始碼** —— 網站還在線上但 repo 不見了、原開發者離開了、或技術棧過於老舊。用現代格式拿回程式碼
- **學習** —— 透過真實程式碼解構正式網站如何達成特定排版、動畫與響應式行為

## 不適用於

- **釣魚或冒充** —— 本專案不可用於詐欺、冒充或任何違法用途
- **將他人設計據為己有** —— Logo、品牌資源、原創文案皆歸原所有者
- **違反服務條款** —— 部分網站明文禁止爬取或重製,請先確認

## 專案結構

```
src/
  app/              # Next.js 路由
  components/       # React 元件
    ui/             # shadcn/ui 原語
    icons.tsx       # 提取的 SVG 圖示
  lib/utils.ts      # cn() 工具
  types/            # TypeScript 介面
  hooks/            # 自訂 React hooks
public/
  images/           # 從目標下載的圖片
  videos/           # 從目標下載的影片
  seo/              # Favicon、OG 圖片
docs/
  research/         # 提取輸出與元件規格
  design-references/ # 截圖
scripts/
  sync-agent-rules.sh  # 重新產生代理說明檔
  sync-skills.mjs      # 為所有平台重新產生 /clone-website
AGENTS.md           # 代理說明 (唯一真實來源)
CLAUDE.md           # Claude Code 設定 (引用 AGENTS.md)
GEMINI.md           # Gemini CLI 設定 (引用 AGENTS.md)
```

## 指令

```bash
npm run dev    # 啟動開發伺服器
npm run build  # 正式環境建置
npm run lint   # ESLint 檢查
npm run typecheck # TypeScript 檢查
npm run check  # 執行 lint + typecheck + build
```

### 使用 Docker

```bash
docker compose up app --build # 建置並執行 app
docker compose up dev --build # 以開發模式在 port 3001 執行
```

## 為其他平台更新

兩個唯一真實來源檔案驅動所有平台支援。編輯來源後,執行同步腳本：

| 項目                   | 唯一真實來源                            | 同步指令                           |
| ---------------------- | --------------------------------------- | ---------------------------------- |
| 專案說明               | `AGENTS.md`                             | `bash scripts/sync-agent-rules.sh` |
| `/clone-website` skill | `.claude/skills/clone-website/SKILL.md` | `node scripts/sync-skills.mjs`     |

每個腳本會自動重新產生平台特定的副本。原生讀取來源檔案的代理不需要重新產生。


## Star 歷史

[![Star History Chart](https://api.star-history.com/svg?repos=JCodesMore/ai-website-cloner-template&type=Date)](https://star-history.com/#JCodesMore/ai-website-cloner-template&Date)

## 授權

MIT
