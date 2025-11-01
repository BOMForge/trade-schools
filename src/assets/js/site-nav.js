// Site-wide footer nav overlay and light/dark theme toggle
(function() {
  // Inject styles
  function injectStyles() {
    if (document.getElementById('site-nav-styles')) return;
    var style = document.createElement('style');
    style.id = 'site-nav-styles';
    style.textContent = '
      .footer-nav-overlay{position:fixed;left:10px;bottom:10px;z-index:1001;max-width:calc(100vw - 20px);display:flex;flex-wrap:wrap;align-items:center;gap:8px;background:rgba(10,10,10,0.75);backdrop-filter:blur(6px);border:1px solid #2a2f36;border-radius:8px;padding:8px 12px;font-size:12px}
      .footer-nav-overlay a{color:#cbd5e1;text-decoration:none;font-weight:600;font-size:12px;white-space:nowrap;transition:color 0.2s}
      .footer-nav-overlay a:hover{color:#1d9bf0}
      .footer-nav-sep{height:14px;width:1px;background:#2a2f36;margin:0 2px}
      .footer-nav-overlay button#footerThemeToggle{appearance:none;background:#0ea5e9;color:#fff;border:0;border-radius:6px;padding:4px 8px;font-size:11px;font-weight:700;cursor:pointer;white-space:nowrap}
      .footer-nav-overlay .made-in-usa{color:#10b981;font-weight:700}
      .footer-states-link{display:none}
      @media (min-width: 1200px) {
        .footer-states-link{display:inline}
      }
      body.light-mode{background:#f8fafc;color:#0f172a}
      body.light-mode .footer-nav-overlay{background:rgba(255,255,255,0.85);border-color:#e2e8f0}
      body.light-mode .footer-nav-overlay a{color:#334155}
      body.light-mode .footer-nav-sep{background:#e2e8f0}
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
    
    // Get all 50 states with proper slugs
    var states = [
      {name: 'Alabama', slug: 'alabama'}, {name: 'Alaska', slug: 'alaska'}, {name: 'Arizona', slug: 'arizona'},
      {name: 'Arkansas', slug: 'arkansas'}, {name: 'California', slug: 'california'}, {name: 'Colorado', slug: 'colorado'},
      {name: 'Connecticut', slug: 'connecticut'}, {name: 'Delaware', slug: 'delaware'}, {name: 'Florida', slug: 'florida'},
      {name: 'Georgia', slug: 'georgia'}, {name: 'Hawaii', slug: 'hawaii'}, {name: 'Idaho', slug: 'idaho'},
      {name: 'Illinois', slug: 'illinois'}, {name: 'Indiana', slug: 'indiana'}, {name: 'Iowa', slug: 'iowa'},
      {name: 'Kansas', slug: 'kansas'}, {name: 'Kentucky', slug: 'kentucky'}, {name: 'Louisiana', slug: 'louisiana'},
      {name: 'Maine', slug: 'maine'}, {name: 'Maryland', slug: 'maryland'}, {name: 'Massachusetts', slug: 'massachusetts'},
      {name: 'Michigan', slug: 'michigan'}, {name: 'Minnesota', slug: 'minnesota'}, {name: 'Mississippi', slug: 'mississippi'},
      {name: 'Missouri', slug: 'missouri'}, {name: 'Montana', slug: 'montana'}, {name: 'Nebraska', slug: 'nebraska'},
      {name: 'Nevada', slug: 'nevada'}, {name: 'New Hampshire', slug: 'new-hampshire'}, {name: 'New Jersey', slug: 'new-jersey'},
      {name: 'New Mexico', slug: 'new-mexico'}, {name: 'New York', slug: 'new-york'}, {name: 'North Carolina', slug: 'north-carolina'},
      {name: 'North Dakota', slug: 'north-dakota'}, {name: 'Ohio', slug: 'ohio'}, {name: 'Oklahoma', slug: 'oklahoma'},
      {name: 'Oregon', slug: 'oregon'}, {name: 'Pennsylvania', slug: 'pennsylvania'}, {name: 'Rhode Island', slug: 'rhode-island'},
      {name: 'South Carolina', slug: 'south-carolina'}, {name: 'South Dakota', slug: 'south-dakota'}, {name: 'Tennessee', slug: 'tennessee'},
      {name: 'Texas', slug: 'texas'}, {name: 'Utah', slug: 'utah'}, {name: 'Vermont', slug: 'vermont'},
      {name: 'Virginia', slug: 'virginia'}, {name: 'Washington', slug: 'washington'}, {name: 'West Virginia', slug: 'west-virginia'},
      {name: 'Wisconsin', slug: 'wisconsin'}, {name: 'Wyoming', slug: 'wyoming'}
    ];
    
    // Build states dropdown HTML (show first few, rest in dropdown)
    var statesHtml = states.slice(0, 10).map(function(s) {
      return '<a href="/states/' + s.slug + '.html" class="footer-states-link">' + s.name + '</a>';
    }).join('');
    
    // If more than 10 states, add "..." and link to states page
    if (states.length > 10) {
      statesHtml += '<a href="/states.html" class="footer-states-link">+ ' + (states.length - 10) + ' more</a>';
    }
    
    footer.innerHTML = '
      <a href="/index.html">Home</a>
      <span class="footer-nav-sep"></span>
      <a href="/states.html">All States</a>
      <span class="footer-nav-sep footer-states-link"></span>
      ' + statesHtml + '
      <span class="footer-nav-sep"></span>
      <a href="/submit-school.html">Submit School</a>
      <span class="footer-nav-sep"></span>
      <a href="/about.html">About</a>
      <span class="footer-nav-sep"></span>
      <span class="made-in-usa">🇺🇸 Made in USA</span>
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





