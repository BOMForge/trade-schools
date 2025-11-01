# 🎨 Hex Grid Visual Quick Reference

## What You'll See on the Map

### 🔷 Hex Badge Styles

#### 1. **Highly Diverse Area** (3+ major programs)
```
┌─────────────────────┐
│  ╭────────────────╮  │
│  │ 🌈  Multi-color │  │  ← Rainbow icon = Very High diversity
│  │     border      │  │     Conic gradient shows top 3 programs
│  │      [25]       │  │     Number = school count
│  ╰────────────────╯  │
└─────────────────────┘
```
**What it means:** This area has many schools offering different programs. Great for students wanting variety.

---

#### 2. **Balanced Mix** (2 major programs)
```
┌─────────────────────┐
│  ╭────────────────╮  │
│  │ ◐  Dual-layer  │  │  ← Half-circle = Moderate diversity
│  │     border      │  │     Two-color border (top 2 programs)
│  │      [12]       │  │
│  ╰────────────────╯  │
└─────────────────────┘
```
**What it means:** Two dominant programs compete. Good for comparing similar fields.

---

#### 3. **Specialized Area** (1 dominant program ≥70%)
```
┌─────────────────────┐
│  ╭────────────────╮  │
│  │  Single-color  │  │  ← No icon = Specialized/Focused
│  │     border      │  │     Pure color = one program dominates
│  │      [8]        │  │
│  ╰────────────────╯  │
└─────────────────────┘
```
**What it means:** Area specializes in one trade. Go here for that specific skill.

---

## 📊 Popup Information Breakdown

### When you click a hex, you'll see:

```
┌───────────────────────────────────────────┐
│ ⬡ Hex Zone Analytics          [25]       │ ← Header with count
│ Resolution 5                               │
├───────────────────────────────────────────┤
│                                           │
│ ┌────────┬────────┬────────┐             │
│ │Schools │Programs│Avg/Schl│             │ ← Key metrics
│ │   25   │   8    │  3.2   │             │
│ └────────┴────────┴────────┘             │
│                                           │
│ 👑 Dominant Program                       │
│ ┌─────────────────────────────┐           │
│ │ Welding                     │           │ ← Top program
│ │ 12 schools • 48% market     │           │
│ └─────────────────────────────┘           │
│                                           │
│ Program Diversity                         │
│ ┌─────────────────────────────┐           │
│ │ ████████░░░░   High 🌈      │           │ ← Diversity meter
│ └─────────────────────────────┘           │
│                                           │
│ 📊 Program Distribution                   │
│ Welding          48% ████████░ [12]       │
│ HVAC             24% ████░░░░░ [6]        │ ← Top 5 with bars
│ Construction     16% ███░░░░░░ [4]        │
│ Electronics       8% ██░░░░░░░ [2]        │
│ Plumbing          4% █░░░░░░░░ [1]        │
│                                           │
│ 🏫 Schools in Zone (25 total)             │
│ • Lincoln Tech (Springfield)              │
│ • Universal Technical Institute (Dallas)  │ ← School list
│ • Tulsa Welding School (Houston)          │
│ ... + 22 more schools                     │
└───────────────────────────────────────────┘
```

---

## 🎨 Color Meanings

### Program Colors (Examples):
- 🔴 **Welding:** Red (#ff5959)
- 🔵 **HVAC:** Blue (#4ea3ff)
- 🟠 **Construction:** Orange (#ff9b42)
- 🟢 **Diesel & Automotive:** Green (#35b276)
- 🟡 **Electronics:** Yellow (#f7e35b)
- 🟣 **CAD/CAM:** Purple (#d49f68)

### Hex Fill Colors:
- **Pure color:** 70%+ schools offer same program
- **Blended colors:** Mix of top 2-3 programs weighted by percentage
- **Gray:** Insufficient data

---

## 🔍 Zoom Levels & Resolution Guide

```
Zoom 0-3:  Continental View
           ┌──────────────────┐
           │  Very Large Hexes│  Shows regional patterns
           │  Few hexes       │  Good for state comparisons
           └──────────────────┘

Zoom 4-5:  Multi-State View
           ┌──────────┐
           │  Large   │  Shows metro clusters
           │  Hexes   │  Program distribution by region
           └──────────┘

Zoom 6-7:  State Level
           ┌────┐
           │Med │  City-level analysis
           │Hex │  Compare metro areas
           └────┘

Zoom 8-9:  Metro Area
           ┌──┐
           │Sm│  Neighborhood patterns
           │al│  Individual school visibility
           └──┘

Zoom 10+:  City/Neighborhood
           [•]   Very detailed
                 School-level precision
```

---

## 📏 Interpreting Diversity Scores

### Shannon Entropy Scale (0-4):

```
Very High (2.5-4.0) 🌈
├─ Many different programs
├─ No single dominant trade
└─ Best for exploratory students

High (2.0-2.5)
├─ Good variety
├─ 3-4 major programs
└─ Balanced options

Moderate (1.0-2.0) ◐
├─ 2-3 main programs
├─ Some specialization
└─ Focused but not narrow

Low (0-1.0) Specialized
├─ 1-2 dominant programs
├─ Highly focused area
└─ Best for targeted training
```

---

## 🎯 How to Use for Decision Making

### Scenario 1: "I want to learn welding"
1. Filter by "Welding" program
2. Look for **red or red-dominant hexes**
3. Check for **"Low (Specialized)"** diversity
4. Click hex → see all welding schools in that area

### Scenario 2: "I'm not sure what trade yet"
1. Keep all filters on
2. Look for **🌈 rainbow icons** (high diversity)
3. Click hex → compare program percentages
4. Explore schools offering multiple programs

### Scenario 3: "Compare two cities"
1. Zoom to metro level (zoom 9-10)
2. Pan between cities
3. Compare:
   - Hex colors (program dominance)
   - School counts (numbers on badges)
   - Diversity icons (specialization vs variety)

### Scenario 4: "Find the best HVAC training hub"
1. Filter by "HVAC" program
2. Look for **blue hexes with high counts**
3. Check avg programs per school
4. Review school list in popup

---

## 💡 Pro Tips

### 🔥 Look for these patterns:

**1. Training Corridors**
- Multiple adjacent hexes same color = regional specialization
- Example: Rust Belt states → manufacturing/welding

**2. Diversity Hotspots**
- 🌈 icons clustered together = comprehensive training regions
- Often near major metros with varied industry

**3. Border Effects**
- Colors change at state lines = regulatory/market differences
- Use for relocation decisions

**4. Size Matters**
- Larger badges (bigger numbers) = more schools = more competition
- Can mean better facilities OR saturated market

**5. Color Blending Patterns**
- Red+Blue blend (Welding+HVAC) = construction trades cluster
- Green+Yellow blend (Auto+Electronics) = modern tech trades
- Orange dominant (Construction) = building boom areas

---

## ⚙️ Interactive Features

### Click Actions:
- **Click hex** → Full analytics popup
- **Click badge** → Same analytics popup
- **Click school name in popup** → (Future: zoom to school)

### Hover Actions:
- **Hover over hex** → Border highlight (blue glow)
- **Hover over badge** → Shows it's clickable

### Zoom Actions:
- **Zoom in** → More/smaller hexes, higher detail
- **Zoom out** → Fewer/larger hexes, regional patterns
- **Auto-adjusts** → Resolution changes automatically

---

## 🎓 Understanding the Math

### Why percentages matter:
```
Example Hex:
- 20 schools total
- 10 offer Welding (50%)
- 6 offer HVAC (30%)
- 4 offer Construction (20%)

Interpretation:
→ Welding is dominant but not overwhelming
→ HVAC is strong secondary option
→ Construction is niche
→ Moderate diversity (students have choices)
```

### Why diversity score matters:
```
Low Diversity (0.5):
- 18 of 20 schools offer same program
- Very specialized area
- Limited options

High Diversity (2.8):
- Programs evenly distributed
- No single dominant trade
- Maximum student choice
```

---

## 📱 What to Do Next

1. **Explore:** Zoom in/out to see patterns at different scales
2. **Filter:** Use state/program filters to narrow focus
3. **Compare:** Click multiple hexes to compare regions
4. **Decide:** Use diversity + dominance to guide school selection
5. **Share:** (Future feature) Share interesting hex discoveries

---

## 🚀 Advanced Use Cases

### For Students:
- Find specialized training areas
- Compare metro regions
- Identify areas with multiple backup options

### For Educators:
- Identify market gaps (low diversity areas)
- See competitive landscapes
- Plan new program offerings

### For Industry:
- Find talent pools (high-count hexes)
- Identify training deserts
- Plan recruitment strategies

### For Policymakers:
- See geographic inequities
- Identify underserved regions
- Measure training infrastructure

---

**Remember:** The hex grid is **data aggregation** - it summarizes patterns at scale. For individual schools, zoom in or use the markers view!







