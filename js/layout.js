(() => {
  const navbar = document.getElementById('navbar');
  if (navbar) {
    navbar.innerHTML = `
      <nav class="navbar" aria-label="Main navigation">
        <a href="/" class="nav-item">PSC Home</a>
        <a href="/Psc-preparation/" class="nav-item">Study Hub</a>
        <a href="/Psc-preparation/#subject-map" class="nav-item">Subject Map</a>
        <a href="/Psc-preparation/#practice" class="nav-item">Practice</a>
        <a href="/pomodoro.html" class="nav-item">Pomodoro</a>
        <a href="https://psc.gov.np/" class="nav-item" target="_blank" rel="noopener noreferrer">Official PSC ↗</a>
      </nav>`;
  }

  const social = document.getElementById('social-section');
  if (social) {
    social.innerHTML = `
      <section class="social-media" aria-labelledby="official-source-heading">
        <h2 id="official-source-heading">Always verify with the official source</h2>
        <p>Use the latest notice and syllabus published for your exact post, service, and level.</p>
        <a class="cta-button" href="https://psc.gov.np/" target="_blank" rel="noopener noreferrer">Visit PSC Nepal</a>
      </section>`;
  }

  const footer = document.getElementById('footer');
  if (footer) {
    footer.innerHTML = `
      <footer class="footer">
        <p>© <span id="footer-year"></span> CivPrepMaster · Independent PSC Civil Engineering study resource.</p>
        <p>
          <a href="/">Home</a> |
          <a href="/Psc-preparation/">Study Hub</a> |
          <a href="/aboutus.html">About</a> |
          <a href="/contactus.html">Contact</a> |
          <a href="/PrivacyPolicy.html">Privacy</a> |
          <a href="/TermsofService.html">Terms</a>
        </p>
      </footer>`;
    const year = document.getElementById('footer-year');
    if (year) year.textContent = new Date().getFullYear();
  }
})();
