(function () {
  'use strict';

  const exams = window.IPAS_EXAMS || [];
  const storagePrefix = 'ipas-exam-progress-v1-';
  const letters = ['A', 'B', 'C', 'D'];
  const examState = {
    activeExam: null,
    questionIndex: 0,
    answers: {},
  };

  const byId = (id) => document.getElementById(id);
  const examHome = byId('examHome');
  const examRunner = byId('examRunner');
  const beginnerExamList = byId('beginnerExamList');
  const intermediateExamList = byId('intermediateExamList');
  const examSidebarList = byId('examSidebarList');
  const questionNumber = byId('questionNumber');
  const questionSubject = byId('questionSubject');
  const questionStem = byId('questionStem');
  const answerOptions = byId('answerOptions');
  const answerFeedback = byId('answerFeedback');
  const questionNavigator = byId('questionNavigator');
  const previousQuestionButton = byId('previousQuestionButton');
  const nextQuestionButton = byId('nextQuestionButton');

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    }[char]));
  }

  function loadAnswers(examId) {
    try {
      const saved = JSON.parse(localStorage.getItem(storagePrefix + examId) || '{}');
      return saved && typeof saved === 'object' ? saved : {};
    } catch {
      return {};
    }
  }

  function saveAnswers() {
    if (!examState.activeExam) return;
    try {
      localStorage.setItem(storagePrefix + examState.activeExam.id, JSON.stringify(examState.answers));
    } catch {
      // 某些瀏覽器會限制本機檔案儲存；作答仍可在目前頁面繼續。
    }
  }

  function clearAnswers(examId) {
    try {
      localStorage.removeItem(storagePrefix + examId);
    } catch {
      // 無法使用本機儲存時，不影響本次作答。
    }
  }

  function answerStats(exam, answers) {
    const entries = Object.entries(answers).filter(([index]) => Number(index) < exam.questions.length);
    const correct = entries.filter(([index, selected]) => exam.questions[Number(index)].answerIndex === Number(selected)).length;
    return {
      answered: entries.length,
      correct,
      percent: entries.length ? Math.round((correct / entries.length) * 100) : 0,
    };
  }

  function examCard(exam) {
    const answers = loadAnswers(exam.id);
    const stats = answerStats(exam, answers);
    const completed = stats.answered === exam.questionCount;
    const action = stats.answered ? '繼續作答' : '開始作答';
    return `
      <article class="exam-card">
        <div class="exam-card-topline">
          <span>第 ${exam.setNumber} 份</span>
          <span>${exam.questionCount} 題</span>
        </div>
        <h4>${escapeHtml(exam.focus)}</h4>
        <p>${completed ? `已完成，答對 ${stats.correct} 題` : `進度 ${stats.answered} / ${exam.questionCount}`}</p>
        <div class="card-progress" aria-hidden="true"><span style="width:${stats.answered * 2}%"></span></div>
        <div class="exam-card-actions">
          <button class="primary-button" type="button" data-start-exam="${exam.id}">${action}</button>
          ${stats.answered ? `<button class="nav-button" type="button" data-reset-exam="${exam.id}">重新作答</button>` : ''}
        </div>
      </article>`;
  }

  function renderExamLists() {
    beginnerExamList.innerHTML = exams.filter((exam) => exam.level === 'beginner').map(examCard).join('');
    intermediateExamList.innerHTML = exams.filter((exam) => exam.level === 'intermediate').map(examCard).join('');
    examSidebarList.innerHTML = exams.map((exam) => {
      const stats = answerStats(exam, loadAnswers(exam.id));
      return `<button type="button" data-start-exam="${exam.id}">
        <span>${escapeHtml(exam.title)}</span>
        <small>${stats.answered}/50</small>
      </button>`;
    }).join('');
  }

  function showExamHome() {
    examState.activeExam = null;
    examHome.classList.remove('hidden');
    examRunner.classList.add('hidden');
    byId('currentTitle').textContent = 'iPAS 模擬考';
    if (location.hash !== '#exam') location.hash = 'exam';
    renderExamLists();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function startExam(examId) {
    const exam = exams.find((item) => item.id === examId);
    if (!exam) return;
    examState.activeExam = exam;
    examState.answers = loadAnswers(examId);
    const firstUnanswered = exam.questions.findIndex((_question, index) => examState.answers[index] === undefined);
    examState.questionIndex = firstUnanswered === -1 ? 0 : firstUnanswered;
    examHome.classList.add('hidden');
    examRunner.classList.remove('hidden');
    byId('currentTitle').textContent = exam.title;
    location.hash = `exam-${exam.id}`;
    renderQuestion();
    document.body.classList.remove('sidebar-open');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function selectAnswer(selectedIndex) {
    const index = examState.questionIndex;
    if (examState.answers[index] !== undefined) return;
    examState.answers[index] = selectedIndex;
    saveAnswers();
    renderQuestion();
  }

  function renderOptions(question, selected) {
    const isAnswered = selected !== undefined;
    answerOptions.innerHTML = question.options.map((option, index) => {
      const classes = ['answer-option'];
      if (isAnswered && index === question.answerIndex) classes.push('correct');
      if (isAnswered && index === selected && index !== question.answerIndex) classes.push('incorrect');
      return `<button class="${classes.join(' ')}" type="button" data-answer-index="${index}"
        ${isAnswered ? 'disabled' : ''} aria-pressed="${selected === index}">
        <span class="option-letter">${letters[index]}</span>
        <span>${escapeHtml(option)}</span>
      </button>`;
    }).join('');
  }

  function renderFeedback(question, selected) {
    if (selected === undefined) {
      answerFeedback.classList.add('hidden');
      answerFeedback.innerHTML = '';
      return;
    }
    const isCorrect = selected === question.answerIndex;
    const optionDetails = question.options.map((option, index) => `
      <li class="${index === question.answerIndex ? 'correct-detail' : ''}">
        <strong>${letters[index]}. ${escapeHtml(option)}</strong>
        <span>${escapeHtml(question.optionExplanations[index])}</span>
      </li>`).join('');
    const stats = answerStats(examState.activeExam, examState.answers);
    const completion = stats.answered === examState.activeExam.questionCount
      ? `<div class="exam-complete">本份考卷已完成：答對 ${stats.correct} / 50 題，得分 ${Math.round((stats.correct / 50) * 100)} 分。可利用題號導覽回頭複習錯題。</div>`
      : '';

    answerFeedback.classList.remove('hidden');
    answerFeedback.innerHTML = `
      <div class="feedback-verdict ${isCorrect ? 'is-correct' : 'is-incorrect'}">
        <strong>${isCorrect ? '答對了' : `答錯了，正確答案是 ${letters[question.answerIndex]}`}</strong>
        <span>${escapeHtml(question.correctReason)}</span>
      </div>
      <h3>各選項解析</h3>
      <ol class="option-explanations">${optionDetails}</ol>
      ${completion}`;
  }

  function renderNavigator(exam) {
    questionNavigator.innerHTML = exam.questions.map((_question, index) => {
      const selected = examState.answers[index];
      const classes = ['question-jump'];
      if (index === examState.questionIndex) classes.push('current');
      if (selected !== undefined) {
        classes.push(selected === exam.questions[index].answerIndex ? 'answered-correct' : 'answered-wrong');
      }
      return `<button class="${classes.join(' ')}" type="button" data-question-index="${index}" aria-label="前往第 ${index + 1} 題">${index + 1}</button>`;
    }).join('');
  }

  function renderQuestion() {
    const exam = examState.activeExam;
    if (!exam) return;
    const index = examState.questionIndex;
    const question = exam.questions[index];
    const selected = examState.answers[index];
    const stats = answerStats(exam, examState.answers);

    questionNumber.textContent = `第 ${index + 1} 題 / 50`;
    questionSubject.textContent = question.subject;
    questionStem.textContent = question.stem;
    byId('answeredCount').textContent = stats.answered;
    byId('correctCount').textContent = stats.correct;
    byId('scorePercent').textContent = `${stats.percent}%`;
    byId('examProgressBar').style.width = `${stats.answered * 2}%`;
    previousQuestionButton.disabled = index === 0;
    nextQuestionButton.disabled = index === exam.questions.length - 1;
    nextQuestionButton.textContent = index === exam.questions.length - 1 ? '已到最後一題' : '下一題';

    renderOptions(question, selected);
    renderFeedback(question, selected);
    renderNavigator(exam);
  }

  function resetExam(examId) {
    const exam = exams.find((item) => item.id === examId);
    if (!exam) return;
    const confirmed = window.confirm(`確定要清除「${exam.title}」的作答紀錄並重新開始嗎？`);
    if (!confirmed) return;
    clearAnswers(examId);
    startExam(examId);
  }

  document.addEventListener('click', (event) => {
    const startButton = event.target.closest('[data-start-exam]');
    if (startButton) {
      startExam(startButton.dataset.startExam);
      return;
    }
    const resetButton = event.target.closest('[data-reset-exam]');
    if (resetButton) {
      resetExam(resetButton.dataset.resetExam);
      return;
    }
    const answerButton = event.target.closest('[data-answer-index]');
    if (answerButton) selectAnswer(Number(answerButton.dataset.answerIndex));
    const jumpButton = event.target.closest('[data-question-index]');
    if (jumpButton) {
      examState.questionIndex = Number(jumpButton.dataset.questionIndex);
      renderQuestion();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  byId('backToExamsButton').addEventListener('click', showExamHome);
  previousQuestionButton.addEventListener('click', () => {
    examState.questionIndex = Math.max(0, examState.questionIndex - 1);
    renderQuestion();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  nextQuestionButton.addEventListener('click', () => {
    const exam = examState.activeExam;
    if (!exam) return;
    examState.questionIndex = Math.min(exam.questions.length - 1, examState.questionIndex + 1);
    renderQuestion();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  renderExamLists();
  window.addEventListener('hashchange', () => {
    if (location.hash === '#exam') showExamHome();
  });
  const hashExamId = location.hash.replace(/^#exam-/, '');
  if (location.hash.startsWith('#exam-') && exams.some((exam) => exam.id === hashExamId)) {
    startExam(hashExamId);
  }

  window.IPAS_EXAM_APP = { renderHome: showExamHome, startExam };
}());
