/* Shared engine for the static practice-test pages. */
(function () {
    'use strict';
    window.startTest = function (set) {
        const el = id => document.getElementById(id);
        const text = (id, value) => { if (el(id)) el(id).textContent = value; };
        const show = (id, visible) => { if (el(id)) el(id).style.display = visible ? '' : 'none'; };
        if (!set || !Array.isArray(set.questions) || !set.questions.length) {
            text('hero-set-name', 'This test has no questions yet.');
            if (el('btn-start-test')) el('btn-start-test').disabled = true;
            return;
        }
        const questions = set.questions;
        const answers = Array(questions.length).fill(null);
        const minutes = Number(set.timeLimitMinutes) > 0 ? Number(set.timeLimitMinutes) : questions.length;
        const duration = Math.round(minutes * 60);
        let current = 0, started = false, submitted = false, deadline = 0, startedAt = 0, timer;
        const clock = seconds => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
        const make = (tag, className, content) => {
            const node = document.createElement(tag);
            node.className = className;
            if (content !== undefined) node.textContent = content;
            return node;
        };
        text('hero-set-name', set.name);
        text('hero-details', set.details || '');
        text('hero-q-count', questions.length);
        text('hero-time', clock(duration));
        text('hero-note', 'One point per correct answer. Unanswered questions score zero. Answers cannot be changed after submission.');
        text('sidebar-total', `Total: ${questions.length}`);
        function render() {
            const q = questions[current];
            text('q-number-label', `QUESTION ${current + 1} OF ${questions.length}`);
            text('q-text', q.question);
            const list = el('options-list');
            list.replaceChildren();
            list.setAttribute('role', 'radiogroup');
            list.setAttribute('aria-label', `Answers for question ${current + 1}`);
            q.options.forEach((option, index) => {
                const item = make('li', answers[current] === index ? 'selected' : '');
                item.tabIndex = 0;
                item.setAttribute('role', 'radio');
                item.setAttribute('aria-checked', String(answers[current] === index));
                item.append(make('span', 'option-letter', String.fromCharCode(65 + index)), make('span', '', option));
                const select = () => { if (!submitted) { answers[current] = index; render(); } };
                item.onclick = select;
                item.onkeydown = event => { if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); select(); el('options-list').children[index].focus(); } };
                list.append(item);
            });
            const grid = el('q-grid');
            grid.replaceChildren();
            questions.forEach((_, index) => {
                const button = make('button', `q-dot${answers[index] !== null ? ' answered' : ''}${index === current ? ' current' : ''}`, index + 1);
                button.type = 'button';
                button.setAttribute('aria-label', `Question ${index + 1}${answers[index] !== null ? ', answered' : ', unanswered'}`);
                if (index === current) button.setAttribute('aria-current', 'step');
                button.onclick = () => { current = index; render(); };
                grid.append(button);
            });
            text('sidebar-answered-num', answers.filter(a => a !== null).length);
            el('btn-prev').disabled = current === 0;
            el('btn-next').disabled = current === questions.length - 1;
        }
        function finish() {
            if (!started || submitted) return;
            submitted = true;
            clearInterval(timer);
            show('warning-modal', false);
            show('test-section', false);
            show('timer-display', false);
            show('results-section', true);
            const score = questions.reduce((sum, q, i) => sum + Number(answers[i] === q.correct), 0);
            text('results-set-name', set.name);
            text('results-score', score);
            text('results-denom', `/ ${questions.length}`);
            text('results-percentage', `${(100 * score / questions.length).toFixed(1)}%`);
            text('results-time-taken', `Time taken: ${clock(Math.min(duration, Math.floor((Date.now() - startedAt) / 1000)))}`);
            const detail = el('results-detail');
            detail.replaceChildren();
            questions.forEach((q, i) => {
                const correct = answers[i] === q.correct;
                const card = make('article', `result-card ${correct ? 'correct' : 'incorrect'}`);
                card.append(make('h3', 'r-q-text', `${i + 1}. ${q.question}`));
                card.append(make('p', `r-badge ${correct ? 'correct-badge' : 'incorrect-badge'}`, answers[i] === null ? 'Unanswered' : correct ? 'Correct' : 'Incorrect'));
                const options = make('ul', 'r-options');
                q.options.forEach((option, j) => {
                    const selected = answers[i] === j;
                    const right = q.correct === j;
                    options.append(make('li', right && selected ? 'both-correct' : right ? 'correct-answer' : selected ? 'user-answer' : '', `${String.fromCharCode(65 + j)}. ${option}${right ? ' — Correct answer' : ''}${selected ? ' — Your answer' : ''}`));
                });
                card.append(options);
                if (q.explanation) card.append(make('p', 'r-explanation', q.explanation));
                detail.append(card);
            });
        }
        function tick() {
            const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
            text('timer-display', clock(remaining));
            el('timer-display').classList.toggle('warning-yellow', remaining <= 300 && remaining > 60);
            el('timer-display').classList.toggle('warning-red', remaining <= 60);
            if (!remaining) finish();
        }
        el('btn-start-test').onclick = () => {
            if (started) return;
            started = true;
            startedAt = Date.now();
            deadline = startedAt + duration * 1000;
            show('pre-test-section', false);
            show('test-section', true);
            show('timer-display', true);
            render(); tick();
            timer = setInterval(tick, 1000);
        };
        el('btn-prev').onclick = () => { if (current > 0) { current--; render(); } };
        el('btn-next').onclick = () => { if (current < questions.length - 1) { current++; render(); } };
        el('btn-submit-test').onclick = () => {
            const unanswered = answers.filter(a => a === null).length;
            if (unanswered) { text('modal-unanswered-count', `${unanswered} unanswered`); el('warning-modal').style.display = 'flex'; el('btn-modal-cancel').focus(); }
            else finish();
        };
        el('btn-modal-cancel').onclick = () => { show('warning-modal', false); el('btn-submit-test').focus(); };
        el('btn-modal-submit').onclick = finish;
    };
})();
