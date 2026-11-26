(() => {
  const byId = (id) => document.getElementById(id);

  const answerIndex = (question, optionCount) => {
    const value = question.correct ?? question.answerIndex ?? question.correctOption ?? question.answer;
    if (Number.isInteger(value)) {
      if (value >= 0 && value < optionCount) return value;
      if (value > 0 && value <= optionCount) return value - 1;
      return -1;
    }
    if (typeof value === 'string') {
      const letter = value.trim().match(/^([A-Z])(?:\b|[.)])/i);
      if (letter) return letter[1].toUpperCase().charCodeAt(0) - 65;
      const exact = (question.options || []).findIndex((option) => String(option) === value.trim());
      return exact;
    }
    return -1;
  };

  const safeStorage = {
    read(key) {
      try { return JSON.parse(window.localStorage.getItem(key) || 'null'); }
      catch (_error) { return null; }
    },
    write(key, value) {
      try { window.localStorage.setItem(key, JSON.stringify(value)); }
      catch (_error) { /* The test remains usable for this visit without storage. */ }
    }
  };

  window.startTest = (questionSet) => {
    const questions = Array.isArray(questionSet?.questions) ? questionSet.questions : [];
    const startButton = byId('btn-start-test');
    const preTest = byId('pre-test-section');
    const testSection = byId('test-section');
    const resultsSection = byId('results-section');
    const optionList = byId('options-list');
    const questionText = byId('q-text');
    const questionNumber = byId('q-number-label');
    const questionGrid = byId('q-grid');
    const timerDisplay = byId('timer-display');
    const warningModal = byId('warning-modal');
    const unansweredCount = byId('modal-unanswered-count');

    if (!questions.length || !startButton || !preTest || !testSection || !resultsSection || !optionList) return;

    const title = questionSet.name || document.title || 'PSC practice test';
    const minutesValue = Number(questionSet.durationMinutes ?? questionSet.timeLimitMinutes ?? questionSet.duration);
    const durationSeconds = (Number.isFinite(minutesValue) && minutesValue > 0
      ? Math.ceil(minutesValue)
      : Math.max(1, questions.length)) * 60;
    const route = window.location?.pathname || 'practice-test';
    const testId = String(questionSet.id || title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const storageKey = `psc-test-attempt:${route}:${testId}`;
    const previousAttempt = safeStorage.read(storageKey);
    let answers = Array(questions.length).fill(null);
    let activeIndex = 0;
    let remainingSeconds = durationSeconds;
    let timerId = null;
    let submitted = false;

    const byIdText = (id, value) => {
      const element = byId(id);
      if (element) element.textContent = value;
    };
    const setVisible = (element, visible) => {
      if (element) element.style.display = visible ? '' : 'none';
    };
    const formatClock = (seconds) => {
      const mins = Math.floor(Math.max(0, seconds) / 60);
      const secs = Math.max(0, seconds) % 60;
      return `${mins}:${String(secs).padStart(2, '0')}`;
    };
    const getOptions = (question) => Array.isArray(question.options) ? question.options : [];
    const updateTimer = () => {
      if (!timerDisplay) return;
      timerDisplay.textContent = formatClock(remainingSeconds);
      timerDisplay.classList.toggle('warning-yellow', remainingSeconds <= 300 && remainingSeconds > 60);
      timerDisplay.classList.toggle('warning-red', remainingSeconds <= 60);
    };

    byIdText('hero-set-name', title);
    byIdText('hero-details', questionSet.details || 'Choose an answer for each question, then submit to review your result.');
    byIdText('hero-q-count', String(questions.length));
    byIdText('hero-time', formatClock(durationSeconds));
    byIdText('sidebar-total', `Total: ${questions.length}`);

    const saveAnswer = (index, choice) => {
      answers[index] = choice;
      const card = optionList.querySelectorAll('li')[choice];
      if (card) card.classList.add('selected');
      const dot = questionGrid?.querySelectorAll('.q-dot')[index];
      if (dot) dot.classList.add('answered');
      const count = answers.filter((answer) => answer !== null).length;
      byIdText('sidebar-answered-num', String(count));
    };

    const renderGrid = () => {
      if (!questionGrid) return;
      questionGrid.replaceChildren();
      questions.forEach((_question, index) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'q-dot';
        dot.textContent = String(index + 1);
        dot.setAttribute('aria-label', `Go to question ${index + 1}`);
        dot.addEventListener('click', () => renderQuestion(index));
        questionGrid.append(dot);
      });
    };

    const renderQuestion = (index) => {
      if (index < 0 || index >= questions.length || submitted) return;
      activeIndex = index;
      const question = questions[index] || {};
      const options = getOptions(question);
      if (questionNumber) questionNumber.textContent = `QUESTION ${index + 1}`;
      if (questionText) questionText.textContent = String(question.question ?? question.text ?? 'Question');
      optionList.replaceChildren();
      options.forEach((option, optionIndex) => {
        const item = document.createElement('li');
        if (answers[index] === optionIndex) item.classList.add('selected');
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = `question-${index}`;
        input.value = String(optionIndex);
        input.checked = answers[index] === optionIndex;
        input.setAttribute('aria-label', `Option ${String.fromCharCode(65 + optionIndex)}: ${String(option)}`);
        const letter = document.createElement('span');
        letter.className = 'option-letter';
        letter.textContent = String.fromCharCode(65 + optionIndex);
        const label = document.createElement('span');
        label.className = 'option-copy';
        label.textContent = String(option);
        const select = () => {
          if (submitted) return;
          answers[index] = optionIndex;
          optionList.querySelectorAll('li').forEach((row) => row.classList.remove('selected'));
          item.classList.add('selected');
          input.checked = true;
          const dot = questionGrid?.querySelectorAll('.q-dot')[index];
          if (dot) dot.classList.add('answered');
          byIdText('sidebar-answered-num', String(answers.filter((answer) => answer !== null).length));
        };
        input.addEventListener('change', select);
        item.addEventListener('click', (event) => {
          if (event.target !== input) select();
        });
        item.append(input, letter, label);
        optionList.append(item);
      });

      const dots = questionGrid?.querySelectorAll('.q-dot') || [];
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('current', dotIndex === index);
        dot.classList.toggle('answered', answers[dotIndex] !== null);
      });
      const previous = byId('btn-prev');
      const next = byId('btn-next');
      if (previous) previous.disabled = index === 0;
      if (next) next.disabled = index === questions.length - 1;
    };

    const makeResultCard = (question, index, chosen) => {
      const options = getOptions(question);
      const correct = answerIndex(question, options.length);
      const isCorrect = chosen !== null && chosen === correct;
      const card = document.createElement('article');
      card.className = `result-card ${isCorrect ? 'correct' : 'incorrect'}`;
      const badge = document.createElement('span');
      badge.className = `r-badge ${isCorrect ? 'correct-badge' : 'incorrect-badge'}`;
      badge.textContent = chosen === null ? 'Unanswered' : (isCorrect ? 'Correct' : 'Review');
      const text = document.createElement('p');
      text.className = 'r-q-text';
      text.textContent = `${index + 1}. ${String(question.question ?? question.text ?? 'Question')}`;
      const list = document.createElement('ul');
      list.className = 'r-options';
      options.forEach((option, optionIndex) => {
        const row = document.createElement('li');
        if (optionIndex === correct && optionIndex === chosen) row.classList.add('both-correct');
        else {
          if (optionIndex === correct) row.classList.add('correct-answer');
          if (optionIndex === chosen) row.classList.add('user-answer');
        }
        row.textContent = `${String.fromCharCode(65 + optionIndex)}. ${String(option)}`;
        list.append(row);
      });
      card.append(badge, text, list);
      const explanationText = question.explanation ?? question.reason ?? question.solution;
      if (explanationText) {
        const explanation = document.createElement('p');
        explanation.className = 'r-explanation';
        explanation.textContent = `Explanation: ${String(explanationText)}`;
        card.append(explanation);
      }
      return { card, isCorrect };
    };

    const showResults = (chosenAnswers, savedAttempt = null) => {
      submitted = true;
      if (timerId !== null) window.clearInterval(timerId);
      setVisible(preTest, false);
      setVisible(testSection, false);
      setVisible(warningModal, false);
      setVisible(resultsSection, true);
      if (timerDisplay) timerDisplay.style.display = 'none';
      const normalized = Array.from({ length: questions.length }, (_, i) => {
        const value = chosenAnswers?.[i];
        return Number.isInteger(value) && value >= 0 && value < getOptions(questions[i]).length ? value : null;
      });
      let score = 0;
      const details = byId('results-detail');
      if (details) details.replaceChildren();
      questions.forEach((question, index) => {
        const result = makeResultCard(question, index, normalized[index]);
        if (result.isCorrect) score += 1;
        if (details) details.append(result.card);
      });
      const percent = Math.round((score / questions.length) * 100);
      byIdText('results-set-name', title);
      byIdText('results-score', String(score));
      byIdText('results-denom', `/ ${questions.length}`);
      byIdText('results-percentage', `${percent}%`);
      const elapsed = Number(savedAttempt?.elapsedSeconds);
      const timeUsed = Number.isFinite(elapsed) && elapsed >= 0
        ? elapsed
        : Math.max(0, durationSeconds - remainingSeconds);
      byIdText('results-time-taken', `Time taken: ${formatClock(timeUsed)}`);
      if (!savedAttempt) safeStorage.write(storageKey, { submitted: true, score, total: questions.length, answers: normalized, elapsedSeconds: timeUsed });
    };

    const submit = () => {
      if (submitted) return;
      const unanswered = answers.filter((answer) => answer === null).length;
      if (unanswered > 0 && warningModal) {
        byIdText('modal-unanswered-count', `${unanswered} unanswered`);
        warningModal.style.display = 'flex';
        const submitAnyway = byId('btn-modal-submit');
        if (submitAnyway) submitAnyway.focus();
        return;
      }
      showResults(answers);
    };

    const start = () => {
      if (submitted) return;
      setVisible(preTest, false);
      setVisible(testSection, true);
      if (timerDisplay) timerDisplay.style.display = '';
      updateTimer();
      renderQuestion(0);
      timerId = window.setInterval(() => {
        remainingSeconds -= 1;
        updateTimer();
        if (remainingSeconds <= 0) showResults(answers);
      }, 1000);
    };

    renderGrid();
    if (startButton) startButton.addEventListener('click', start);
    const previousButton = byId('btn-prev');
    const nextButton = byId('btn-next');
    const submitButton = byId('btn-submit-test');
    const cancelButton = byId('btn-modal-cancel');
    const submitAnywayButton = byId('btn-modal-submit');
    if (previousButton) previousButton.addEventListener('click', () => renderQuestion(activeIndex - 1));
    if (nextButton) nextButton.addEventListener('click', () => renderQuestion(activeIndex + 1));
    if (submitButton) submitButton.addEventListener('click', submit);
    if (cancelButton) cancelButton.addEventListener('click', () => setVisible(warningModal, false));
    if (submitAnywayButton) submitAnywayButton.addEventListener('click', () => showResults(answers));

    if (previousAttempt?.submitted) {
      byIdText('hero-note', 'This test has already been submitted in this browser. You can review your saved result below.');
      startButton.disabled = true;
      showResults(previousAttempt.answers || [], previousAttempt);
    }
  };
})();
