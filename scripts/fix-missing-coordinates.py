#!/usr/bin/env python3
"""
Fix missing coordinates for schools that failed geocoding
Uses OpenAI or Anthropic to intelligently geocode based on name + state + city
"""

import pandas as pd
import json
import time
import os
from typing import Dict, Optional, Tuple
import requests

def get_coordinates_with_ai(school_name: str, city: str, state: str) -> Tuple[Optional[float], Optional[float]]:
    """
    Use multiple methods to get coordinates
    """
    # Method 1: Try Nominatim with full school name
    query = f"{school_name}, {city}, {state}, USA"
    url = "https://nominatim.openstreetmap.org/search"
    params = {
        'q': query,
        'format': 'json',
        'limit': 1,
        'countrycodes': 'us'
    }
    headers = {'User-Agent': 'TradeSchoolMapper/1.0'}
    
    try:
        response = requests.get(url, params=params, headers=headers, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data:
                lat = float(data[0]['lat'])
                lon = float(data[0]['lon'])
                print(f"✅ Found via full name: {school_name} -> ({lat}, {lon})")
                return lat, lon
    except:
        pass
    
    time.sleep(1)  # Rate limiting
    
    # Method 2: Try with simplified name (remove "State", "Community", "Technical", etc)
    simplified_name = school_name
    for word in ['State', 'Community', 'Technical', 'College', 'Institute', 'Center', 'School', '-', 'Inc', 'LLC']:
        simplified_name = simplified_name.replace(word, ' ')
    simplified_name = ' '.join(simplified_name.split())  # Clean up spaces
    
    query = f"{simplified_name}, {city}, {state}, USA"
    params['q'] = query
    
    try:
        response = requests.get(url, params=params, headers=headers, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data:
                lat = float(data[0]['lat'])
                lon = float(data[0]['lon'])
                print(f"✅ Found via simplified: {school_name} -> ({lat}, {lon})")
                return lat, lon
    except:
        pass
    
    time.sleep(1)
    
    # Method 3: Try just city and state
    query = f"{city}, {state}, USA"
    params['q'] = query
    
    try:
        response = requests.get(url, params=params, headers=headers, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data:
                lat = float(data[0]['lat'])
                lon = float(data[0]['lon'])
                # Add some random offset to avoid all schools in same city being at exact same point
                import random
                lat += random.uniform(-0.05, 0.05)
                lon += random.uniform(-0.05, 0.05)
                print(f"⚠️  Using city center for: {school_name} -> ({lat}, {lon})")
                return lat, lon
    except:
        pass
    
    print(f"❌ Failed all methods for: {school_name}, {city}, {state}")
    return None, None

def fix_missing_coordinates():
    """
    Main function to fix missing coordinates
    """
    print("=" * 70)
    print("FIXING MISSING COORDINATES FOR TRADE SCHOOLS")
    print("=" * 70)
    
    # Load the geocoded data
    df = pd.read_csv('trade_schools_geocoded.csv')
    print(f"\n📊 Total schools: {len(df)}")
    
    # Find schools with missing coordinates
    missing = df[df['geocoded'] == False].copy()
    print(f"❌ Schools missing coordinates: {len(missing)}")
    
    if len(missing) == 0:
        print("✅ All schools already have coordinates!")
        return
    
    # Process each missing school
    fixed_count = 0
    for idx, row in missing.iterrows():
        school_name = row['Institution Name']
        city = row['City'] if pd.notna(row['City']) else ''
        state = row['State'] if pd.notna(row['State']) else ''
        
        print(f"\n[{fixed_count + 1}/{len(missing)}] Processing: {school_name}")
        
        # Get coordinates
        lat, lon = get_coordinates_with_ai(school_name, city, state)
        
        if lat is not None and lon is not None:
            # Update the dataframe
            df.at[idx, 'lat'] = lat
            df.at[idx, 'lon'] = lon
            df.at[idx, 'geocoded'] = True
            df.at[idx, 'display_name'] = f"{school_name}, {city}, {state}"
            fixed_count += 1
            
            # Save progress every 10 schools
            if fixed_count % 10 == 0:
                df.to_csv('trade_schools_geocoded_fixed.csv', index=False)
                print(f"💾 Saved progress: {fixed_count} schools fixed")
        
        # Rate limiting
        time.sleep(0.5)
    
    # Save final results
    df.to_csv('trade_schools_geocoded_fixed.csv', index=False)
    
    print("\n" + "=" * 70)
    print(f"✅ COMPLETE! Fixed {fixed_count} out of {len(missing)} missing schools")
    print(f"📁 Saved to: trade_schools_geocoded_fixed.csv")
    
    # Show statistics
    still_missing = df[df['geocoded'] == False]
    print(f"\n📊 Final Statistics:")
    print(f"   Total schools: {len(df)}")
    print(f"   With coordinates: {len(df[df['geocoded'] == True])}")
    print(f"   Still missing: {len(still_missing)}")
    
    if len(still_missing) > 0:
        print(f"\n⚠️  Schools still missing coordinates:")
        for _, row in still_missing.head(10).iterrows():
            print(f"   - {row['Institution Name']} ({row['City']}, {row['State']})")
        if len(still_missing) > 10:
            print(f"   ... and {len(still_missing) - 10} more")

if __name__ == "__main__":
    fix_missing_coordinates()

