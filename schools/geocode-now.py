#!/usr/bin/env python3
"""
Quick geocoding script to add lat/lon to your trade schools
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
print("GEOCODING YOUR TRADE SCHOOLS FOR MAPPING!")
print("="*70)

# Load the matchmaking index (has unique schools)
df = pd.read_csv('matchmaking_index.csv')

# Get unique institutions
unique_schools = df[['Institution Name', 'State', 'City']].drop_duplicates()
print(f"\nFound {len(unique_schools)} unique institutions to geocode")

# Load cache if exists
cache_file = "geocode_cache.pkl"
geocode_cache = {}
if os.path.exists(cache_file):
    with open(cache_file, 'rb') as f:
        geocode_cache = pickle.load(f)
    print(f"Loaded {len(geocode_cache)} cached geocodes")

# Geocode each unique school
geocoded_data = []
new_geocodes = 0

print("\n🗺️  Starting geocoding...")
print("(This takes ~1 second per new address due to Nominatim rate limits)")

for idx, row in unique_schools.iterrows():
    # Build address
    parts = []
    if pd.notna(row.get('City')):
        parts.append(str(row['City']))
    if pd.notna(row.get('State')):
        parts.append(str(row['State']))
    
    address = f"{row['Institution Name']}, {', '.join(parts)}"
    
    # Check cache
    if address in geocode_cache:
        result = geocode_cache[address]
        geocoded_data.append({
            'Institution Name': row['Institution Name'],
            'State': row['State'],
            'City': row['City'],
            **result
        })
    else:
        # Geocode new address
        result = geocode_with_nominatim(address, delay=1.1)
        geocode_cache[address] = result
        
        geocoded_data.append({
            'Institution Name': row['Institution Name'],
            'State': row['State'],
            'City': row['City'],
            **result
        })
        
        new_geocodes += 1
        
        # Progress
        if (idx + 1) % 10 == 0:
            success = sum(1 for g in geocoded_data if g['geocoded'])
            print(f"  Progress: {idx+1}/{len(unique_schools)} | Success: {success} | New: {new_geocodes}")
        
        # Save cache periodically
        if new_geocodes % 50 == 0 and new_geocodes > 0:
            with open(cache_file, 'wb') as f:
                pickle.dump(geocode_cache, f)
            print(f"  💾 Cache saved")

# Save cache
with open(cache_file, 'wb') as f:
    pickle.dump(geocode_cache, f)

# Create final dataframe
geocoded_df = pd.DataFrame(geocoded_data)

# Save to CSV
output_file = 'trade_schools_geocoded.csv'
geocoded_df.to_csv(output_file, index=False)

# Stats
total = len(geocoded_df)
success = geocoded_df['geocoded'].sum()
success_rate = (success / total * 100) if total > 0 else 0

print("\n" + "="*70)
print("✅ GEOCODING COMPLETE!")
print("="*70)
print(f"Total schools: {total}")
print(f"Successfully geocoded: {success} ({success_rate:.1f}%)")
print(f"Failed: {total - success}")
print(f"\n📍 Output saved to: {output_file}")
print("\n🗺️ YOU'RE READY TO BUILD MAPS!")
print("\nNext steps:")
print("1. Use 'trade_schools_geocoded.csv' as your data source")
print("2. Filter rows where geocoded==True")
print("3. Use lat/lon columns for mapping")
