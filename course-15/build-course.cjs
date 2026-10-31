const fs = require('node:fs');
const path = require('node:path');
const lessons = require('./course-source.js');
const projectRoot = path.join(__dirname, '..');
const readerRoot = fs.existsSync(path.join(projectRoot, 'web-reader', 'index.html'))
  ? path.join(projectRoot, 'web-reader') : projectRoot;

const args = process.argv.slice(2);
const sampleOnly = args.includes('--sample');
const selected = sampleOnly ? lessons.slice(0, 1) : lessons;
if (!sampleOnly && lessons.length !== 15) throw new Error('完整教材必須包含 15 日');

const sources = [
  '官方考試資訊：https://ipd.nat.gov.tw/ipas/certification/AIAP/exam-info',
  '官方學習資源：https://ipd.nat.gov.tw/ipas/certification/AIAP/learning-resources',
];
const notes = selected.map((lesson) => {
  const filename = `DAY${String(lesson.day).padStart(2, '0')}.txt`;
  const title = `Day ${String(lesson.day).padStart(2, '0')}：${lesson.topic}`;
  const text = `# ${title}\n\n等級：中級\n對應科目：${lesson.subject}\n評鑑對照：${lesson.codes.join('、')}\n\n## 一小時安排\n5 分鐘回想前日概念；30 分鐘讀知識與例子；15 分鐘做算例與測驗；10 分鐘閉卷說明並記錄錯因。首日的回想改為盤點已知概念。\n\n${lesson.body}\n\n## 來源與延伸\n核對日期：2026-10-31。評鑑主題依官方學習指引對照；正文為原創白話教學，練習與出題方向為編寫者推導，非官方題庫或命題頻率統計。\n${sources.join('\n')}\n免費延伸：在官方學習資源頁選中級科目一／科目二指引並搭配中級勘誤表，依本日評鑑代碼定位章節；先完成講義，卡住時再補讀對應章節，不必先看完整部影片。\n`;
  if (lesson.body.length < 900) throw new Error(`Day ${lesson.day} 內容不足`);
  if (!['必備名詞', '可能出題', '自我測驗'].every((term) => text.includes(term))) throw new Error(`Day ${lesson.day} 缺少教學段落`);
  const { body, ...metadata } = lesson;
  const subjectNumber = lesson.day <= 7 ? 1 : (lesson.day <= 14 ? 2 : 3);
  return { ...metadata, subjectNumber, level: 'intermediate', week: subjectNumber, filename, title, text };
});
const outputDir = path.join(__dirname, sampleOnly ? 'sample' : 'daily-notes');
fs.mkdirSync(outputDir, { recursive: true });
for (const note of notes) fs.writeFileSync(path.join(outputDir, note.filename), note.text, 'utf8');
if (!sampleOnly) {
  fs.writeFileSync(path.join(readerRoot, 'notes-data.js'), `window.IPAS_NOTES = ${JSON.stringify(notes, null, 2)};\n`, 'utf8');
  fs.writeFileSync(path.join(__dirname, 'course-data.json'), JSON.stringify(notes, null, 2) + '\n', 'utf8');
}
console.log(JSON.stringify({ sampleOnly, days: notes.length, totalCharacters: notes.reduce((sum, note) => sum + note.text.length, 0), outputDir }));
