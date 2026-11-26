(() => {
  const searchInput = document.getElementById('subject-search');
  const subjectCards = Array.from(document.querySelectorAll('[data-subject]'));
  const searchStatus = document.getElementById('search-status');
  const noResults = document.getElementById('no-results');

  if (searchInput && subjectCards.length) {
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.trim().toLowerCase();
      let visibleCount = 0;
      subjectCards.forEach((card) => {
        const searchableText = `${card.dataset.subject} ${card.textContent}`.toLowerCase();
        const matches = !query || searchableText.includes(query);
        card.hidden = !matches;
        if (matches) visibleCount += 1;
      });
      if (searchStatus) {
        searchStatus.textContent = query
          ? `Showing ${visibleCount} of ${subjectCards.length} topic groups`
          : 'Showing all topic groups';
      }
      if (noResults) noResults.hidden = visibleCount !== 0;
    });
  }

  const quizForm = document.getElementById('quiz-form');
  const quizResult = document.getElementById('quiz-result');
  const newQuizButton = document.getElementById('new-quiz');
  const questionBank = [
    {
      question: 'For steady incompressible flow through a section, which relation gives discharge Q?',
      options: ['Q = A × V', 'Q = A ÷ V', 'Q = V ÷ A', 'Q = A + V'],
      answer: 0,
      explanation: 'Discharge is the flow area multiplied by mean velocity: Q = A × V.'
    },
    {
      question: 'A benchmark RL is 100.000 m. With one instrument setup, BS = 1.315 m and FS = 2.040 m. What is the foresight point RL?',
      options: ['99.275 m', '101.725 m', '102.040 m', '98.685 m'],
      answer: 0,
      explanation: 'HI = 100.000 + 1.315 = 101.315 m; RL = HI − FS = 99.275 m.'
    },
    {
      question: 'In basic soil mechanics, gravimetric water content is the ratio of:',
      options: ['Mass of water to mass of dry soil', 'Mass of dry soil to total sample volume', 'Volume of air to volume of voids', 'Mass of water to mass of solids plus water'],
      answer: 0,
      explanation: 'Water content w is mass of water divided by mass of dry soil, usually expressed as a percentage.'
    },
    {
      question: 'For a simply supported beam of span L carrying a uniformly distributed load w over the full span, the maximum bending moment is:',
      options: ['wL² ÷ 8', 'wL² ÷ 2', 'wL ÷ 8', 'wL² ÷ 12'],
      answer: 0,
      explanation: 'For this loading case, the maximum moment occurs at midspan and equals wL²/8.'
    },
    {
      question: 'Under uniform flow in an open channel, which statement is used in the Manning equation?',
      options: ['Energy slope equals bed slope', 'Energy slope is always zero', 'Bed slope equals the wetted perimeter', 'Velocity is independent of channel slope'],
      answer: 0,
      explanation: 'For uniform flow, the energy grade line, water surface, and channel bed are parallel; the energy slope equals the bed slope.'
    },
    {
      question: 'A concrete mix has a water-cement ratio of 0.50 by mass. For 300 kg of cement, how much water corresponds to that ratio?',
      options: ['150 kg', '300 kg', '600 kg', '15 kg'],
      answer: 0,
      explanation: 'Water-cement ratio = water mass ÷ cement mass. Therefore, water mass = 0.50 × 300 = 150 kg.'
    },
    {
      question: 'In Manning’s equation for open-channel flow, the hydraulic radius R is:',
      options: ['Flow area divided by wetted perimeter', 'Wetted perimeter divided by flow area', 'Flow depth divided by channel width', 'Discharge divided by area'],
      answer: 0,
      explanation: 'Hydraulic radius R is A/P, where A is flow area and P is wetted perimeter.'
    },
    {
      question: 'For a level instrument setup, the height of instrument (HI) is found by:',
      options: ['Known RL + backsight', 'Known RL − backsight', 'Foresight − known RL', 'Known RL + foresight'],
      answer: 0,
      explanation: 'In the height-of-instrument method, HI = RL of the known point + backsight.'
    }
  ];

  let activeQuestions = [];

  function shuffle(items) {
    const shuffled = items.slice();
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  function renderQuiz() {
    if (!quizForm) return;
    activeQuestions = shuffle(questionBank).slice(0, 5).map((item) => {
      const choices = shuffle(item.options.map((option, index) => ({ option, correct: index === item.answer })));
      return {
        ...item,
        options: choices.map((choice) => choice.option),
        answer: choices.findIndex((choice) => choice.correct)
      };
    });
    quizForm.replaceChildren();
    if (quizResult) quizResult.textContent = '';

    activeQuestions.forEach((question, questionIndex) => {
      const fieldset = document.createElement('fieldset');
      fieldset.className = 'quiz-question';
      const legend = document.createElement('legend');
      const number = document.createElement('span');
      number.textContent = `${String(questionIndex + 1).padStart(2, '0')} ·`;
      legend.append(number, document.createTextNode(question.question));
      fieldset.append(legend);

      const answerList = document.createElement('div');
      answerList.className = 'answer-list';
      question.options.forEach((option, optionIndex) => {
        const label = document.createElement('label');
        label.className = 'answer-option';
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = `question-${questionIndex}`;
        input.value = String(optionIndex);
        input.required = true;
        const text = document.createElement('span');
        text.textContent = option;
        label.append(input, text);
        answerList.append(label);
      });
      fieldset.append(answerList);

      const explanation = document.createElement('p');
      explanation.className = 'quiz-explanation';
      explanation.hidden = true;
      fieldset.append(explanation);
      quizForm.append(fieldset);
    });

    const submit = document.createElement('button');
    submit.className = 'button button-primary quiz-submit';
    submit.type = 'submit';
    submit.textContent = 'Check my answers';
    quizForm.append(submit);
  }

  if (quizForm) {
    quizForm.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!quizForm.reportValidity()) return;

      let score = 0;
      activeQuestions.forEach((question, questionIndex) => {
        const fieldset = quizForm.querySelectorAll('.quiz-question')[questionIndex];
        const chosen = Number(quizForm.querySelector(`input[name="question-${questionIndex}"]:checked`).value);
        const labels = fieldset.querySelectorAll('.answer-option');
        labels.forEach((label, optionIndex) => {
          const input = label.querySelector('input');
          input.disabled = true;
          if (optionIndex === question.answer) label.classList.add('is-correct');
          if (optionIndex === chosen && chosen !== question.answer) label.classList.add('is-wrong');
        });
        const explanation = fieldset.querySelector('.quiz-explanation');
        const lead = document.createElement('strong');
        lead.textContent = chosen === question.answer ? 'Correct. ' : 'Review. ';
        explanation.append(lead, document.createTextNode(question.explanation));
        explanation.hidden = false;
        if (chosen === question.answer) score += 1;
      });

      const resultMessage = score === 5
        ? 'Excellent — 5 out of 5. Keep the reasoning fresh with spaced review.'
        : score >= 3
          ? `Good work — ${score} out of 5. Review the explanations, then try another set.`
          : `${score} out of 5. That is a useful diagnostic — revisit the topics and try again.`;
      if (quizResult) quizResult.textContent = resultMessage;
      const submit = quizForm.querySelector('.quiz-submit');
      if (submit) submit.disabled = true;
    });
    renderQuiz();
  }

  if (newQuizButton && quizForm) {
    newQuizButton.addEventListener('click', () => {
      renderQuiz();
      const heading = document.getElementById('practice-heading');
      if (heading) heading.focus({ preventScroll: true });
    });
  }

  const planChecks = Array.from(document.querySelectorAll('[data-plan-check]'));
  const progressLabel = document.getElementById('progress-label');
  const progressTrack = document.getElementById('progress-track');
  const progressFill = document.getElementById('progress-fill');
  const storageKey = 'civprepmaster-psc-study-plan-v1';

  if (planChecks.length) {
    let savedPlan = {};
    try {
      savedPlan = JSON.parse(window.localStorage.getItem(storageKey) || '{}') || {};
    } catch (_error) {
      savedPlan = {};
    }

    planChecks.forEach((checkbox) => {
      checkbox.checked = Boolean(savedPlan[checkbox.dataset.planCheck]);
    });

    const updateProgress = () => {
      const completed = planChecks.filter((checkbox) => checkbox.checked).length;
      const percent = Math.round((completed / planChecks.length) * 100);
      if (progressLabel) progressLabel.textContent = `${completed} of ${planChecks.length} weeks complete`;
      if (progressTrack) progressTrack.setAttribute('aria-valuenow', String(completed));
      if (progressFill) progressFill.style.width = `${percent}%`;
      const nextState = {};
      planChecks.forEach((checkbox) => { nextState[checkbox.dataset.planCheck] = checkbox.checked; });
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(nextState));
      } catch (_error) {
        // Progress still updates for this visit when browser storage is unavailable.
      }
    };

    planChecks.forEach((checkbox) => checkbox.addEventListener('change', updateProgress));
    updateProgress();
  }
})();
