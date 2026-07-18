const notes = window.IPAS_NOTES || [];

const state = {
  mode: location.hash.startsWith('#agent') ? 'agent' : 'notes',
  selectedDay: Number(location.hash.replace('#day-', '')) || 1,
  query: '',
  week: 'all',
};

const $ = (id) => document.getElementById(id);
const listEl = $('noteList');
const contentEl = $('noteContent');
const titleEl = $('currentTitle');
const searchEl = $('searchInput');
const weekFiltersEl = $('weekFilters');
const prevButton = $('prevButton');
const nextButton = $('nextButton');
const copyLinkButton = $('copyLinkButton');
const readerView = $('readerView');
const agentView = $('agentView');
const notesControls = $('notesControls');
const agentControls = $('agentControls');
const notesModeButton = $('notesModeButton');
const agentModeButton = $('agentModeButton');
const agentQuestion = $('agentQuestion');
const agentOutput = $('agentOutput');
const examBridgeList = $('examBridgeList');

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#039;',
}[char]));

function weekLabel(week) {
  if (week <= 5) return `初級第 ${week} 週`;
  return `中級第 ${week - 5} 週`;
}

function setMode(mode) {
  state.mode = mode;
  const isAgent = mode === 'agent';
  readerView.classList.toggle('hidden', isAgent);
  agentView.classList.toggle('hidden', !isAgent);
  notesControls.classList.toggle('hidden', isAgent);
  agentControls.classList.toggle('hidden', !isAgent);
  notesModeButton.classList.toggle('active', !isAgent);
  agentModeButton.classList.toggle('active', isAgent);
  titleEl.textContent = isAgent ? 'AI Agent 實作範例' : (notes.find((item) => item.day === state.selectedDay)?.title || '60 日教材');
  if (isAgent && location.hash !== '#agent') location.hash = 'agent';
  if (!isAgent) renderNote(state.selectedDay);
  document.body.classList.remove('sidebar-open');
}

function buildFilters() {
  const weeks = ['all', ...new Set(notes.map((note) => note.week))];
  weekFiltersEl.innerHTML = weeks.map((week) => {
    const active = state.week === week ? 'active' : '';
    const label = week === 'all' ? '全部' : weekLabel(week);
    return `<button class="filter-button ${active}" data-week="${week}">${label}</button>`;
  }).join('');
}

function filteredNotes() {
  const query = state.query.trim().toLowerCase();
  return notes.filter((note) => {
    const inWeek = state.week === 'all' || note.week === Number(state.week);
    const inQuery = !query || `${note.title}\n${note.topic}\n${note.text}`.toLowerCase().includes(query);
    return inWeek && inQuery;
  });
}

function renderList() {
  const items = filteredNotes();
  listEl.innerHTML = items.map((note) => {
    const active = note.day === state.selectedDay ? 'active' : '';
    return `<button class="note-link ${active}" data-day="${note.day}">
      <span class="note-day">Day ${note.day}</span>${escapeHtml(note.topic)}
    </button>`;
  }).join('') || '<div class="empty-state">找不到符合條件的教材</div>';
}

function inlineMarkdown(line) {
  return escapeHtml(line)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}

function lineToHtml(line, index) {
  const clean = line.trim();
  if (!clean) return '';
  if (/^=+$/.test(clean) || /^-+$/.test(clean)) return '<div class="section-rule"></div>';
  if (index === 0 || clean.startsWith('# ')) return `<h2>${inlineMarkdown(clean.replace(/^# /, ''))}</h2>`;
  if (clean.startsWith('## ')) return `<h3>${inlineMarkdown(clean.replace(/^## /, ''))}</h3>`;
  if (clean.startsWith('### ')) return `<h4>${inlineMarkdown(clean.replace(/^### /, ''))}</h4>`;
  if (/^\d+\.\s/.test(clean)) return `<p class="ordered-line">${inlineMarkdown(clean)}</p>`;
  if (clean.startsWith('- ')) return `<p class="bullet-line">${inlineMarkdown(clean.slice(2))}</p>`;
  return `<p>${inlineMarkdown(clean)}</p>`;
}

function renderNote(day) {
  const note = notes.find((item) => item.day === day) || notes[0];
  if (!note) return;

  state.selectedDay = note.day;
  if (state.mode === 'notes' && location.hash !== `#day-${note.day}`) location.hash = `day-${note.day}`;
  titleEl.textContent = note.title;

  const body = note.text.split(/\r?\n/).map(lineToHtml).filter(Boolean).join('\n');
  contentEl.innerHTML = `<div class="note-meta">${weekLabel(note.week)} · ${escapeHtml(note.filename)}</div>${body}`;

  prevButton.disabled = note.day <= 1;
  nextButton.disabled = note.day >= notes.length;
  renderList();
  document.body.classList.remove('sidebar-open');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

const knowledgeBase = [
  {
    key: 'LLM',
    words: ['llm', '大型語言模型', '語言模型', 'token', 'prompt'],
    exam: '生成式 AI、Prompt Engineering、LLM 基礎',
    content: 'LLM 像一位讀過大量文字的助教，擅長依照上下文產生文字，但不等於真的理解事實，也不保證答案正確。考試常把 LLM 和資料庫、搜尋引擎、Agent 混在一起問。',
  },
  {
    key: 'RAG',
    words: ['rag', '檢索', '知識庫', '向量', 'embedding'],
    exam: 'RAG、資料來源、資料品質、生成式 AI 整合應用',
    content: 'RAG 像先翻講義再回答問題：先從知識庫找相關段落，再把段落交給 LLM 組織答案。它可以降低幻覺，但不能完全消除錯誤。',
  },
  {
    key: 'AI Agent',
    words: ['agent', '代理', '任務', '工具', '規劃'],
    exam: 'AI 導入規劃、系統整合、生成式 AI 應用',
    content: 'AI Agent 像一位會拆任務的專案助理：它不只回答，還會判斷目標、選工具、執行步驟、檢查結果。考試常用它和 Chatbot 或 Workflow 比較。',
  },
  {
    key: '治理與風險',
    words: ['風險', '治理', '隱私', '幻覺', '偏見', '提示注入', '資安'],
    exam: 'AI 治理、資料隱私與安全、生成式 AI 風險管理',
    content: '治理像交通規則：不是讓車不能開，而是定義誰能開、開到哪裡、出事怎麼追。Agent 因為會串工具，所以權限、紀錄、審核比單純聊天更重要。',
  },
  {
    key: '導入評估',
    words: ['poc', 'pilot', 'kpi', 'roi', 'tco', '導入', '評估', '成本'],
    exam: '生成式 AI 導入評估規劃、KPI/ROI/TCO、PoC/Pilot',
    content: '導入評估像試開店：PoC 先證明可不可行，Pilot 小規模放到真流程，KPI 看成效，ROI 看值不值得，TCO 看總成本。',
  },
  {
    key: 'No Code / Low Code',
    words: ['no code', 'low code', 'nocode', 'lowcode', '低程式碼', '無程式碼'],
    exam: 'No Code / Low Code 概念、優勢與限制',
    content: 'No Code 像用積木組工具，Low Code 像積木加少量客製零件。它們適合快速驗證流程，但遇到複雜權限、資安或深度整合時常需要工程支援。',
  },
  {
    key: '模型評估',
    words: ['accuracy', 'precision', 'recall', 'f1', '評估', '模型'],
    exam: '機器學習模型、評估指標、泛化能力',
    content: '模型評估像考試成績單：Accuracy 看整體答對率，Precision 看說是正例時有多準，Recall 看真正重要案例有沒有漏掉，F1 在 Precision 與 Recall 間取平衡。',
  },
];

const agentSteps = [
  {
    title: '1. 目標輸入',
    exam: '問題定義、利害關係人、需求盤點',
    run: (question) => `使用者目標是：「${question}」。Agent 先判斷這不是單純聊天，而是備考整理任務，所以要輸出考點、比較表、風險提醒與複習建議。`,
  },
  {
    title: '2. 任務拆解',
    exam: 'AI 導入規劃、工作流程、人機協作',
    run: () => 'Agent 將任務拆成四步：找相關概念、整理白話解釋、對應考題比較、補上實務導入重點。這就像專案管理先拆 WBS，避免直接亂答。',
  },
  {
    title: '3. 知識檢索',
    exam: 'RAG、資料來源、資料品質、Embedding',
    run: (question, matches) => `從內建知識庫命中 ${matches.map((item) => item.key).join('、') || '一般 AI 導入'}。這模擬 RAG 的檢索階段：先找可信資料，再生成答案。`,
  },
  {
    title: '4. 答案生成',
    exam: '生成式 AI、LLM、Prompt Engineering',
    run: (_question, matches) => {
      const selected = matches.length ? matches : knowledgeBase.slice(0, 3);
      return selected.map((item) => `【${item.key}】${item.content}`).join('\n');
    },
  },
  {
    title: '5. 風險檢查',
    exam: '資料隱私、安全、幻覺、偏見、提示注入',
    run: () => '風險檢查結果：避免輸入個資或公司機密；答案需標示資料來源；高風險決策要有人審核；工具權限採最小權限；保留操作紀錄供稽核。',
  },
  {
    title: '6. KPI 評估',
    exam: 'KPI、ROI、TCO、PoC、Pilot、部署監控',
    run: () => '建議 KPI：答題正確率提升、查資料時間下降、錯題回收率、使用者滿意度、人工審核通過率。PoC 看可行性，Pilot 看真流程穩定度，正式導入再看 ROI 與 TCO。',
  },
];

const examBridge = [
  ['AI/ML/GenAI', 'Agent 使用生成式 AI 產生回覆，但也可能結合機器學習分類、推薦與預測。'],
  ['資料處理', '知識庫品質會影響檢索結果；資料要整理、去重、分級與控權。'],
  ['RAG', 'Agent 常把 RAG 當工具，先查可信資料再回答，降低幻覺。'],
  ['No Code / Low Code', '可用低程式碼平台快速做 PoC，但正式導入仍要評估整合與資安。'],
  ['導入規劃', '從問題定義、PoC、Pilot 到部署監控，Agent 是一個需要管理的系統。'],
  ['治理風險', 'Agent 會執行工具，因此權限、審核、紀錄、提示注入防護都比聊天機器人更重要。'],
  ['模型評估', '若 Agent 內含分類或推薦模型，要用 Accuracy、Precision、Recall、F1 等指標評估。'],
  ['中級系統整合', '中級會更重視資料管線、API、部署、監控與 MLOps/LLMOps。'],
];

function matchKnowledge(question) {
  const lower = question.toLowerCase();
  return knowledgeBase.filter((item) => item.words.some((word) => lower.includes(word.toLowerCase())));
}

function runAgent() {
  const question = agentQuestion.value.trim() || '請說明 AI Agent 與 iPAS 考點的關係。';
  const matches = matchKnowledge(question);
  const stepsHtml = agentSteps.map((step) => `
    <article class="step-card">
      <div class="step-title">${escapeHtml(step.title)}</div>
      <div class="step-exam">對應考點：${escapeHtml(step.exam)}</div>
      <p>${escapeHtml(step.run(question, matches)).replace(/\n/g, '<br>')}</p>
    </article>
  `).join('');

  const compare = `
    <article class="step-card final-answer">
      <div class="step-title">考試最常比較</div>
      <p><strong>Chatbot</strong> 偏向問答介面；<strong>LLM</strong> 是生成文字的模型；<strong>RAG</strong> 是查資料再回答的方法；<strong>AI Agent</strong> 是會根據目標規劃步驟並使用工具的系統；<strong>Workflow</strong> 是固定流程，自主性通常比 Agent 低。</p>
    </article>
  `;

  agentOutput.innerHTML = stepsHtml + compare;
}

function renderExamBridge() {
  examBridgeList.innerHTML = examBridge.map(([title, body]) => `
    <article class="bridge-card">
      <h4>${escapeHtml(title)}</h4>
      <p>${escapeHtml(body)}</p>
    </article>
  `).join('');
}

searchEl.addEventListener('input', (event) => {
  state.query = event.target.value;
  renderList();
});

weekFiltersEl.addEventListener('click', (event) => {
  const button = event.target.closest('[data-week]');
  if (!button) return;
  state.week = button.dataset.week === 'all' ? 'all' : Number(button.dataset.week);
  buildFilters();
  renderList();
});

listEl.addEventListener('click', (event) => {
  const button = event.target.closest('[data-day]');
  if (button) {
    setMode('notes');
    renderNote(Number(button.dataset.day));
  }
});

prevButton.addEventListener('click', () => renderNote(Math.max(1, state.selectedDay - 1)));
nextButton.addEventListener('click', () => renderNote(Math.min(notes.length, state.selectedDay + 1)));

copyLinkButton.addEventListener('click', async () => {
  const url = location.href;
  try {
    await navigator.clipboard.writeText(url);
    copyLinkButton.textContent = '已複製';
    setTimeout(() => { copyLinkButton.textContent = '複製連結'; }, 1200);
  } catch {
    prompt('請手動複製連結', url);
  }
});

$('menuButton').addEventListener('click', () => {
  document.body.classList.toggle('sidebar-open');
});

notesModeButton.addEventListener('click', () => setMode('notes'));
agentModeButton.addEventListener('click', () => setMode('agent'));
$('agentStartButton').addEventListener('click', () => setMode('agent'));
$('runAgentButton').addEventListener('click', runAgent);

document.querySelectorAll('.prompt-chip').forEach((button) => {
  button.addEventListener('click', () => {
    agentQuestion.value = button.dataset.prompt;
    runAgent();
  });
});

window.addEventListener('hashchange', () => {
  if (location.hash.startsWith('#agent')) {
    setMode('agent');
    return;
  }
  const day = Number(location.hash.replace('#day-', ''));
  if (day && day !== state.selectedDay) {
    state.mode = 'notes';
    setMode('notes');
    renderNote(day);
  }
});

buildFilters();
renderList();
renderExamBridge();
runAgent();
setMode(state.mode);
