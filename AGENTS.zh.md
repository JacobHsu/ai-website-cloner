# 這不是你熟悉的 Next.js

這個版本有破壞性變更——API、慣例與檔案結構都可能和你訓練資料中的不同。撰寫任何程式碼之前，請先閱讀 `node_modules/next/dist/docs/` 中的相關指南（從本檔案所在目錄解析；在 monorepo 中，`next` 套件可能無法從 repo 根目錄看到）。請留意棄用（deprecation）通知。

這個區塊由 `next dev` 寫入並重新加回（寫入的是英文版 `AGENTS.md`）——可在 `node_modules/next/dist/server/lib/generate-agent-files.js` 驗證。從 diff 中刪除它只會再次產生未提交的變更；把它和你的變更一起 commit，才能保持工作樹乾淨。

# 網站逆向工程模板

## 這是什麼
一個可重複使用的模板，讓 AI 程式代理（coding agent）把任何網站逆向工程成乾淨、現代化的 Next.js 程式碼庫。Next.js + shadcn/ui + Tailwind v4 的基礎架構已預先建好——只要執行 `/clone-website <url1> [<url2> ...]` 即可。

## 技術堆疊
- **框架：** Next.js 16（App Router、React 19、TypeScript strict）
- **UI：** shadcn/ui（Base UI primitives、Tailwind CSS v4、`cn()` 工具函式）
- **圖示：** Lucide React（預設——會被擷取出的 SVG 取代或補充）
- **樣式：** Tailwind CSS v4，搭配 oklch 設計 token
- **部署：** Vercel

## 指令
- `npm run dev` — 啟動開發伺服器
- `npm run build` — 正式環境建置
- `npm run lint` — ESLint 檢查
- `npm run typecheck` — TypeScript 型別檢查
- `npm run check` — 執行 lint + typecheck + build

## 程式碼風格
- TypeScript strict 模式，禁止使用 `any`
- 使用具名匯出（named exports）；元件用 PascalCase，工具函式用 camelCase
- 使用 Tailwind 工具類別或局部（scoped）CSS；除非行為需要動態值，否則避免 inline style
- 2 個空白縮排
- 響應式：行動裝置優先（mobile-first）

## 設計原則
- **像素級精準模擬** — 完全符合目標網站的間距、顏色與字體排版
- **模擬階段不加入個人美感調整** — 先 1:1 還原，之後再客製化
- **真實內容** — 使用目標網站的實際文字與素材，不用佔位內容
- **美感優先** — 每個像素都重要

## 專案結構
```
src/
  app/              # Next.js 路由
  components/       # React 元件
    ui/             # shadcn/ui 基礎元件
    sites/<site>/   # 各來源網站專屬元件，包含擷取出的 SVG
  lib/
    utils.ts        # cn() 工具函式（shadcn）
  types/            # TypeScript 介面
  hooks/            # 自訂 React hooks
public/
  sites/<site>/     # 各來源網站專屬的圖片、字型、影片與其他素材
docs/
  research/<site>/  # 頁面簡介、素材對照表與檢查證據
  design-references/ # 截圖與視覺參考
scripts/            # 素材下載腳本
.agents/
  skills/
    clone-website/  # 標準的跨代理複製網站工作流程
.claude/
  commands/
    clone-website.md # 精簡的 Claude Code 呼叫橋接
```

## 代理工作流程
- 如果 `scripts/scaffold.mjs` 存在，代表這個資料夾是公開模板：不要在這裡複製網站。請向使用者詢問模板以外的輸出資料夾，執行 `npm run scaffold -- <資料夾>`，再到那個資料夾繼續複製。
- 要修改複製網站的工作流程，請編輯 `.agents/skills/clone-website/`。它是 Codex、Cursor 與 OpenCode 使用的標準 skill。
- `.claude/commands/clone-website.md` 只保留為精簡的 Claude Code 橋接，指向標準 skill；不要在那裡重複撰寫工作流程。
