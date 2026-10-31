# iPAS AI 應用規劃師：中級雙科 15 日講義

這個 repository 是可直接部署的靜態網頁版教材。

## 線上/本機使用

直接開啟 `index.html` 即可閱讀，不需要後端、不需要安裝套件、不需要 API Key。

主要功能：

- 15 日中級講義：Day 1-7 科目一「人工智慧技術應用與規劃」，Day 8-14 科目二「大數據處理分析與應用」，Day 15 雙科整合。
- 約 30,600 字原創白話教學、實務例子、公式算例、可能出題方向與 32 題附解析練習。
- 教材搜尋與科目篩選；[完整課程索引與每日文字檔](course-15/README.md)。
- AI Agent 實作專區：免 API 的「iPAS 備考助教 Agent」模擬器。
- Agent 步驟對照 iPAS 考點：目標輸入、任務拆解、知識檢索、答案生成、風險檢查、KPI 評估。
- 模擬考：初級、中級各三份，每份 50 題，共 300 題。
- 即時批改：作答後顯示正解、答對答錯原因與四個選項解析，並在瀏覽器本機保存進度。

## 教材檔案

- `index.html`：網站入口。
- `styles.css`：版面樣式。
- `app.js`：互動邏輯與 AI Agent 模擬。
- `notes-data.js`：15 日中級雙科教材資料。
- `course-15/`：每日文字講義、評鑑對照、結構化 JSON 與教材產生及驗證程式，可供 AI Agent 依評鑑代碼讀取。
- `archive/60-day-reader/`：原 60 日網頁教材備份。
- `exam-data.js`：結構化模擬考題庫，可供網頁與未來 AI Agent 使用。
- `exam.js`：作答、批改、解析、成績與進度保存邏輯。
- `agent-course/`：AI Agent 文字教材。

## 部署

本次 15 日講義僅以中級科目一、二為主；原六份模擬考仍含初級與中級科目三概念，並非雙科專用試卷。官方核對連結與日期詳見課程索引。

可部署到 GitHub Pages、Netlify、Cloudflare Pages 或 Vercel Static Site。

若未來升級為真 API 版，請勿把 API Key 放在前端，應改由後端或 serverless function 保管。
