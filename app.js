const notes = window.IPAS_NOTES || [];
const state = {
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

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#039;',
}[char]));

function weekLabel(week) {
  return week <= 8 ? `第 ${week} 週` : '緩衝';
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
    const inQuery = !query || `${note.title}\n${note.text}`.toLowerCase().includes(query);
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
  }).join('') || '<div class="empty-state">找不到符合的筆記</div>';
}

function lineToHtml(line, index) {
  const clean = line.trim();
  if (!clean) return '';
  if (/^=+$/.test(clean) || /^-+$/.test(clean)) return '<div class="section-rule"></div>';
  if (index === 0) return `<h2>${escapeHtml(clean)}</h2>`;
  if (/^[一二三四五六七八九十]+、/.test(clean) || /^Day \d+/.test(clean) || /^Week \d+/.test(clean)) {
    return `<h3>${escapeHtml(clean)}</h3>`;
  }
  if (/^(主題|學習目標|核心知識|名詞解釋|常見考法|常見陷阱|今日練習|完成標準|補充資源|任務|做法|重點|案例|資料|風險|KPI|對策|必記|必背名詞|作答策略|檢討分類|今日任務|錯題模板|主要風險|流程|優勢|限制|比較|適合情境|不適合情境|工具類型|善用方法|基本流程|判斷口訣|考試口訣|核心觀念|作答流程|結果判讀|六大評估面向)[:：]?$/.test(clean)) {
    return `<h4>${escapeHtml(clean)}</h4>`;
  }
  return `<p>${escapeHtml(clean)}</p>`;
}

function renderNote(day) {
  const note = notes.find((item) => item.day === day) || notes[0];
  if (!note) return;

  state.selectedDay = note.day;
  if (location.hash !== `#day-${note.day}`) location.hash = `day-${note.day}`;
  titleEl.textContent = note.title;

  const body = note.text.split(/\r?\n/).map(lineToHtml).filter(Boolean).join('\n');
  contentEl.innerHTML = `<div class="note-meta">${weekLabel(note.week)} · ${escapeHtml(note.filename)}</div>${body}`;

  prevButton.disabled = note.day <= 1;
  nextButton.disabled = note.day >= 60;
  renderList();
  document.body.classList.remove('sidebar-open');
  window.scrollTo({ top: 0, behavior: 'smooth' });
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
  if (button) renderNote(Number(button.dataset.day));
});

prevButton.addEventListener('click', () => renderNote(Math.max(1, state.selectedDay - 1)));
nextButton.addEventListener('click', () => renderNote(Math.min(60, state.selectedDay + 1)));

copyLinkButton.addEventListener('click', async () => {
  const url = location.href;
  try {
    await navigator.clipboard.writeText(url);
    copyLinkButton.textContent = '已複製';
    setTimeout(() => { copyLinkButton.textContent = '複製連結'; }, 1200);
  } catch {
    prompt('複製這個連結', url);
  }
});

$('menuButton').addEventListener('click', () => {
  document.body.classList.toggle('sidebar-open');
});

window.addEventListener('hashchange', () => {
  const day = Number(location.hash.replace('#day-', ''));
  if (day && day !== state.selectedDay) renderNote(day);
});

buildFilters();
renderNote(state.selectedDay);
