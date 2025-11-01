# Trade Schools Directory Platform

> Interactive mapping platform connecting trade schools, students, and employers across the United States

## 🚀 Quick Start

**Live Site:** [https://trade-schools.pages.dev](https://trade-schools.pages.dev)

### For Developers
```bash
# Clone and explore
git clone <your-repo>
cd TradeSchools

# View production files
ls src/

# Deploy to Cloudflare Pages
wrangler pages deploy src/ --project-name=trade-schools
```

### For Users
- **Browse Schools:** Visit the [interactive map](https://trade-schools.pages.dev/map.html)
- **Submit a School:** Use the submission form on the map page
- **Post Jobs:** Visit [employer hiring form](https://trade-schools.pages.dev/employer-hiring.html)

## 📊 Platform Statistics

- **1000+** Trade Schools
- **50** States Covered
- **15+** Program Types
- **Interactive** Hex Grid Visualization

## 🗂️ Project Structure

```
TradeSchools/
├── src/                    # Production frontend
│   ├── index.html          # Landing page
│   ├── map.html            # Main interactive map
│   ├── employer-hiring.html # Job posting form
│   ├── admin-dashboard.html # Admin interface
│   └── assets/             # JS/CSS assets
│
├── functions/              # Cloudflare Pages Functions
│   └── api/
│       ├── schools/        # School submission API
│       └── employers/      # Employer posting API
│
├── data/                   # School data files
│   ├── production/         # Live data (geocoded schools)
│   ├── raw/                # Original datasets
│   └── analysis/           # Analytics results
│
├── scripts/                # Data processing scripts
│   ├── geocode-missing.py
│   ├── fix-missing-coordinates.py
│   └── tradeschool-analysis.py
│
├── docs/                   # Documentation
│   ├── README.md           # This file
│   ├── SETUP.md            # Complete setup guide
│   ├── DEPLOYMENT.md       # Deployment instructions
│   └── FEATURES.md         # Feature documentation
│
├── archive/                # Experimental/deprecated files
│
├── schema.sql              # Database schema
└── wrangler.toml           # Cloudflare configuration
```

## ✨ Key Features

### Interactive Map
- **Multiple Visualizations:** Markers, heat maps, hex grid aggregations
- **Smart Filtering:** Search by location, state, and programs
- **Real-time Stats:** Live data overview with program distributions
- **Responsive Design:** Works seamlessly on mobile and desktop

### School Submission System
- **Professional Form:** Accordion-style with clear validation
- **Spam Protection:** reCAPTCHA v3 integration
- **Database Storage:** Cloudflare D1 with admin approval workflow
- **Email Notifications:** Automatic alerts for new submissions

### Employer Integration
- **Job Posting Form:** Companies can post available positions
- **School Matching:** Connect employers with relevant trade schools
- **Lead Generation:** Build partnerships between industry and education

### Data Management
- **Geocoding Pipeline:** Python scripts for address validation
- **Data Enrichment:** AI-powered school information enhancement
- **Analytics:** Program availability, geographic distribution, partnerships

## 📚 Documentation

- **[Setup Guide](SETUP.md)** - Complete installation and configuration
- **[Deployment Guide](DEPLOYMENT.md)** - Deploy to Cloudflare Pages
- **[Features Documentation](FEATURES.md)** - Detailed feature explanations

## 🛠️ Technology Stack

### Frontend
- **Leaflet.js** - Interactive mapping
- **H3.js** - Hexagonal hierarchical spatial indexing
- **Chart.js** - Data visualization
- **PapaParse** - CSV data processing

### Backend
- **Cloudflare Pages** - Static site hosting
- **Cloudflare Workers** - Serverless API functions
- **Cloudflare D1** - SQL database
- **TypeScript** - API development

### Data Processing
- **Python 3** - Geocoding and enrichment scripts
- **Pandas** - Data manipulation
- **GeoPy** - Geographic data processing

## 🎯 Use Cases

### For Students
- Discover trade schools by location and program
- Compare schools across different states
- View program offerings and contact information

### For Schools
- Submit school information to the directory
- Increase visibility to potential students
- Connect with industry employers

### For Employers
- Find trade schools offering specific programs
- Post job openings to reach skilled graduates
- Build workforce development partnerships

### For Researchers
- Analyze geographic distribution of trade education
- Study program availability across regions
- Identify gaps in workforce training

## 🚀 Getting Started

1. **Explore the Platform**
   - Visit the live site
   - Try the interactive map
   - Filter by programs and locations

2. **Set Up Development Environment**
   - Follow the [Setup Guide](SETUP.md)
   - Configure Cloudflare services
   - Test locally with sample data

3. **Deploy Your Own Instance**
   - Follow the [Deployment Guide](DEPLOYMENT.md)
   - Configure custom domain
   - Set up monitoring

## 🤝 Contributing

We welcome contributions! Areas of interest:

- **Data Quality:** Help geocode and verify school information
- **Features:** Suggest and implement new capabilities
- **Documentation:** Improve guides and explanations
- **Bug Fixes:** Report and fix issues

## 📧 Contact

**Project Lead:** tom@bomforge.com

**Partnership Opportunities:**
- BOMForge.com - Supply chain solutions
- Doss.com - Workforce development

## 📄 License

This project is maintained by BOMForge and Doss for the benefit of trade education and workforce development.

## 🎉 Acknowledgments

- Trade schools across the United States for their educational mission
- Students pursuing skilled trades careers
- Employers investing in workforce development
- Open source community for excellent tools and libraries

---

**Last Updated:** January 2025

For detailed setup instructions, see [SETUP.md](SETUP.md)







