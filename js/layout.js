(() => {
  const navbar = document.getElementById('navbar');
  if (navbar) {
    navbar.innerHTML = `
      <nav class="navbar" aria-label="Main navigation">
        <a href="/" class="nav-item">PSC Home</a>
        <a href="/Psc-preparation/" class="nav-item">Study Hub</a>
        <a href="/Psc-preparation/Syllabus/" class="nav-item">Syllabus</a>
        <a href="/Psc-preparation/MCQ/" class="nav-item">MCQ Practice</a>
        <a href="/Timer.html" class="nav-item">Exam Timer</a>
        <a href="/pomodoro.html" class="nav-item">Pomodoro</a>
        <a href="https://psc.gov.np/" class="nav-item" target="_blank" rel="noopener noreferrer">Official PSC ↗</a>
      </nav>`;
  }

  const social = document.getElementById('social-section');
  if (social) {
    social.innerHTML = `
      <section class="social-media" aria-labelledby="official-source-heading">
        <h2 id="official-source-heading">Independent study aid — not an official PSC website</h2>
        <p>This resource is not affiliated with or endorsed by the Public Service Commission of Nepal. For current vacancies, eligibility, official syllabi, deadlines, and exam instructions, use PSC Nepal’s own notices.</p>
        <a class="cta-button" href="https://psc.gov.np/" target="_blank" rel="noopener noreferrer">Visit PSC Nepal</a>
      </section>`;
  }

  const footer = document.getElementById('footer');
  if (footer) {
    footer.innerHTML = `
      <footer class="footer">
        <p>© <span id="footer-year"></span> PSC Civil Prep · Independent PSC Civil Engineering study resource.</p>
        <p>No email contact channel is provided. For official exam matters, contact the Public Service Commission of Nepal.</p>
        <p>
          <a href="/">Home</a> |
          <a href="/Psc-preparation/">Study Hub</a> |
          <a href="/Timer.html">Exam Timer</a> |
          <a href="/pomodoro.html">Pomodoro</a> |
          <a href="https://psc.gov.np/" target="_blank" rel="noopener noreferrer">Official PSC</a>
        </p>
      </footer>`;
    const year = document.getElementById('footer-year');
    if (year) year.textContent = new Date().getFullYear();
  }
})();
