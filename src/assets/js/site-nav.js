// Site-wide footer nav overlay and light/dark theme toggle
(function() {
  // Inject styles
  function injectStyles() {
    if (document.getElementById('site-nav-styles')) return;
    var style = document.createElement('style');
    style.id = 'site-nav-styles';
    style.textContent = '
      .footer-nav-overlay{position:fixed;left:10px;bottom:10px;z-index:1001;display:flex;align-items:center;gap:10px;background:rgba(10,10,10,0.75);backdrop-filter:blur(6px);border:1px solid #2a2f36;border-radius:8px;padding:6px 10px}
      .footer-nav-overlay a{color:#cbd5e1;text-decoration:none;font-weight:600;font-size:13px}
      .footer-nav-sep{height:16px;width:1px;background:#2a2f36;margin:0 2px}
      .footer-nav-overlay button#footerThemeToggle{appearance:none;background:#0ea5e9;color:#fff;border:0;border-radius:6px;padding:4px 8px;font-size:12px;font-weight:700;cursor:pointer}
      body.light-mode{background:#f8fafc;color:#0f172a}
      body.light-mode .footer-nav-overlay{background:rgba(255,255,255,0.85);border-color:#e2e8f0}
      body.light-mode .footer-nav-overlay a{color:#334155}
      .map-theme-toggle{display:none !important}
    ';
    document.head.appendChild(style);
  }

  function applyThemeClass(theme) {
    if (theme === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
  }

  function ensureFooter() {
    if (document.querySelector('.footer-nav-overlay')) return;
    var footer = document.createElement('div');
    footer.className = 'footer-nav-overlay';
    footer.innerHTML = '
      <a href="/index.html">Home</a>
      <span class="footer-nav-sep"></span>
      <a href="/states.html">States</a>
      <span class="footer-nav-sep"></span>
      <a href="/submit-school.html">Submit</a>
      <span class="footer-nav-sep"></span>
      <a href="/about.html">About</a>
      <span class="footer-nav-sep"></span>
      <button id="footerThemeToggle" aria-label="Toggle light mode">Light</button>
    ';
    document.body.appendChild(footer);

    var theme = localStorage.getItem('mapTheme') || 'dark';
    var btn = document.getElementById('footerThemeToggle');
    if (btn) {
      btn.textContent = theme === 'light' ? 'Dark' : 'Light';
      btn.addEventListener('click', function(e){
        e.preventDefault();
        var current = localStorage.getItem('mapTheme') || 'dark';
        var next = current === 'dark' ? 'light' : 'dark';
        localStorage.setItem('mapTheme', next);
        // Reload so Leaflet basemap reinitializes with new theme
        window.location.reload();
      });
    }
  }

  function init() {
    injectStyles();
    var theme = localStorage.getItem('mapTheme') || 'dark';
    applyThemeClass(theme);
    ensureFooter();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();





