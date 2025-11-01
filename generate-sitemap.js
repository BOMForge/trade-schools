/**
 * Generate sitemap.xml for trade schools site
 * Includes: main pages, state pages, and all individual school pages
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://bomatlas.com';
const CSV_PATH = path.join(__dirname, 'schools', 'matchmaking_index.csv');
const OUTPUT_PATH = path.join(__dirname, 'src', 'sitemap.xml');

// US States for state pages
const STATES = [
  { name: 'Alabama', slug: 'alabama' },
  { name: 'Alaska', slug: 'alaska' },
  { name: 'Arizona', slug: 'arizona' },
  { name: 'Arkansas', slug: 'arkansas' },
  { name: 'California', slug: 'california' },
  { name: 'Colorado', slug: 'colorado' },
  { name: 'Connecticut', slug: 'connecticut' },
  { name: 'Delaware', slug: 'delaware' },
  { name: 'Florida', slug: 'florida' },
  { name: 'Georgia', slug: 'georgia' },
  { name: 'Hawaii', slug: 'hawaii' },
  { name: 'Idaho', slug: 'idaho' },
  { name: 'Illinois', slug: 'illinois' },
  { name: 'Indiana', slug: 'indiana' },
  { name: 'Iowa', slug: 'iowa' },
  { name: 'Kansas', slug: 'kansas' },
  { name: 'Kentucky', slug: 'kentucky' },
  { name: 'Louisiana', slug: 'louisiana' },
  { name: 'Maine', slug: 'maine' },
  { name: 'Maryland', slug: 'maryland' },
  { name: 'Massachusetts', slug: 'massachusetts' },
  { name: 'Michigan', slug: 'michigan' },
  { name: 'Minnesota', slug: 'minnesota' },
  { name: 'Mississippi', slug: 'mississippi' },
  { name: 'Missouri', slug: 'missouri' },
  { name: 'Montana', slug: 'montana' },
  { name: 'Nebraska', slug: 'nebraska' },
  { name: 'Nevada', slug: 'nevada' },
  { name: 'New Hampshire', slug: 'new-hampshire' },
  { name: 'New Jersey', slug: 'new-jersey' },
  { name: 'New Mexico', slug: 'new-mexico' },
  { name: 'New York', slug: 'new-york' },
  { name: 'North Carolina', slug: 'north-carolina' },
  { name: 'North Dakota', slug: 'north-dakota' },
  { name: 'Ohio', slug: 'ohio' },
  { name: 'Oklahoma', slug: 'oklahoma' },
  { name: 'Oregon', slug: 'oregon' },
  { name: 'Pennsylvania', slug: 'pennsylvania' },
  { name: 'Rhode Island', slug: 'rhode-island' },
  { name: 'South Carolina', slug: 'south-carolina' },
  { name: 'South Dakota', slug: 'south-dakota' },
  { name: 'Tennessee', slug: 'tennessee' },
  { name: 'Texas', slug: 'texas' },
  { name: 'Utah', slug: 'utah' },
  { name: 'Vermont', slug: 'vermont' },
  { name: 'Virginia', slug: 'virginia' },
  { name: 'Washington', slug: 'washington' },
  { name: 'West Virginia', slug: 'west-virginia' },
  { name: 'Wisconsin', slug: 'wisconsin' },
  { name: 'Wyoming', slug: 'wyoming' }
];

// Main pages
const MAIN_PAGES = [
  { url: '/', priority: '1.0', changefreq: 'daily' },
  { url: '/index.html', priority: '1.0', changefreq: 'daily' },
  { url: '/trade-schools/', priority: '1.0', changefreq: 'daily' },
  { url: '/trade-schools/map.html', priority: '0.9', changefreq: 'daily' },
  { url: '/trade-schools/submit-school.html', priority: '0.8', changefreq: 'weekly' },
  { url: '/about.html', priority: '0.7', changefreq: 'monthly' }
];

// Parse CSV and get unique schools
function parseSchools() {
  const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
  const lines = csvContent.trim().split('\n');
  const schools = new Set();

  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    // Parse CSV (handle commas in quoted fields)
    const matches = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g);
    if (!matches || matches.length < 3) continue;

    const institutionName = matches[0].replace(/^"|"$/g, '').trim();
    const state = matches[1].replace(/^"|"$/g, '').trim();
    const city = matches[2].replace(/^"|"$/g, '').trim();

    if (institutionName && state && city) {
      schools.add(JSON.stringify({ name: institutionName, state, city }));
    }
  }

  return Array.from(schools).map(s => JSON.parse(s));
}

// Generate sitemap XML
function generateSitemap(schools) {
  const now = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // Add main pages
  MAIN_PAGES.forEach(page => {
    xml += '  <url>\n';
    xml += `    <loc>${BASE_URL}${page.url}</loc>\n`;
    xml += `    <lastmod>${now}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += '  </url>\n';
  });

  // Add state pages
  STATES.forEach(state => {
    xml += '  <url>\n';
    xml += `    <loc>${BASE_URL}/trade-schools/states/${state.slug}.html</loc>\n`;
    xml += `    <lastmod>${now}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += '  </url>\n';
  });

  // Add school detail pages
  schools.forEach(school => {
    const url = `${BASE_URL}/trade-schools/school-detail.html?name=${encodeURIComponent(school.name)}&state=${encodeURIComponent(school.state)}&city=${encodeURIComponent(school.city)}`;
    xml += '  <url>\n';
    xml += `    <loc>${escapeXml(url)}</loc>\n`;
    xml += `    <lastmod>${now}</lastmod>\n`;
    xml += `    <changefreq>monthly</changefreq>\n`;
    xml += `    <priority>0.6</priority>\n`;
    xml += '  </url>\n';
  });

  xml += '</urlset>';
  return xml;
}

// Escape XML special characters
function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Main execution
console.log('🔍 Parsing school data...');
const schools = parseSchools();
console.log(`✓ Found ${schools.length} unique schools`);

console.log('📝 Generating sitemap.xml...');
const sitemap = generateSitemap(schools);

console.log('💾 Writing sitemap to', OUTPUT_PATH);
fs.writeFileSync(OUTPUT_PATH, sitemap, 'utf-8');

console.log('✅ Sitemap generated successfully!');
console.log(`\nSitemap contains:`);
console.log(`  - ${MAIN_PAGES.length} main pages`);
console.log(`  - ${STATES.length} state pages`);
console.log(`  - ${schools.length} school pages`);
console.log(`  - ${MAIN_PAGES.length + STATES.length + schools.length} total URLs`);
