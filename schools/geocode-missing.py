#!/usr/bin/env python3
"""
Quick script to geocode the missing schools in RI and SD
"""

import pandas as pd
import time
import requests
import pickle
import os

def geocode_with_nominatim(address, delay=1.0):
    """Geocode using free Nominatim API"""
    time.sleep(delay)
    
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
                'geocoded': True
            }
    except Exception as e:
        print(f"  Failed: {address[:40]}... {e}")
    
    return {'lat': None, 'lon': None, 'display_name': '', 'geocoded': False}

print("="*70)
print("GEOCODING MISSING SCHOOLS (RI & SD)")
print("="*70)

# The missing schools that need geocoding
missing_schools = [
    {'Institution Name': 'South Dakota School of Mines and Technology', 'State': 'SD', 'City': 'Rapid City'},
    {'Institution Name': 'Lincoln Technical Institute-Lincoln', 'State': 'RI', 'City': 'Lincoln'},
    {'Institution Name': 'MotoRing Technical Training Institute', 'State': 'RI', 'City': 'East Providence'}
]

print(f"\nFound {len(missing_schools)} schools to geocode")

# Load existing geocoded data
df = pd.read_csv('trade_schools_geocoded_fixed.csv')
print(f"Loaded {len(df)} existing geocoded schools")

# Geocode the missing schools
print("\n🗺️  Starting geocoding...")

for i, school in enumerate(missing_schools):
    print(f"\n{i+1}. Geocoding: {school['Institution Name']}, {school['City']}, {school['State']}")
    
    # Build address
    address = f"{school['Institution Name']}, {school['City']}, {school['State']}"
    
    # Geocode
    result = geocode_with_nominatim(address, delay=1.1)
    
    if result['geocoded']:
        print(f"  ✅ Success: {result['lat']:.6f}, {result['lon']:.6f}")
        print(f"  📍 {result['display_name'][:80]}...")
        
        # Add to dataframe
        new_row = {
            'Institution Name': school['Institution Name'],
            'State': school['State'],
            'City': school['City'],
            'lat': result['lat'],
            'lon': result['lon'],
            'display_name': result['display_name'],
            'geocoded': True
        }
        df = pd.concat([df, pd.DataFrame([new_row])], ignore_index=True)
    else:
        print(f"  ❌ Failed to geocode")

# Save updated data
output_file = 'trade_schools_geocoded_fixed.csv'
df.to_csv(output_file, index=False)

# Stats
total = len(df)
success = df['geocoded'].sum()
success_rate = (success / total * 100) if total > 0 else 0

print("\n" + "="*70)
print("✅ GEOCODING COMPLETE!")
print("="*70)
print(f"Total schools: {total}")
print(f"Successfully geocoded: {success} ({success_rate:.1f}%)")
print(f"Failed: {total - success}")
print(f"\n📍 Output saved to: {output_file}")

# Check states
states = df[df['geocoded'] == True]['State'].nunique()
print(f"\n🗺️  States represented: {states}/50")

if states == 50:
    print("🎉 ALL 50 STATES NOW REPRESENTED!")
else:
    print(f"⚠️  Still missing {50 - states} states")
