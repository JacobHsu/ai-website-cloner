# Understand-Anything 使用教學

> 用 AI 把任何程式碼庫分析成一張**互動式知識圖譜**，再透過儀表板視覺化探索架構、元件與彼此關係。

[Understand-Anything](https://github.com/Lum1104/Understand-Anything) 是一個 Claude Code（以及 Codex、Gemini、Copilot 等多平台）外掛。它會掃描整個專案、用子代理逐批分析每個檔案，最後產出一份 `knowledge-graph.json`，並可啟動本機儀表板來瀏覽。

本文件以**本專案（ai-website-cloner-template）的實際執行結果**為例說明。

---

## 目錄

- [它能做什麼](#它能做什麼)
- [安裝確認](#安裝確認)
- [快速開始（三步驟）](#快速開始三步驟)
- [指令一：`/understand` —— 產生知識圖譜](#指令一understand--產生知識圖譜)
- [指令二：`/understand-dashboard` —— 啟動視覺化儀表板](#指令二understand-dashboard--啟動視覺化儀表板)
- [其他實用指令](#其他實用指令)
- [產出檔案說明](#產出檔案說明)
- [常見問題與排錯](#常見問題與排錯)

---

## 它能做什麼

| 能力 | 說明 |
|------|------|
| **架構分層** | 自動把檔案歸類到邏輯層級（應用程式層、基礎架構層、文件層…） |
| **關係圖譜** | 標示檔案間的 `imports`、`calls`、`configures`、`related` 等 26 種邊 |
| **導覽 (Tour)** | 產生一條循序漸進的學習路徑，帶你從入口讀到細節 |
| **多語言輸出** | 摘要、標籤、層名都能用指定語言生成（本專案用繁體中文） |
| **增量更新** | 記錄 commit 與檔案指紋，之後只重新分析變動的檔案 |

---

## 安裝確認

此外掛已安裝於 Claude Code 外掛快取中。在 Claude Code 中輸入 `/` 後，應能看到 `understand-anything:` 開頭的指令。

執行環境需求：

- **Node.js ≥ 22**
- **pnpm ≥ 10**

可在終端機用 `! node --version` 與 `! pnpm --version` 確認（`!` 前綴會在當前 session 執行指令並把輸出帶回對話）。

---

## 快速開始（三步驟）

```text
# 1. 分析專案，輸出語言設為繁體中文
/understand-anything:understand --language zh-TW

# 2. 啟動互動式儀表板
/understand-anything:understand-dashboard

# 3. 開啟終端機印出的「含 token」網址即可瀏覽
```

> 第一次分析會花幾分鐘（取決於檔案數量）；之後重跑只會處理變動的檔案。

---

## 指令一：`/understand` —— 產生知識圖譜

### 基本用法

```text
/understand-anything:understand
```

直接分析**目前的工作目錄**，輸出英文內容。

### 常用參數

| 參數 | 作用 |
|------|------|
| `--language <lang>` | 指定輸出語言。支援 ISO 代碼（`zh`、`ja`、`ko`、`en`…）或友善名稱（`chinese`、`japanese`…）；地區變體如 `zh-TW`、`zh-HK` 會原樣保留 |
| `--full` | 強制完整重建，忽略既有圖譜 |
| `--review` | 改用完整的 LLM 審查器（而非預設的確定性驗證） |
| `--auto-update` / `--no-auto-update` | 開啟／關閉 commit 時自動更新圖譜 |
| `<目錄路徑>` | 分析指定目錄，而非目前工作目錄 |

### 範例

```text
# 繁體中文輸出（本專案採用）
/understand-anything:understand --language zh-TW

# 完整重建 + 日文輸出
/understand-anything:understand --full --language ja

# 分析另一個資料夾
/understand-anything:understand ../other-project --language zh-TW
```

### 執行流程（7 個階段）

`/understand` 內部會分階段進行，過程中會即時回報進度：

1. **Pre-flight** —— 偵測 git 狀態、建置外掛、判斷要完整分析或增量更新
2. **Scan** —— 掃描所有檔案、偵測語言與框架
3. **Batch** —— 把檔案分成語意批次
4. **Analyze** —— 派發子代理（最多 5 個並行）逐批產生節點與邊
5. **Architecture** —— 把節點歸類到架構分層
6. **Tour** —— 建立導覽步驟
7. **Review & Save** —— 驗證圖譜、寫入 `knowledge-graph.json`

### 過程中你會被詢問

- **`.understandignore` 設定** —— 第一次執行會在 `.understand-anything/.understandignore` 產生一份排除清單範本（語法同 `.gitignore`）。你可以取消註解想排除的項目，確認後再繼續。
- **掃描範圍** —— 若有大量重複或非必要檔案，會詢問你要分析全部還是縮小範圍。

### 本專案的實際結果（參考）

> 58 個檔案 → **66 個節點、45 條邊、7 個架構分層、12 步導覽**，全程以繁體中文生成。
>
> 7 個分層：應用程式層、AI 代理指令層、同步腳本層、建構與設定層、基礎架構層、專案文件層、資產佔位層。

---

## 指令二：`/understand-dashboard` —— 啟動視覺化儀表板

分析完成後，用這個指令啟動本機 web 儀表板來互動探索圖譜。

```text
/understand-anything:understand-dashboard
```

### 執行後會發生什麼

1. 確認 `.understand-anything/knowledge-graph.json` 存在（不存在會提示你先跑 `/understand`）
2. 安裝／建置儀表板依賴（首次較久，之後會跳過）
3. 在背景啟動 Vite 開發伺服器，並印出一行**含存取 token 的網址**：

   ```text
   🔑  Dashboard URL: http://127.0.0.1:5173/?token=<一串token>
   ```

### ⚠️ 最重要的一點：一定要帶 `?token=`

儀表板用 token 保護資料。**請完整複製含 `?token=...` 的網址**到瀏覽器；若只用 `http://127.0.0.1:5173/`，會被「Access Token Required」存取閘擋下。

### 儀表板能做什麼

- **Graph 視圖** —— 力導向圖，點節點看摘要、標籤與關聯
- **Layers 視圖** —— 依架構分層瀏覽
- **Tour 視圖** —— 跟著導覽循序理解整個專案（建議新手從這裡開始）
- **搜尋／篩選** —— 依節點型別、標籤、關鍵字過濾

### 停止伺服器

在執行它的終端機按 `Ctrl+C`，或直接請 Claude 幫你終止該背景程序。

> 若 port 5173 已被占用，Vite 會自動改用下一個可用的 port —— 以終端機實際印出的網址為準。

---

## 其他實用指令

除了上述兩個核心指令，外掛還提供：

| 指令 | 用途 |
|------|------|
| `/understand-anything:understand-explain` | 深入解說某個特定檔案、函式或模組 |
| `/understand-anything:understand-chat` | 以對話方式詢問關於這個程式碼庫的問題 |
| `/understand-anything:understand-diff` | 比較變更，了解一次改動的影響範圍 |
| `/understand-anything:understand-onboard` | 為新進工程師產生上手導覽 |
| `/understand-anything:understand-domain` | 抽取業務領域知識（領域、流程、步驟） |
| `/understand-anything:understand-knowledge` | 操作／查詢知識圖譜 |

> 這些指令都依賴 `/understand` 先產生的 `knowledge-graph.json`，請先完成分析再使用。

---

## 產出檔案說明

所有產物都放在專案根目錄的 `.understand-anything/`：

```text
.understand-anything/
├── knowledge-graph.json   # 主要產物：節點、邊、分層、導覽
├── fingerprints.json      # 各檔案的結構指紋，供增量更新比對
├── meta.json              # 上次分析時間、commit、檔案數
├── config.json            # 偏好設定（如 outputLanguage: zh-TW）
└── .understandignore      # 分析排除清單（語法同 .gitignore）
```

- **要不要提交進 git？** `knowledge-graph.json` 可提交，方便團隊共享；但它會隨程式碼變動而過時。若不想維護，可把整個 `.understand-anything/` 加進 `.gitignore`。
- **`config.json`** 會記住你的 `--language` 偏好，之後增量更新會沿用同一語言。

---

## 常見問題與排錯

**Q：提示「No knowledge graph found」？**
先執行 `/understand-anything:understand` 產生圖譜，再啟動儀表板。

**Q：瀏覽器顯示「Access Token Required」？**
你的網址少了 `?token=...`。回終端機複製完整網址（含 token）。

**Q：`pnpm` 找不到 / 版本太舊？**
安裝 Node.js ≥ 22 與 pnpm ≥ 10 後重跑指令。

**Q：分析過程中子代理遇到暫時性限制（如 session limit）失敗？**
重跑 `/understand` 即可 —— 已完成的批次會保留，只會補跑失敗的部分；完全重來則加 `--full`。

**Q：改了很多檔案，圖譜要怎麼更新？**
直接重跑 `/understand`；它會比對 `fingerprints.json` 只重新分析變動的檔案。要完整重建則用 `/understand --full`。

**Q：想換輸出語言？**
重跑時帶上 `--language <lang>`，例如 `--language en` 換回英文。

---

## 參考

- 專案首頁：<https://github.com/Lum1104/Understand-Anything>
- 本專案 README 亦有引用：``/understand --language zh-TW``
