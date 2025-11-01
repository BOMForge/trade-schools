// Site-wide footer nav overlay and light/dark theme toggle
(function() {
  // Inject styles
  function injectStyles() {
    if (document.getElementById('site-nav-styles')) return;
    var style = document.createElement('style');
    style.id = 'site-nav-styles';
    style.textContent = '.header-nav-overlay{position:fixed;top:0;left:0;right:0;z-index:1001;display:flex;flex-wrap:wrap;align-items:center;gap:8px;background:rgba(10,10,10,0.95);backdrop-filter:blur(6px);border-bottom:1px solid #2a2f36;padding:10px 16px;font-size:12px}.header-nav-overlay a{color:#cbd5e1;text-decoration:none;font-weight:600;font-size:12px;white-space:nowrap;transition:color 0.2s}.header-nav-overlay a:hover{color:#1d9bf0}.header-nav-sep{height:14px;width:1px;background:#2a2f36;margin:0 2px}.header-nav-overlay button#footerThemeToggle{appearance:none;background:#0ea5e9;color:#fff;border:0;border-radius:6px;padding:4px 8px;font-size:11px;font-weight:700;cursor:pointer;white-space:nowrap}.header-nav-overlay .made-in-usa{color:#10b981;font-weight:700}.header-states-link{display:inline}.map-theme-toggle{display:none !important}';
    document.head.appendChild(style);
  }

  // Theme class removed - theme only affects map basemap, not page styles

  function ensureHeader() {
    if (document.querySelector('.header-nav-overlay')) return;
    var headerNav = document.createElement('div');
    headerNav.className = 'header-nav-overlay';
    
    // Top states by school count (plus North Carolina explicitly requested)
    var topStates = [
      {name: 'Texas', slug: 'texas'},
      {name: 'California', slug: 'california'},
      {name: 'Florida', slug: 'florida'},
      {name: 'North Carolina', slug: 'north-carolina'},
      {name: 'Pennsylvania', slug: 'pennsylvania'},
      {name: 'New York', slug: 'new-york'},
      {name: 'Illinois', slug: 'illinois'},
      {name: 'Ohio', slug: 'ohio'},
      {name: 'Michigan', slug: 'michigan'},
      {name: 'Georgia', slug: 'georgia'},
      {name: 'Virginia', slug: 'virginia'},
      {name: 'Tennessee', slug: 'tennessee'}
    ];
    
    // Build states HTML for header
    var statesHtml = topStates.map(function(s) {
      return '<a href="/trade-schools/states/' + s.slug + '.html" class="header-states-link">' + s.name + '</a>';
    }).join('');
    
    headerNav.innerHTML = '<a href="/index.html">Home</a><span class="header-nav-sep"></span><a href="/trade-schools/states.html">All States</a><span class="header-nav-sep"></span>' + statesHtml + '<span class="header-nav-sep"></span><a href="/trade-schools/submit-school.html">Submit School</a><span class="header-nav-sep"></span><a href="/trade-schools/about.html">About</a><span class="header-nav-sep"></span><span class="made-in-usa">🇺🇸 Made in USA</span><span class="header-nav-sep"></span><button id="footerThemeToggle" aria-label="Toggle light mode">Light</button>';
    document.body.insertBefore(headerNav, document.body.firstChild);

    var theme = localStorage.getItem('mapTheme') || 'dark';
    var btn = document.getElementById('footerThemeToggle');
    if (btn) {
      btn.textContent = theme === 'light' ? 'Dark' : 'Light';
      // Note: Theme toggle is handled by map page itself, not here
      // This ensures only the map basemap changes, not the page styles
    }
  }

  function init() {
    injectStyles();
    ensureHeader();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();





