# AI Agent 考題比較表

| 比較項目 | 核心差異 | 考試判斷關鍵 |
| --- | --- | --- |
| AI Agent vs Chatbot | Chatbot 偏問答，Agent 偏目標導向與任務執行 | 有沒有規劃步驟、使用工具、觀察結果 |
| AI Agent vs LLM | LLM 是模型，Agent 是系統 | LLM 產生文字；Agent 可調用 LLM 與其他工具 |
| AI Agent vs RAG | RAG 是檢索增強生成方法，Agent 可把 RAG 當工具 | RAG 重點是查資料；Agent 重點是完成任務 |
| AI Agent vs Workflow | Workflow 多為固定流程，Agent 可依狀況調整 | 是否有動態決策與回饋調整 |
| AI Agent vs AutoML | AutoML 自動化模型訓練，Agent 自動化任務流程 | AutoML 聚焦建模，Agent 聚焦行動與工具 |
| No Code Agent vs 自建 Agent | No Code 快速但彈性較低，自建彈性高但成本高 | 看 PoC、成本、整合、資安與維護能力 |
| PoC vs Pilot | PoC 驗證可行性，Pilot 驗證真實流程 | 不要把 PoC 成功等於全面導入成功 |
| KPI vs ROI vs TCO | KPI 衡量成效，ROI 衡量投資報酬，TCO 衡量總成本 | 題目問效率選 KPI，問投資價值看 ROI，問總成本看 TCO |

## 單選題解題口訣

1. 看到「會拆任務、會用工具、會根據結果調整」：優先想到 AI Agent。
2. 看到「先查企業文件再回答」：優先想到 RAG。
3. 看到「產生文字、摘要、程式、圖片」：優先想到生成式 AI 或 LLM。
4. 看到「不用寫程式快速建立流程」：優先想到 No Code。
5. 看到「少量程式客製整合」：優先想到 Low Code。
6. 看到「正式導入前驗證可行性」：優先想到 PoC。
7. 看到「小範圍真實流程試跑」：優先想到 Pilot。
8. 看到「個資、機密、錯誤答案、越權」：優先想到治理與風險管理。

## 常見陷阱

- 陷阱一：把 Agent 說成單純 LLM。修正：Agent 是系統，LLM 只是其中一種能力。
- 陷阱二：把 RAG 說成可以完全消除幻覺。修正：RAG 可降低幻覺，但資料錯誤或檢索錯誤仍會出錯。
- 陷阱三：認為 No Code 一定最適合正式企業系統。修正：No Code 適合快速驗證，但正式導入要看資安、權限、整合與維運。
- 陷阱四：只看 Accuracy。修正：若漏抓重要案例成本高，要看 Recall；若誤判成本高，要看 Precision。
- 陷阱五：PoC 成功就全面部署。修正：中間還需要 Pilot、風險控管、使用者訓練與監控。
