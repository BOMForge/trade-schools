# Quick Hex Grid Guide 🎨

## What Changed?

### Before (Old Hex Grid)
- ❌ Hexes colored by **density only** (blue → yellow → red)
- ❌ No program information visible
- ❌ Had to click to see what programs were offered

### After (New Program-Based Hex Grid)
- ✅ Hexes colored by **dominant program** (Welding = Red, HVAC = Blue, etc.)
- ✅ Opacity shows **density** (darker = more schools)
- ✅ Instant visual insights about regional specializations
- ✅ Auto-showing legend with top 12 programs
- ✅ Enhanced tooltips with program breakdowns

---

## How It Works

### The Magic Formula
```
Hex Color = Most Common Program in Region
Hex Opacity = Number of Schools (more schools = darker)
```

### Example
**Dark Red Hex** = Many welding schools concentrated here
**Light Blue Hex** = A few HVAC schools in this area
**Gray Hex** = Mixed programs, no clear dominant trade

---

## Quick Actions

### See Program Distribution
1. Click **"⬡ Program Hexes"**
2. Legend appears automatically
3. Scan for your color of interest

### Find High-Concentration Areas
- Look for **darker/opaque** hexes
- These have 20+ schools

### Identify Regional Specializations
- Hover over hexes to see exact counts
- Click for detailed breakdown
- Use filters to refine view

### Compare Regions
- Zoom out to see state-level trends
- Notice color patterns across regions
- Identify gaps in coverage

---

## Color Cheat Sheet (Top Programs)

| 🔴 **Red** | Welding |
| 🟢 **Green** | Diesel & Automotive |
| 🔵 **Blue** | HVAC |
| 🟣 **Purple** | Machine Tool & Mechanical |
| 🟠 **Orange** | Construction & Building |
| 🟡 **Yellow** | Electronics |
| 🟤 **Brown** | CAD/CAM Drafting |
| ⚪ **Gray** | Plumbing & Pipefitting |

*See full legend by clicking the button in bottom-left corner*

---

## Pro Tips

1. **Combine with filters**: Select a program to see only hexes with that program
2. **State comparison**: Filter by state to see regional program focus
3. **Viewport mode**: Enable "🎯 Viewport Only" to analyze specific regions
4. **Export insights**: Click hexes to see exact school lists

---

## Performance

- ✅ Handles 989 schools smoothly
- ✅ Instant legend updates
- ✅ Fast filter responses
- ✅ No lag when switching views

---

## Questions?

**Q: Why is my region showing gray?**
A: Mixed programs with no single dominant trade, or low school count.

**Q: Can I change the colors?**
A: Yes! Edit the `PROGRAM_COLORS` object in the JavaScript section.

**Q: What if I zoom in/out?**
A: Hex size is currently fixed at resolution 4. Future updates will add dynamic resolution.

**Q: How do I see all schools in a hex?**
A: Click the hexagon to open the detailed popup with school list.

---

**Enjoy exploring the data!** 🚀







