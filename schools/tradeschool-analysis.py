#!/usr/bin/env python3
"""
US Trade School Supply Chain Analysis - Complete Production Script
Analyzes trade school data to identify workforce gaps and create matchmaking opportunities
"""

import pandas as pd
import numpy as np
import re
import json
import os
from dataclasses import dataclass
from typing import Dict, List, Optional
from datetime import datetime
from collections import Counter

# Set random seed for reproducibility
np.random.seed(42)

# ============================================================================
# DATA PROCESSING UTILITIES
# ============================================================================

def clean_phone(s: Optional[str]) -> Optional[str]:
    """Clean phone numbers to digits only"""
    if pd.isna(s):
        return None
    s = str(s)
    digits = re.sub(r"\D", "", s)
    return digits if digits else None

def extract_state_from_address(addr: Optional[str]) -> Optional[str]:
    """Extract state code from address string"""
    if pd.isna(addr):
        return None
    m = re.search(r",\s*([A-Z]{2})\s+\d", str(addr))
    return m.group(1) if m else None

def extract_city_from_address(addr: Optional[str]) -> Optional[str]:
    """Extract city from address string"""
    if pd.isna(addr):
        return None
    parts = [p.strip() for p in str(addr).split(",")]
    if len(parts) >= 3:
        return parts[-2]
    return None

def normalize_programs(programs_val) -> str:
    """Normalize program strings (handles pipes and commas)"""
    if pd.isna(programs_val):
        return ""
    s = str(programs_val)
    s = s.replace("|", ",")
    s = re.sub(r"\s*,\s*", ",", s.strip())
    s = re.sub(r",+", ",", s)
    return s.strip(", ")

def to_program_list(s: str) -> List[str]:
    """Convert program string to list"""
    if not s or pd.isna(s):
        return []
    return [p.strip() for p in re.split(r"[|,]", s) if p.strip()]

# ============================================================================
# DATA CLASSES
# ============================================================================

@dataclass
class WorkforceGap:
    state: str
    skill: str
    current_capacity: int
    estimated_demand: int
    gap_size: int
    priority_score: float

# ============================================================================
# MAIN ANALYZER CLASS
# ============================================================================

class TradeSchoolAnalyzer:
    """Core analysis engine for trade school data"""
    
    def __init__(self, df: pd.DataFrame):
        self.df = df.copy()
        self.program_categories = {
            'Transportation': ['Diesel & Automotive Tech', 'Diesel Mechanics', 'CDL Training'],
            'Manufacturing': ['Machine & Mechanical Systems', 'CAD/CAM Drafting', 'Electronics', 'Machining'],
            'Construction': ['Construction', 'Woodworking & Carpentry', 'Plumbing & Pipefitting'],
            'Skilled Trades': ['Welding', 'HVAC', 'Plumbing & Pipefitting', 'Electrical'],
            'Advanced Manufacturing': ['CAD/CAM Drafting', 'Electronics', 'Machine & Mechanical Systems', 'Robotics']
        }
    
    def geographic_distribution(self) -> pd.DataFrame:
        """Analyze geographic distribution of schools and programs"""
        grp = self.df.groupby("State", dropna=False).agg(
            total_schools=("Institution Name", "count"),
            total_program_offerings=("Program_Count", "sum"),
            unique_programs=("Program_List", lambda x: len(set(p for lst in x for p in lst)))
        ).reset_index().sort_values("total_schools", ascending=False)
        return grp
    
    def program_availability(self) -> pd.DataFrame:
        """Analyze program availability across institutions"""
        all_programs = [p for lst in self.df["Program_List"] for p in lst]
        if len(all_programs) == 0:
            return pd.DataFrame(columns=["program", "count", "penetration_pct"])
        
        vc = pd.Series(all_programs).value_counts().reset_index()
        vc.columns = ["program", "count"]
        total_schools = len(self.df)
        vc["penetration_pct"] = (vc["count"] / total_schools * 100).round(2)
        return vc
    
    def skill_clusters(self) -> Dict[str, Dict]:
        """Identify geographic clusters of specific skills"""
        clusters = {}
        for cat, progs in self.program_categories.items():
            mask = self.df["Program_List"].apply(lambda lst: any(p in lst for p in progs))
            sub = self.df[mask]
            state_counts = sub["State"].value_counts(dropna=True)
            total = int(sub.shape[0])
            shares = (state_counts / total) if total > 0 else pd.Series(dtype=float)
            hhi = float((shares.pow(2).sum())) if total > 0 else 0.0
            clusters[cat] = {
                "total_schools": total,
                "top_states": state_counts.head(10).to_dict(),
                "geographic_concentration_index": round(hhi, 4)
            }
        return clusters
    
    def workforce_gaps(self) -> Dict[str, Dict]:
        """Identify workforce gaps and underserved areas"""
        states = self.df["State"].dropna().unique().tolist()
        
        # Program coverage by state
        program_coverage = {}
        critical_programs = ["HVAC", "Plumbing & Pipefitting", "Electronics", 
                           "Machine & Mechanical Systems", "Welding", "Diesel & Automotive Tech"]
        
        for prog in critical_programs:
            states_with = set(
                self.df[self.df["Program_List"].apply(lambda lst: prog in lst)]["State"]
                .dropna().unique().tolist()
            )
            coverage_pct = round(len(states_with) / max(1, len(states)) * 100, 1)
            missing = [s for s in states if s not in states_with]
            program_coverage[prog] = {
                "states_covered": len(states_with),
                "coverage_percentage": coverage_pct,
                "missing_states_preview": missing[:10]
            }
        
        # Underserved states
        state_counts = self.df["State"].value_counts(dropna=True)
        threshold = state_counts.quantile(0.25) if not state_counts.empty else 0
        underserved = state_counts[state_counts <= threshold]
        underserved_list = [
            {"state": s, "school_count": int(c), "deficit": int(state_counts.median() - c)}
            for s, c in underserved.items()
        ]
        
        # Generate recommendations
        recs = []
        if underserved_list:
            top_states = [d["state"] for d in underserved_list[:3]]
            recs.append(f"Priority expansion targets: {', '.join(top_states)} (training capacity deficit)")
        
        for prog, meta in program_coverage.items():
            if meta["coverage_percentage"] < 50:
                recs.append(f"Critical gap: {prog} available in only {meta['coverage_percentage']}% of states")
        
        return {
            "underserved_states": underserved_list,
            "program_gaps": program_coverage,
            "recommendations": recs
        }
    
    def executive_summary(self) -> Dict:
        """Generate executive summary of all analyses"""
        geo = self.geographic_distribution()
        prog_avail = self.program_availability()
        clusters = self.skill_clusters()
        gaps = self.workforce_gaps()
        
        top_states = (
            geo[["State", "total_schools"]]
            .dropna()
            .sort_values("total_schools", ascending=False)
            .head(5)
            .values.tolist()
        )
        
        return {
            "overview": {
                "total_institutions": int(self.df.shape[0]),
                "states_covered": int(self.df["State"].dropna().nunique()),
                "unique_programs": int(prog_avail["program"].nunique()) if not prog_avail.empty else 0,
                "total_training_capacity_proxy": int(self.df["Program_Count"].sum())
            },
            "key_findings": {
                "most_common_programs": prog_avail.head(10).set_index("program")["count"].to_dict() if not prog_avail.empty else {},
                "highest_concentration_states": {s: int(c) for s, c in top_states},
                "critical_skill_clusters": clusters,
            },
            "strategic_insights": {
                "geographic_gaps": [u["state"] for u in gaps["underserved_states"][:5]],
                "program_gaps": {k: f"{v['coverage_percentage']}% coverage" for k, v in gaps["program_gaps"].items()},
                "recommendations": gaps["recommendations"]
            }
        }

# ============================================================================
# SUPPLY CHAIN WORKFORCE OPTIMIZER
# ============================================================================

class SupplyChainWorkforceOptimizer:
    """Optimize workforce development for supply chain needs"""
    
    def __init__(self, df: pd.DataFrame):
        self.df = df.copy()
        self.df["Program_Array"] = self.df["Program_List"]
        self.df["Quality_Score"] = (
            self.df["Contact Email"].notna().astype(int) +
            self.df["Website"].notna().astype(int) +
            self.df["Contact Name"].notna().astype(int)
        ) / 3.0
        
        self.supply_chain_critical_skills = {
            'Transportation': {
                'skills': ['Diesel & Automotive Tech', 'CDL Training'],
                'demand_multiplier': 1.8,
                'average_salary': 55000
            },
            'Warehousing': {
                'skills': ['Machine & Mechanical Systems', 'Electronics'],
                'demand_multiplier': 1.5,
                'average_salary': 45000
            },
            'Manufacturing': {
                'skills': ['Welding', 'Machine & Mechanical Systems', 'CAD/CAM Drafting'],
                'demand_multiplier': 1.6,
                'average_salary': 52000
            },
            'Infrastructure': {
                'skills': ['Construction', 'HVAC', 'Plumbing & Pipefitting'],
                'demand_multiplier': 1.7,
                'average_salary': 58000
            },
            'Energy': {
                'skills': ['HVAC', 'Electronics', 'Plumbing & Pipefitting'],
                'demand_multiplier': 1.4,
                'average_salary': 60000
            }
        }
        
        # Generate simulated economic data for states
        states_present = sorted(self.df["State"].dropna().unique().tolist())
        self.state_economic_data = {
            s: {
                'unemployment_rate': float(np.random.uniform(3.0, 7.0)),
                'job_growth_rate': float(np.random.uniform(-0.5, 3.0)),
                'manufacturing_index': float(np.random.uniform(80, 120)),
                'logistics_hub_score': float(np.random.uniform(0.3, 1.0))
            } for s in states_present
        }
    
    def _estimate_skill_demand(self, state: str, sector: str) -> int:
        """Estimate workforce demand for a skill in a state"""
        base_demand = 10
        econ = self.state_economic_data.get(state, {
            'unemployment_rate': 5.0,
            'job_growth_rate': 1.0,
            'manufacturing_index': 100.0,
            'logistics_hub_score': 0.5
        })
        
        multiplier = (
            (1 + econ['job_growth_rate'] / 100.0) *
            (econ['manufacturing_index'] / 100.0) *
            (1 + econ['logistics_hub_score'])
        )
        sector_mult = self.supply_chain_critical_skills[sector]['demand_multiplier']
        return max(int(round(base_demand * multiplier * sector_mult)), 1)
    
    def _calculate_priority(self, state: str, sector: str, gap_size: int) -> float:
        """Calculate priority score for addressing a workforce gap"""
        econ = self.state_economic_data.get(state, {
            'unemployment_rate': 5.0,
            'logistics_hub_score': 0.5
        })
        
        sector_importance = {
            'Transportation': 1.5,
            'Infrastructure': 1.4,
            'Manufacturing': 1.3,
            'Energy': 1.2,
            'Warehousing': 1.1
        }[sector]
        
        economic_factor = econ['unemployment_rate'] / 5.0 + econ['logistics_hub_score'] * 2.0
        return float(gap_size) * sector_importance * economic_factor
    
    def calculate_workforce_gaps(self) -> List[WorkforceGap]:
        """Calculate and prioritize workforce gaps"""
        gaps = []
        
        for state in self.df["State"].dropna().unique():
            state_df = self.df[self.df["State"] == state]
            
            for sector, meta in self.supply_chain_critical_skills.items():
                for skill in meta["skills"]:
                    capacity = int(sum(1 for progs in state_df["Program_Array"] if skill in progs))
                    demand = self._estimate_skill_demand(state, sector)
                    gap = demand - capacity
                    
                    if gap > 0:
                        prio = self._calculate_priority(state, sector, gap)
                        gaps.append(WorkforceGap(state, skill, capacity, demand, gap, prio))
        
        return sorted(gaps, key=lambda g: g.priority_score, reverse=True)
    
    def investment_recommendations(self) -> Dict:
        """Generate investment recommendations based on gaps"""
        gaps = self.calculate_workforce_gaps()
        
        # Top priorities
        immediate = [{
            "state": g.state,
            "skill": g.skill,
            "gap_size": g.gap_size,
            "priority_score": round(g.priority_score, 2),
            "action": f"Expand {g.skill} training by {g.gap_size} seats",
            "estimated_cost": g.gap_size * 15000
        } for g in gaps[:15]]
        
        # ROI calculations
        roi = {}
        for g in gaps[:10]:
            sector = None
            for sec, meta in self.supply_chain_critical_skills.items():
                if g.skill in meta["skills"]:
                    sector = sec
                    break
            
            if sector:
                avg_salary = self.supply_chain_critical_skills[sector]["average_salary"]
                training_cost = 15000
                tax_rev = avg_salary * 0.25
                roi_years = training_cost / tax_rev if tax_rev else None
                
                roi[f"{g.state}:{g.skill}"] = {
                    "training_cost_per_person": training_cost,
                    "average_post_training_salary": avg_salary,
                    "estimated_annual_tax_revenue": tax_rev,
                    "roi_payback_period_years": round(roi_years, 1) if roi_years else None,
                    "five_year_net_benefit": int(tax_rev * 5 - training_cost)
                }
        
        return {"immediate_priorities": immediate, "estimated_roi": roi}

# ============================================================================
# MAIN EXECUTION FUNCTION
# ============================================================================

def run_complete_analysis(csv_path: str, output_dir: str = ".") -> Dict:
    """
    Run complete analysis on trade school data
    
    Args:
        csv_path: Path to the CSV file with trade school data
        output_dir: Directory to save output files
    
    Returns:
        Dictionary with file paths and summary statistics
    """
    
    print("=" * 70)
    print("US TRADE SCHOOL SUPPLY CHAIN ANALYSIS")
    print("=" * 70)
    
    # Load and process data
    print("\n1. Loading and processing data...")
    df = pd.read_csv(csv_path)
    
    # Clean and standardize
    print("2. Cleaning and standardizing...")
    df["Institution Name"] = df.get("Institution Name", df.get("institution_name", "")).astype(str).str.strip()
    df["Address"] = df.get("Address", df.get("address", "")).astype(str).str.strip()
    df["Programs"] = df.get("Programs", df.get("programs", "")).apply(normalize_programs)
    df["Contact Email"] = df.get("Contact Email", df.get("contact_email", ""))
    df["Website"] = df.get("Website", df.get("website", ""))
    df["Contact Name"] = df.get("Contact Name", df.get("contact_name", ""))
    
    # Extract geographic info
    df["State"] = df["Address"].apply(extract_state_from_address)
    df["City"] = df["Address"].apply(extract_city_from_address)
    
    # Create program lists
    df["Program_List"] = df["Programs"].apply(to_program_list)
    df["Program_Count"] = df["Program_List"].apply(len)
    
    # Remove empty rows
    df = df[~(df["Institution Name"].isna() & df["Address"].isna())].copy()
    
    # Deduplicate
    df["dedup_key"] = (
        df["Institution Name"].fillna("").str.lower().str.strip() + " | " + 
        df["Address"].fillna("").str.lower().str.strip()
    )
    df = df.drop_duplicates(subset=["dedup_key"]).drop(columns=["dedup_key"])
    
    print(f"   Processed {len(df)} institutions across {df['State'].nunique()} states")
    
    # Run analyses
    print("\n3. Running analyses...")
    analyzer = TradeSchoolAnalyzer(df)
    optimizer = SupplyChainWorkforceOptimizer(df)
    
    # Generate outputs
    print("4. Generating outputs...")
    
    # Executive summary
    summary = analyzer.executive_summary()
    summary_path = os.path.join(output_dir, "supply_chain_analysis.json")
    with open(summary_path, "w") as f:
        json.dump(summary, f, indent=2)
    
    # Optimization results
    gaps = optimizer.calculate_workforce_gaps()
    recs = optimizer.investment_recommendations()
    opt_payload = {
        "timestamp": datetime.now().isoformat(),
        "top_gaps": [g.__dict__ for g in gaps[:50]],
        "investment_recommendations": recs
    }
    opt_path = os.path.join(output_dir, "workforce_optimization_results.json")
    with open(opt_path, "w") as f:
        json.dump(opt_payload, f, indent=2, default=str)
    
    # Matchmaking index
    matchmaking = df.explode("Program_List")[
        ["Institution Name", "State", "City", "Program_List", "Contact Email", "Website"]
    ].rename(columns={"Program_List": "program"})
    mm_path = os.path.join(output_dir, "matchmaking_index.csv")
    matchmaking.to_csv(mm_path, index=False)
    
    # Print summary
    print("\n" + "=" * 70)
    print("ANALYSIS COMPLETE")
    print("=" * 70)
    print(f"\nTotal Institutions: {summary['overview']['total_institutions']}")
    print(f"States Covered: {summary['overview']['states_covered']}")
    print(f"Unique Programs: {summary['overview']['unique_programs']}")
    print(f"Matchmaking Pairs: {len(matchmaking)}")
    
    print("\nTOP 5 STATES BY INSTITUTION COUNT:")
    geo_df = analyzer.geographic_distribution()
    for idx, row in geo_df.head(5).iterrows():
        print(f"  {row['State']}: {row['total_schools']} institutions")
    
    print("\nTOP 5 MOST AVAILABLE PROGRAMS:")
    prog_df = analyzer.program_availability()
    for idx, row in prog_df.head(5).iterrows():
        print(f"  {row['program']}: {row['count']} institutions ({row['penetration_pct']}%)")
    
    print("\nTOP 5 IMMEDIATE PRIORITIES:")
    for i, priority in enumerate(recs['immediate_priorities'][:5], 1):
        print(f"  {i}. {priority['state']} - {priority['skill']}")
        print(f"     Gap: {priority['gap_size']} | Priority: {priority['priority_score']} | Cost: ${priority['estimated_cost']:,}")
    
    print("\nFILES SAVED:")
    print(f"  ✓ Executive Summary: {summary_path}")
    print(f"  ✓ Optimization Results: {opt_path}")
    print(f"  ✓ Matchmaking Index: {mm_path}")
    
    return {
        "summary_path": summary_path,
        "optimization_path": opt_path,
        "matchmaking_path": mm_path,
        "statistics": {
            "total_institutions": summary['overview']['total_institutions'],
            "states_covered": summary['overview']['states_covered'],
            "unique_programs": summary['overview']['unique_programs'],
            "matchmaking_pairs": len(matchmaking)
        }
    }

# ============================================================================
# GEOCODING & ENRICHMENT
# ============================================================================

def geocode_with_nominatim(address: str, delay: float = 1.0) -> Dict:
    """
    Geocode address using Nominatim (free, no API key needed)
    Respects usage policy with delay between requests
    """
    import time
    import requests
    
    time.sleep(delay)  # Respect Nominatim usage policy
    
    base_url = "https://nominatim.openstreetmap.org/search"
    params = {
        'q': address,
        'format': 'json',
        'limit': 1,
        'countrycodes': 'us'
    }
    headers = {'User-Agent': 'TradeSchoolAnalysis/1.0'}
    
    try:
        response = requests.get(base_url, params=params, headers=headers, timeout=10)
        response.raise_for_status()
        results = response.json()
        
        if results:
            result = results[0]
            return {
                'lat': float(result['lat']),
                'lon': float(result['lon']),
                'display_name': result.get('display_name', ''),
                'confidence': 'high' if float(result.get('importance', 0)) > 0.5 else 'medium',
                'geocoded': True
            }
    except Exception as e:
        print(f"  ⚠ Geocoding failed for {address[:40]}... Error: {str(e)}")
    
    return {'lat': None, 'lon': None, 'display_name': '', 'confidence': 'failed', 'geocoded': False}


def add_geocoding_to_dataframe(df: pd.DataFrame, use_cache: bool = True) -> pd.DataFrame:
    """
    Add lat/lon geocoding to dataframe with caching and progress tracking
    """
    import os
    import pickle
    
    cache_file = "geocode_cache.pkl"
    
    # Load existing cache
    geocode_cache = {}
    if use_cache and os.path.exists(cache_file):
        try:
            with open(cache_file, 'rb') as f:
                geocode_cache = pickle.load(f)
            print(f"✓ Loaded {len(geocode_cache)} cached geocodes")
        except Exception as e:
            print(f"⚠ Could not load cache: {e}")
    
    geocoded_data = []
    new_geocodes = 0
    failed = 0
    
    print(f"\n🗺️  Geocoding {len(df)} addresses...")
    for idx, row in df.iterrows():
        # Build full address
        address_parts = [
            str(row.get('Address', '')),
            str(row.get('City', '')),
            str(row.get('State', ''))
        ]
        address = ', '.join([p for p in address_parts if p and p != 'nan']).strip()
        
        # Check cache first
        if address in geocode_cache:
            geocoded_data.append(geocode_cache[address])
        else:
            # Geocode new address
            result = geocode_with_nominatim(address, delay=1.1)
            geocode_cache[address] = result
            geocoded_data.append(result)
            
            if result['geocoded']:
                new_geocodes += 1
            else:
                failed += 1
            
            # Progress update
            if (idx + 1) % 25 == 0:
                print(f"  Progress: {idx+1}/{len(df)} ({((idx+1)/len(df)*100):.1f}%) | New: {new_geocodes} | Failed: {failed}")
            
            # Save cache periodically
            if new_geocodes % 100 == 0 and new_geocodes > 0:
                with open(cache_file, 'wb') as f:
                    pickle.dump(geocode_cache, f)
                print(f"  💾 Cache saved ({new_geocodes} new geocodes)")
    
    # Final cache save
    if use_cache:
        with open(cache_file, 'wb') as f:
            pickle.dump(geocode_cache, f)
    
    success_rate = ((new_geocodes) / max(1, new_geocodes + failed)) * 100
    print(f"✓ Geocoding complete: {new_geocodes} new | {failed} failed | {success_rate:.1f}% success rate")
    
    # Add to dataframe
    geo_df = pd.DataFrame(geocoded_data)
    df = pd.concat([df.reset_index(drop=True), geo_df], axis=1)
    
    return df


def extract_county_from_display_name(display_name: str) -> Optional[str]:
    """Extract county from Nominatim display_name field"""
    if not display_name:
        return None
    
    # Nominatim format usually includes county
    parts = [p.strip() for p in display_name.split(',')]
    
    # Look for parts ending in 'County'
    for part in parts:
        if 'County' in part:
            return part.replace('County', '').strip()
    
    return None


def enrich_with_geocoding(df: pd.DataFrame, output_path: Optional[str] = None) -> pd.DataFrame:
    """
    Complete geocoding enrichment workflow
    Returns dataframe with lat, lon, county columns added
    """
    print("\n" + "="*70)
    print("GEOCODING ENRICHMENT")
    print("="*70)
    
    # Add geocoding
    df_enriched = add_geocoding_to_dataframe(df, use_cache=True)
    
    # Extract county from display_name
    df_enriched['county'] = df_enriched['display_name'].apply(extract_county_from_display_name)
    
    # Summary stats
    geocoded_count = df_enriched['geocoded'].sum()
    total = len(df_enriched)
    
    print(f"\n📊 Geocoding Summary:")
    print(f"   Total records: {total}")
    print(f"   Successfully geocoded: {geocoded_count} ({geocoded_count/total*100:.1f}%)")
    print(f"   Failed: {total - geocoded_count}")
    print(f"   Counties identified: {df_enriched['county'].notna().sum()}")
    
    # Save enriched dataset if path provided
    if output_path:
        df_enriched.to_csv(output_path, index=False)
        print(f"✓ Saved enriched data to: {output_path}")
    
    return df_enriched


# ============================================================================
# SCRIPT ENTRY POINT
# ============================================================================

if __name__ == "__main__":
    import sys
    
    # Configuration
    csv_file = "trade_schools_curated.csv"  # Input file - READY TO GO!
    enable_geocoding = True  # Set to True to add lat/lon coordinates - LET'S MAP THIS!
    
    print("="*70)
    print("TRADE SCHOOL ANALYSIS PIPELINE")
    print("="*70)
    print(f"Input file: {csv_file}")
    print(f"Geocoding: {'ENABLED' if enable_geocoding else 'DISABLED'}")
    print()
    
    # Step 1: Run core analysis
    results = run_complete_analysis(csv_file)
    
    # Step 2: Optional geocoding enrichment
    if enable_geocoding:
        try:
            print("\n" + "="*70)
            print("OPTIONAL: GEOCODING ENRICHMENT FOR MAP VISUALIZATIONS")
            print("="*70)
            print("This will add lat/lon coordinates for mapping.")
            print("Note: Takes ~1 second per address (Nominatim rate limit)")
            print("Estimated time: ~" + str(results['statistics']['total_institutions'] // 60) + " minutes")
            
            # Load the unified dataset that was just created
            unified_path = results['output_files'].get('matchmaking', 'matchmaking_index.csv')
            if os.path.exists(unified_path):
                # Load unique institutions only (not exploded by program)
                df_to_geocode = pd.read_csv(unified_path)[
                    ['Institution Name', 'State', 'City', 'Contact Email', 'Website']
                ].drop_duplicates(subset=['Institution Name', 'State'])
                
                print(f"\nFound {len(df_to_geocode)} unique institutions to geocode")
                
                # Add geocoding
                df_geocoded = enrich_with_geocoding(
                    df_to_geocode, 
                    output_path="trade_schools_geocoded.csv"
                )
                
                print("\n✅ Geocoded data saved to: trade_schools_geocoded.csv")
                print("   Columns added: lat, lon, county, display_name, confidence")
                print("\n💡 Next steps for map building:")
                print("   1. Use trade_schools_geocoded.csv as your data source")
                print("   2. Filter rows where geocoded==True")
                print("   3. Use lat/lon for point mapping or H3 hexagon assignment")
                
            else:
                print(f"⚠ Could not find matchmaking index at {unified_path}")
                
        except KeyboardInterrupt:
            print("\n\n⚠ Geocoding interrupted. Partial results saved to cache.")
            print("   Re-run to continue from where you left off.")
        except Exception as e:
            print(f"\n⚠ Geocoding failed: {e}")
            print("   Core analysis results are still available.")
    
    print("\n✅ Analysis complete! Check the output files for detailed results.")