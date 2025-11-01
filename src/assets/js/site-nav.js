// Site-wide footer nav overlay and light/dark theme toggle
(function() {
  // Inject styles
  function injectStyles() {
    if (document.getElementById('site-nav-styles')) return;
    var style = document.createElement('style');
    style.id = 'site-nav-styles';
    style.textContent = '.header-nav.enhanced-nav{flex-wrap:wrap;gap:8px;margin-bottom:10px}.header-nav.enhanced-nav .nav-link{font-size:11px;padding:6px 10px}.made-in-usa-nav{color:#10b981;font-weight:700;margin:0 8px;font-size:11px}.theme-toggle-btn{background:#0ea5e9;color:#fff;border:0;border-radius:6px;padding:6px 10px;font-size:11px;font-weight:700;cursor:pointer}.map-theme-toggle{display:none !important}';
    document.head.appendChild(style);
  }

  // Theme class removed - theme only affects map basemap, not page styles

  function ensureHeader() {
    // Find the existing header-nav in the sidebar
    var existingNav = document.querySelector('.header-nav');
    if (!existingNav) return;
    
    // If already enhanced, skip
    if (existingNav.classList.contains('enhanced-nav')) return;
    existingNav.classList.add('enhanced-nav');
    
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
    
    // Build states HTML
    var statesHtml = topStates.map(function(s) {
      return '<a href="states/' + s.slug + '.html" class="nav-link">' + s.name + '</a>';
    }).join('');
    
    // Update the existing header-nav with all navigation
    existingNav.innerHTML = '<a href="../index.html" class="nav-link">Home</a><a href="states.html" class="nav-link">All States</a>' + statesHtml + '<a href="submit-school.html" class="nav-link">Submit School</a><a href="about.html" class="nav-link">About</a><span class="made-in-usa-nav">🇺🇸 Made in USA</span><button id="footerThemeToggle" class="nav-link theme-toggle-btn" aria-label="Toggle light mode">Light</button>';
    
    // Wire up theme toggle button - wait a bit for map to initialize
    setTimeout(function() {
      var theme = localStorage.getItem('mapTheme') || 'dark';
      var btn = document.getElementById('footerThemeToggle');
      if (btn) {
        // Set initial button text based on current theme
        // If dark, show "Light" (clicking will switch to light)
        // If light, show "Dark" (clicking will switch to dark)
        btn.textContent = theme === 'light' ? 'Dark' : 'Light';
        
        btn.addEventListener('click', function(e) {
          e.preventDefault();
          // Use global toggle function if available (from map page)
          if (window.toggleMapTheme) {
            window.toggleMapTheme();
            // Update button text after toggle
            setTimeout(function() {
              var newTheme = localStorage.getItem('mapTheme') || 'dark';
              btn.textContent = newTheme === 'light' ? 'Dark' : 'Light';
            }, 100);
          } else {
            // Fallback: toggle and reload
            var current = localStorage.getItem('mapTheme') || 'dark';
            var next = current === 'dark' ? 'light' : 'dark';
            localStorage.setItem('mapTheme', next);
            window.location.reload();
          }
        });
      }
    }, 500);
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





