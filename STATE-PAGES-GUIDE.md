# State-Specific Trade School Pages

## Overview
Created dedicated state-specific pages for North Carolina and California with zoomed views and filtered school lists.

## New Pages Created

### 1. North Carolina (`/src/north-carolina.html`)
- **URL**: `https://trade-schools.pages.dev/north-carolina.html`
- **Schools**: 48 trade schools in NC
- **Map Center**: `[35.7596, -79.0193]` (centered on North Carolina)
- **Zoom Level**: 7 (state-level view)
- **Min Zoom**: 6

**Features**:
- Displays only NC schools (filtered by `State === 'NC'`)
- Page title: "North Carolina Trade Schools - 48 Technical & Vocational Schools"
- SEO optimized for North Carolina trade school searches
- Banner includes link back to all states view
- All interactive features from main map (markers, hex grid, filters)

### 2. California (`/src/california.html`)
- **URL**: `https://trade-schools.pages.dev/california.html`
- **Schools**: 121 trade schools in CA
- **Map Center**: `[36.7783, -119.4179]` (centered on California)
- **Zoom Level**: 6 (state-level view)
- **Min Zoom**: 5

**Features**:
- Displays only CA schools (filtered by `State === 'CA'`)
- Page title: "California Trade Schools - 121 Technical & Vocational Schools"
- SEO optimized for California trade school searches
- Banner includes link back to all states view
- All interactive features from main map (markers, hex grid, filters)

## Technical Implementation

### Data Filtering
Both pages use the same data source but filter during processing:

```javascript
// North Carolina
if (row.geocoded === 'True' && row.lat && row.lon && row.State === 'NC')

// California
if (row.geocoded === 'True' && row.lat && row.lon && row.State === 'CA')
```

### Map Configuration
Each state page has custom map initialization:

**North Carolina**:
```javascript
const map = L.map('map', {
    center: [35.7596, -79.0193],
    zoom: 7,
    minZoom: 6,
    maxZoom: 18
});
```

**California**:
```javascript
const map = L.map('map', {
    center: [36.7783, -119.4179],
    zoom: 6,
    minZoom: 5,
    maxZoom: 18
});
```

## Navigation

State-specific pages are linked from the main index page banner:
- Main page (`index.html`) includes links to both NC and CA pages
- State pages include "View All States" link back to main page

## SEO Benefits

Each page has unique:
- Title tags with state name and school count
- Meta descriptions optimized for state-specific searches
- Canonical URLs pointing to state-specific pages
- Open Graph tags for social sharing
- Keywords targeting state-specific trade school searches

## Future Enhancements

To create additional state pages:
1. Copy either `north-carolina.html` or `california.html`
2. Update metadata (title, description, keywords, canonical URL)
3. Change map center coordinates for the target state
4. Adjust zoom level based on state size
5. Update state filter: `row.State === 'XX'`
6. Update banner text with state name
7. Add link to main index banner

## School Counts by State (Top 10)

Based on the CSV data:
- California (CA): 121 schools
- North Carolina (NC): 48 schools
- Texas (TX): ~80+ schools (good candidate for next page)
- Pennsylvania (PA): ~50+ schools
- Ohio (OH): ~40+ schools

## Testing

To test locally:
```bash
wrangler pages dev src/ --d1 DB=trade-schools-db --port 8080
```

Then visit:
- http://localhost:8080/north-carolina.html
- http://localhost:8080/california.html
