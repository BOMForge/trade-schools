/**
 * Cloudflare Pages Function for server-side rendering school detail meta tags
 * Intercepts requests to /trade-schools/school-detail.html and injects dynamic SEO meta tags
 */

interface Env {
  ASSETS: {
    fetch: (request: Request) => Promise<Response>;
  };
}

// Helper to generate meta tags for a school
function generateSchoolMeta(schoolName: string, city: string, state: string): { [key: string]: string } {
  const title = `${schoolName} - ${city}, ${state} | Trade School Programs | BOMForge`;
  const description = `Explore trade school programs at ${schoolName} in ${city}, ${state}. Find welding, HVAC, manufacturing, electronics, and skilled trades training programs.`;
  const url = `https://bomatlas.com/trade-schools/school-detail.html?name=${encodeURIComponent(schoolName)}&state=${state}&city=${encodeURIComponent(city)}`;

  return {
    title,
    description,
    url,
    keywords: `${schoolName}, ${city} trade schools, ${state} technical schools, vocational training, welding programs, HVAC training, manufacturing education`,
  };
}

// Inject meta tags into HTML
function injectMetaTags(html: string, meta: { [key: string]: string }): string {
  // Replace title
  html = html.replace(
    /<title id="page-title">.*?<\/title>/,
    `<title id="page-title">${meta.title}</title>`
  );

  // Replace meta description
  html = html.replace(
    /<meta name="description" id="page-description" content=".*?">/,
    `<meta name="description" id="page-description" content="${meta.description}">`
  );

  // Replace meta keywords
  html = html.replace(
    /<meta name="keywords" id="page-keywords" content=".*?">/,
    `<meta name="keywords" id="page-keywords" content="${meta.keywords}">`
  );

  // Replace canonical URL (add if doesn't exist)
  if (html.includes('rel="canonical"')) {
    html = html.replace(
      /<link rel="canonical" href=".*?">/,
      `<link rel="canonical" href="${meta.url}">`
    );
  } else {
    html = html.replace(
      /<\/head>/,
      `    <link rel="canonical" href="${meta.url}">\n</head>`
    );
  }

  // Open Graph tags
  html = html.replace(
    /<meta property="og:url" id="og-url" content=".*?">/,
    `<meta property="og:url" id="og-url" content="${meta.url}">`
  );
  html = html.replace(
    /<meta property="og:title" id="og-title" content=".*?">/,
    `<meta property="og:title" id="og-title" content="${meta.title}">`
  );
  html = html.replace(
    /<meta property="og:description" id="og-description" content=".*?">/,
    `<meta property="og:description" id="og-description" content="${meta.description}">`
  );

  // Twitter tags
  html = html.replace(
    /<meta property="twitter:url" id="twitter-url" content=".*?">/,
    `<meta property="twitter:url" id="twitter-url" content="${meta.url}">`
  );
  html = html.replace(
    /<meta property="twitter:title" id="twitter-title" content=".*?">/,
    `<meta property="twitter:title" id="twitter-title" content="${meta.title}">`
  );
  html = html.replace(
    /<meta property="twitter:description" id="twitter-description" content=".*?">/,
    `<meta property="twitter:description" id="twitter-description" content="${meta.description}">`
  );

  return html;
}

export async function onRequest(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;
  const url = new URL(request.url);

  // Get URL parameters
  const schoolName = url.searchParams.get('name');
  const city = url.searchParams.get('city');
  const state = url.searchParams.get('state');

  // Fetch the original HTML file from assets
  const response = await env.ASSETS.fetch(request);

  // If we don't have complete school info, return original response
  if (!schoolName || !city || !state) {
    return response;
  }

  // Get the HTML content
  const html = await response.text();

  // Generate and inject meta tags
  const meta = generateSchoolMeta(schoolName, city, state);
  const modifiedHtml = injectMetaTags(html, meta);

  // Return modified HTML with proper headers
  return new Response(modifiedHtml, {
    status: response.status,
    headers: {
      ...Object.fromEntries(response.headers),
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
    },
  });
}
