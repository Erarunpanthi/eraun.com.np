(() => {
  const activate = () => {
    document.querySelectorAll('.nav-btn').forEach((button) => {
      const card = button.closest('.card');
      const answer = card?.querySelector('.answer')
        || button.closest('.options')?.nextElementSibling?.classList.contains('answer') && button.closest('.options').nextElementSibling;
      if (!answer || button.dataset.answerToggleReady === 'true') return;

      button.dataset.answerToggleReady = 'true';
      button.type = 'button';
      button.setAttribute('aria-expanded', 'false');
      answer.classList.remove('show');
      answer.style.maxHeight = '';

      button.addEventListener('click', () => {
        const open = !answer.classList.contains('show');
        answer.classList.toggle('show', open);
        answer.style.maxHeight = open ? `${answer.scrollHeight}px` : '';
        button.textContent = open ? 'Hide Answer' : 'Show Answer';
        button.setAttribute('aria-expanded', String(open));
        if (card) card.classList.toggle('viewed', open);
      });
    });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', activate, { once: true });
  else activate();
})();
