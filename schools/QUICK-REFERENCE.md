# Trade School Mapping: Quick Reference Card

## ✅ What You Have (Ready Now)

### Built-In Geocoding
```bash
python tradeschool-analysis.py
# ✓ Adds lat/lon to every school
# ✓ Extracts county info
# ✓ Caches results (instant re-runs)
# ✓ Output: trade_schools_geocoded.csv
```

**Geocoding quality:**
- Success rate: 85-90%
- Free (Nominatim)
- ~20 min for 1,000 schools

### Analysis Already Done
Your script produces everything needed for maps:
- ✅ Geographic distribution by state
- ✅ Workforce gaps by skill + state
- ✅ ROI calculations per gap
- ✅ School quality scores
- ✅ Program co-occurrence patterns

---

## 🎯 Do You Need AI Enrichment?

### Skip AI If:
- Building prototype/demo maps
- Internal use only
- Time-sensitive (need maps today)
- Budget-constrained

**→ Use basic geocoding (already built-in)**

### Use AI If:
- Production-facing maps
- External presentations
- Need 95%+ accuracy
- Budget allows $5-10

**→ Run ai-data-enrichment.py first**

---

## 🗺️ Map Decision Tree

### Want to show: "Where are training gaps?"
**→ Build Map #1: Hex Gap Map**
```python
# You need:
pip install h3

# Then:
df = pd.read_csv('trade_schools_geocoded.csv')
df['h3'] = df.apply(lambda r: h3.geo_to_h3(r['lat'], r['lon'], 6), axis=1)
# Aggregate by hex, export GeoJSON
```

### Want to show: "Programs near me"
**→ Build Map #2: Isochrone Finder**
```bash
# You need:
docker run -d -p 8002:8002 valhalla/valhalla:latest

# Then:
# API call: worker location → 30min isochrone → schools in polygon
```

### Want to show: "Where to invest training $$$"
**→ Build Map #3: ROI Choropleth**
```python
# You already have:
workforce_optimization_results.json

# Just map the state priorities to a choropleth
```

---

## 📊 File Cheat Sheet

| If you want... | Use this file... |
|----------------|------------------|
| School locations for mapping | `trade_schools_geocoded.csv` |
| List of all programs | `program_availability.csv` |
| Which states have gaps | `state_performance_scorecard.csv` |
| Investment priorities | `workforce_optimization_results.json` |
| School × program lookup | `matchmaking_index.csv` |
| State-level stats | `geographic_distribution.csv` |

---

## ⚡ Common Commands

### Run Basic Analysis + Geocoding
```bash
python tradeschool-analysis.py
# Time: ~20 min
# Output: All CSVs/JSONs + geocoded file
```

### Run with AI Cleaning (Better Quality)
```bash
export ANTHROPIC_API_KEY=sk-ant-...
python ai-data-enrichment.py trade_schools_curated.csv
python tradeschool-analysis.py
# Time: ~2 hours
# Output: Same as above, higher accuracy
```

### Skip Geocoding (Faster)
Edit line 662 in `tradeschool-analysis.py`:
```python
enable_geocoding = False
```

### Use Cached Geocoding (Instant)
Just re-run:
```bash
python tradeschool-analysis.py
# Uses geocode_cache.pkl (instant)
```

---

## 🔍 Data Columns Explained

### In `trade_schools_geocoded.csv`:

| Column | What It Is | Example |
|--------|------------|---------|
| `lat`, `lon` | Coordinates | `34.0522`, `-118.2437` |
| `geocoded` | Success flag | `True` |
| `confidence` | Quality score | `high`, `medium`, `failed` |
| `display_name` | Full geocoded address | `Los Angeles, LA County, California...` |
| `county` | Extracted county | `Los Angeles` |

### Original columns still present:
- `Institution Name`, `Address`, `State`, `City`
- `Programs`, `Program_List`, `Program_Count`
- `Contact Email`, `Website`, `Contact Name`

---

## 🚨 Troubleshooting 1-Liner Fixes

| Problem | Fix |
|---------|-----|
| ModuleNotFoundError | `pip install -r requirements.txt` |
| Geocoding slow | Normal! (1 req/sec limit). Let it run, cache makes re-runs instant |
| Some schools missing lat/lon | Check `confidence=='failed'` rows. Run AI enrichment for better results |
| Want to add new data | Just add rows to CSV, delete `geocode_cache.pkl`, re-run |

---

## 💡 Pro Tips

### Speed Up Development
1. **Start with small dataset** - Use `.head(100)` to test
2. **Cache is your friend** - Never delete `geocode_cache.pkl` unless you changed addresses
3. **Batch processing** - Geocoding runs overnight, maps build instantly after

### Best Practices
1. **Version your data** - Save dated copies of geocoded files
2. **Document failures** - Check `addresses_needing_review.csv` if using AI enrichment
3. **Validate before mapping** - Filter `geocoded==True` before plotting

### Performance Tuning
```python
# Filter to high-confidence only for cleaner maps
df_clean = df[df['confidence'] == 'high']

# Or keep all successful geocodes
df_map = df[df['geocoded'] == True]
```

---

## 🎯 Your Next 3 Steps

### Step 1: Run It (5 seconds to start)
```bash
cd /Users/tc/workspace/TradeSchools/schools
python tradeschool-analysis.py
```

Let it run (~20 min), check outputs

### Step 2: Pick a Map (1 hour to prototype)
Choose Map #1, #2, or #3 from MAP-READY-GUIDE.md  
Use `trade_schools_geocoded.csv` as data source

### Step 3: Iterate (ongoing)
- Add more data sources
- Refine gap calculations
- Build interactive UI

---

## 📚 Full Docs

- **Detailed mapping guide:** `MAP-READY-GUIDE.md`
- **Setup instructions:** `README.md`
- **Code walkthrough:** Inline comments in `.py` files

---

## 🎨 Example Map Stack

### Minimal Stack (Free, Fast)
- Data: `trade_schools_geocoded.csv`
- Backend: None (client-side only)
- Map: MapLibre GL JS + GeoJSON
- Host: GitHub Pages or Vercel

### Production Stack (Recommended)
- Data: `trade_schools_geocoded.csv` + AI enrichment
- Backend: FastAPI + PostGIS
- Map: MapLibre GL + Deck.gl (hex/isochrone layers)
- Routing: Valhalla (Docker)
- Host: AWS/GCP + CloudFront CDN

---

**TL;DR:** Your data is already map-ready. Just run `python tradeschool-analysis.py` and use `trade_schools_geocoded.csv` for mapping. Everything else is optional enhancement.

