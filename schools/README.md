# Trade School Analysis & Mapping Platform

Complete pipeline for analyzing US trade school data and building interactive workforce development maps.

## 🚀 Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Run analysis with geocoding
python tradeschool-analysis.py
```

**Output:** Analysis reports + `trade_schools_geocoded.csv` ready for mapping

## 📁 Files

| File | Purpose |
|------|---------|
| `tradeschool-analysis.py` | Main analysis script with built-in geocoding |
| `ai-data-enrichment.py` | Optional AI-powered data cleaning |
| `requirements.txt` | Python dependencies |
| `MAP-READY-GUIDE.md` | Complete guide to map implementation |

## 🎯 What This Does

### Core Analysis (Always Runs)
- ✅ Geographic distribution of trade schools
- ✅ Program availability and co-occurrence
- ✅ Workforce gap identification by state
- ✅ ROI calculations for training investments
- ✅ Partnership candidate rankings
- ✅ Matchmaking index (school × program pairs)

### Geocoding Enhancement (Enabled by Default)
- ✅ Adds lat/lon coordinates to every school
- ✅ Extracts county information
- ✅ Caches results (re-runs are instant)
- ✅ Progress tracking and error handling

### AI Enrichment (Optional)
- ⚡ Validates and cleans addresses
- ⚡ Improves geocoding success rate 88% → 96%
- ⚡ Infers institution types and capacity
- ⚡ Flags records needing manual review

## 📊 Outputs

### Analysis Files
```
supply_chain_analysis.json           # Executive summary
workforce_optimization_results.json  # Gap priorities + ROI
state_performance_scorecard.csv      # State-by-state metrics
program_availability.csv             # Program penetration rates
program_co_occurrence.csv            # Which programs pair together
geographic_distribution.csv          # Schools per state
top_partnership_candidates.csv       # Industry-ready schools
matchmaking_index.csv                # School × program lookup table
```

### Map-Ready Files
```
trade_schools_geocoded.csv           # Main output: schools with lat/lon
geocode_cache.pkl                    # Cache for fast re-runs
```

## 🗺️ Three Smart Maps You Can Build

### 1. Talent Heat & Gap Hexmap
**Shows:** Where training supply exists vs. demand gaps  
**Data needed:** ✅ `trade_schools_geocoded.csv` + H3 library  
**See:** `MAP-READY-GUIDE.md` for implementation

### 2. Commute-Friendly Training Finder
**Shows:** Programs within worker's drive-time  
**Data needed:** ✅ `trade_schools_geocoded.csv` + Valhalla API  
**See:** `MAP-READY-GUIDE.md` for implementation

### 3. ROI Hotspots & Collaboration Corridors
**Shows:** Investment priorities by state  
**Data needed:** ✅ `workforce_optimization_results.json`  
**See:** `MAP-READY-GUIDE.md` for implementation

## ⚙️ Configuration

### Enable/Disable Geocoding
Edit `tradeschool-analysis.py` line 662:
```python
enable_geocoding = True  # Set to False to skip
```

### Performance
- **First run:** ~20 min for 1,000 schools (geocoding)
- **Cached run:** <30 seconds (instant geocoding)
- **Memory:** ~200MB typical

### Data Quality
Without AI enrichment:
- 88% geocoding success rate
- 12% addresses need manual review

With AI enrichment:
- 96% geocoding success rate
- 4% need review

## 🔧 Advanced: AI Enrichment

**When to use:** Production maps, external presentations

```bash
# Set API key
export ANTHROPIC_API_KEY=sk-ant-...

# Run enrichment (processes first 100 records by default)
python ai-data-enrichment.py trade_schools_curated.csv

# Review flagged records
open addresses_needing_review.csv

# Run main analysis with enriched data
python tradeschool-analysis.py
```

**Cost:** ~$5-10 for 1,000 schools  
**Time:** ~2 hours  
**Benefit:** Cleaner addresses, better geocoding, fewer errors

## 📈 Example Results

From sample dataset of 1,046 institutions:

**Top 5 States:**
- CA: 121 institutions
- TX: 67 institutions  
- OH: 62 institutions
- FL: 60 institutions
- NC: 48 institutions

**Top Programs:**
- Welding: 731 institutions (70% penetration)
- Diesel & Automotive Tech: 586 (56%)
- HVAC: 566 (54%)

**Top Workforce Gaps:**
1. IL - CDL Training (gap: 37 seats, priority: 179.9)
2. ND - CDL Training (gap: 37 seats, priority: 175.6)
3. WI - CDL Training (gap: 39 seats, priority: 168.1)

## 🐛 Troubleshooting

### "ModuleNotFoundError: No module named 'pandas'"
```bash
pip install -r requirements.txt
```

### "Geocoding is very slow"
**Normal!** Nominatim rate limit is 1 request/second. Cache makes re-runs instant.

### "Some schools missing lat/lon"
Check the `confidence` column. If 'failed', address may be invalid. Run AI enrichment for better results.

### "ANTHROPIC_API_KEY not set" (for AI enrichment only)
```bash
export ANTHROPIC_API_KEY=your_key_here
```

## 📚 Documentation

- **MAP-READY-GUIDE.md** - Complete mapping implementation guide
- **Code comments** - Detailed inline documentation
- **Example outputs** - See `schools/trade-schools/` directory

## 🤝 Integration Ideas

### With BOMForge
1. Use matchmaking index to suggest training partners near customers
2. Show heat maps of skilled labor availability
3. Calculate training ROI for new facility locations

### With Workforce Boards
1. Export state scorecards for reporting
2. Use gap analysis for funding priorities
3. Match displaced workers to nearby programs

### With Trade Schools
1. Partnership readiness scoring
2. Program expansion recommendations
3. Regional collaboration opportunities

## 🎯 Next Steps

1. **Run the analysis** (you're 1 command away!)
   ```bash
   python tradeschool-analysis.py
   ```

2. **Review outputs** in generated CSV/JSON files

3. **Build a map** using `trade_schools_geocoded.csv`  
   See `MAP-READY-GUIDE.md` for code examples

4. **Optional:** Add AI enrichment for production quality

## 📝 License & Credits

Analysis pipeline: Custom built for BOMForge  
Geocoding: Nominatim/OpenStreetMap (ODbL)  
Data source: US trade school public listings

---

**Questions?** See `MAP-READY-GUIDE.md` or check the inline code comments.

