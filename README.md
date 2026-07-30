# iPAS AI 應用規劃師：教材、AI Agent 與模擬考

這個 repository 是可直接部署的靜態網頁版教材。

## 線上/本機使用

直接開啟 `index.html` 即可閱讀，不需要後端、不需要安裝套件、不需要 API Key。

主要功能：

- 60 日教材：Day 1-30 初級，Day 31-60 中級。
- 教材搜尋與週次篩選。
- AI Agent 實作專區：免 API 的「iPAS 備考助教 Agent」模擬器。
- Agent 步驟對照 iPAS 考點：目標輸入、任務拆解、知識檢索、答案生成、風險檢查、KPI 評估。
- 模擬考：初級、中級各三份，每份 50 題，共 300 題。
- 即時批改：作答後顯示正解、答對答錯原因與四個選項解析，並在瀏覽器本機保存進度。

## 教材檔案

- `index.html`：網站入口。
- `styles.css`：版面樣式。
- `app.js`：互動邏輯與 AI Agent 模擬。
- `notes-data.js`：60 日教材資料。
- `exam-data.js`：結構化模擬考題庫，可供網頁與未來 AI Agent 使用。
- `exam.js`：作答、批改、解析、成績與進度保存邏輯。
- `agent-course/`：AI Agent 文字教材。

## 部署

可部署到 GitHub Pages、Netlify、Cloudflare Pages 或 Vercel Static Site。

若未來升級為真 API 版，請勿把 API Key 放在前端，應改由後端或 serverless function 保管。
