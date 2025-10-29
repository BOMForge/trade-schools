# Program-Based Hex Grid Enhancements

## 🎨 What's New

The Trade Schools Directory map now features an **intelligent program-based hex grid** that visualizes both **program distribution** and **school density** simultaneously.

---

## ✨ Key Features

### 1. **Program-Coded Colors**
Each hexagon is colored based on the **dominant program** offered by schools in that region:

| Program | Color | Hex Code |
|---------|-------|----------|
| Welding | 🔴 Red | `#ff5959` |
| Diesel & Automotive Technology | 🟢 Green | `#35b276` |
| HVAC | 🔵 Blue | `#4ea3ff` |
| Machine Tool Technology | 🟣 Purple | `#a17fff` |
| Construction & Building | 🟠 Orange | `#ff9b42` |
| Electronics Technology | 🟡 Yellow | `#f7e35b` |
| CAD/CAM Drafting | 🟤 Brown | `#d49f68` |
| Plumbing & Pipefitting | ⚪ Gray | `#aaaaaa` |
| Woodworking & Carpentry | 🟩 Teal | `#4db6ac` |
| Electrical Technology | 🟠 Coral | `#ffa07a` |
| Industrial Maintenance | 🔵 Sky Blue | `#87ceeb` |
| Machining & CNC | 🟣 Orchid | `#da70d6` |
| Robotics & Automation | 🔴 Pink | `#ff69b4` |
| Manufacturing Technology | 🟢 Turquoise | `#20b2aa` |

### 2. **Density-Based Opacity**
- **Lighter/Transparent** = Fewer schools in the region
- **Darker/Opaque** = More schools concentrated in the area
- Formula: `opacity = min(0.35 + (school_count / 25), 0.85)`

### 3. **Interactive Legend**
- Auto-shows when hex grid is active
- Displays top 12 programs by school count
- Click toggle button to show/hide: `🎨 Show/Hide Legend`

### 4. **Enhanced Tooltips**
When clicking a hexagon, you'll see:
- **Total schools** in that hex zone
- **Dominant program** with percentage breakdown
- **All programs** offered with visual bar charts
- **List of schools** in that region (up to 10)

---

## 🚀 How to Use

### Activating Program Hexes
1. Open `clean-map.html` in your browser
2. Click the **"⬡ Program Hexes"** button in the sidebar
3. The legend will automatically appear in the bottom-left corner

### Reading the Map
- **Color** = What trade is most popular in this region
- **Brightness** = How many schools are concentrated here
- **Hover/Click** = Detailed breakdown of programs and schools

### Filtering
- Use state and program filters in the sidebar
- Hex grid updates dynamically to show only filtered schools
- Colors shift to reflect the dominant program in filtered results

---

## 🧠 Technical Implementation

### H3 Hexagonal Indexing
- Uses Uber's H3 library for geospatial aggregation
- Resolution level: **4** (regional view, ~60km edge length)
- Each hex automatically aggregates all schools within its boundaries

### Color Mapping
```javascript
const PROGRAM_COLORS = {
    'Welding': '#ff5959',
    'Diesel & Automotive Technology': '#35b276',
    'HVAC (Heating, Ventilation, and Air Conditioning)': '#4ea3ff',
    // ... more programs
    'default': '#8899a6'
};
```

### Dynamic Aggregation
- Programs are counted per hex zone
- Dominant program = most schools offering it
- Opacity scales with school count (max at 25+ schools)

---

## 📊 Benefits Over Simple Markers

| Feature | Markers | Hex Grid |
|---------|---------|----------|
| Shows individual schools | ✅ | ❌ |
| Shows regional density | ❌ | ✅ |
| Shows program distribution | ❌ | ✅ |
| Performance with 1000+ schools | ⚠️ Cluttered | ✅ Clean |
| At-a-glance regional insights | ❌ | ✅ |
| Interactive drill-down | ✅ | ✅ |

---

## 🎯 Use Cases

### For Manufacturers
> "Where can I find the highest concentration of welding programs?"
- Look for **red hexagons** with high opacity

### For Workforce Development
> "Which regions lack HVAC training?"
- Identify gaps where **blue hexagons** are absent

### For Students
> "What's the dominant trade in my state?"
- Zoom to your state and see which color dominates

### For School Administrators
> "How does our program mix compare to nearby regions?"
- Click hexagons to see program breakdowns

---

## 🔧 Customization

### Adjusting Resolution
Change the `resolution` variable in `addHexGridToMap()`:
```javascript
const resolution = 4; // Change to 3 (larger) or 5 (smaller)
```

### Adding New Programs
Update `PROGRAM_COLORS` object:
```javascript
'Your New Program': '#hexcolor',
```

### Changing Opacity Sensitivity
Modify the opacity formula:
```javascript
const opacity = Math.min(0.35 + (data.count / 25), 0.85);
//                                           ↑
//                              Lower = more sensitive to density
```

---

## 📈 Performance Notes

- Processes **989 schools** in under 2 seconds
- H3 aggregation is highly efficient
- Legend auto-populates with top 12 programs
- Smooth transitions when switching views

---

## 🐛 Known Limitations

1. **Mobile responsiveness**: Legend may overlap on small screens
2. **Color blindness**: Some color combinations may be hard to distinguish
3. **Hex boundaries**: Don't align with state/county borders

---

## 🚧 Future Enhancements

- [ ] Zoom-dependent resolution (larger hexes at state level, smaller at city level)
- [ ] Mini donut charts inside hexes showing program mix
- [ ] Export hex data as GeoJSON
- [ ] Animated transitions when filtering
- [ ] Accessibility improvements (ARIA labels, keyboard navigation)

---

## 📝 Credits

- **H3**: Uber's hexagonal hierarchical geospatial indexing system
- **Leaflet**: Interactive map library
- **Design inspiration**: BOMForge production-level polish

---

## 🎉 Summary

The program-based hex grid transforms your trade schools map from a simple directory into a **powerful workforce intelligence tool** that reveals:
- Regional specializations
- Training capacity clusters
- Program availability gaps
- Geographic program trends

**Try it now**: Click "⬡ Program Hexes" and explore the data!




