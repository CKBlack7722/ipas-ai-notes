const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const projectRoot = path.join(__dirname, '..');
const reader = fs.existsSync(path.join(projectRoot, 'web-reader', 'index.html'))
  ? path.join(projectRoot, 'web-reader') : projectRoot;
const dataSource = fs.readFileSync(path.join(reader, 'notes-data.js'), 'utf8');
const appSource = fs.readFileSync(path.join(reader, 'app.js'), 'utf8');
const dataset = { window: {} };
vm.runInNewContext(dataSource, dataset);
const notes = dataset.window.IPAS_NOTES;
assert.equal(notes.length, 15);
assert.equal(JSON.stringify(JSON.parse(fs.readFileSync(path.join(__dirname, 'course-data.json'), 'utf8'))), JSON.stringify(notes));
const html = fs.readFileSync(path.join(reader, 'index.html'), 'utf8');
for (const [, script] of html.matchAll(/<script src="([^"]+)"/g)) {
  assert.ok(fs.existsSync(path.join(reader, script)), `缺少網頁腳本 ${script}`);
}
assert.ok(html.includes('15 日講義'));
assert.ok(!html.includes('60 日教材'));
const expectedCodes = [
  'L21101', 'L21102', 'L21103', 'L21104', 'L21201', 'L21202', 'L21203', 'L21301', 'L21302',
  'L22101', 'L22102', 'L22103', 'L22201', 'L22202', 'L22203', 'L22301', 'L22302', 'L22303',
  'L22401', 'L22402', 'L22403', 'L22404',
];
const covered = new Set(notes.slice(0, 14).flatMap((note) => note.codes));
for (const code of expectedCodes) assert.ok(covered.has(code), `未涵蓋 ${code}`);
for (const [index, note] of notes.entries()) {
  assert.equal(note.day, index + 1);
  assert.equal(note.level, 'intermediate');
  assert.ok(note.codes.every((code) => /^L2[12]/.test(code)));
  assert.ok(note.text.length > 1800);
  assert.ok(note.text.includes('自我測驗與解析'));
  assert.equal(fs.readFileSync(path.join(__dirname, 'daily-notes', note.filename), 'utf8'), note.text);
}

function openReader(hash) {
  const elements = new Map();
  const classes = () => {
    const set = new Set();
    return { remove: (key) => set.delete(key), toggle: (key, enabled) => enabled ? set.add(key) : set.delete(key), contains: (key) => set.has(key) };
  };
  const element = (id) => {
    if (!elements.has(id)) elements.set(id, {
      innerHTML: '', textContent: '', value: 'RAG', disabled: false, classList: classes(),
      listeners: {}, addEventListener(name, handler) { this.listeners[name] = handler; },
    });
    return elements.get(id);
  };
  const context = {
    document: { getElementById: element, querySelectorAll: () => [], body: { classList: classes() } },
    location: { hash }, navigator: {}, setTimeout: () => {}, prompt: () => {},
    window: { IPAS_NOTES: notes, scrollTo: () => {}, listeners: {}, addEventListener(name, handler) { this.listeners[name] = handler; } },
  };
  vm.runInNewContext(appSource, context);
  return { context, element };
}

const first = openReader('#day-1');
assert.equal(first.element('prevButton').disabled, true);
assert.equal(first.element('nextButton').disabled, false);
assert.match(first.element('currentTitle').textContent, /自然語言/);
const last = openReader('#day-15');
assert.equal(last.element('nextButton').disabled, true);
assert.equal(last.element('prevButton').disabled, false);
last.element('prevButton').listeners.click();
assert.match(last.element('currentTitle').textContent, /Day 14/);
const legacy = openReader('#day-60');
assert.equal(legacy.context.location.hash, 'day-1');
first.element('searchInput').listeners.input({ target: { value: '卜瓦松' } });
assert.match(first.element('noteList').innerHTML, /Day 9/);
first.element('weekFilters').listeners.click({ target: { closest: () => ({ dataset: { week: '2' } }) } });
assert.ok(!first.element('noteList').innerHTML.includes('Day 1</span>'));
first.element('agentModeButton').listeners.click();
first.context.location.hash = '#day-1';
first.context.window.listeners.hashchange();
assert.equal(first.element('readerView').classList.contains('hidden'), false);
const examContext = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(reader, 'exam-data.js'), 'utf8'), examContext);
assert.equal(examContext.window.IPAS_EXAMS.length, 6);
assert.ok(examContext.window.IPAS_EXAMS.every((exam) => exam.questions.length === 50));
console.log(JSON.stringify({ days: 15, coverage: covered.size, readableFiles: 15, examSetsPreserved: 6, readerNavigation: 'pass', searchAndFilter: 'pass' }));
