#!/usr/bin/env python3
"""
AI-Powered Trade School Data Enrichment
Cleans addresses, validates data, and adds context before geocoding
"""

import pandas as pd
import json
import os
from typing import Dict, List, Optional
import anthropic  # pip install anthropic

# ============================================================================
# CONFIGURATION
# ============================================================================

# Set your API key: export ANTHROPIC_API_KEY=your_key_here
# Or set it here (not recommended for production)
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")

# Model to use
MODEL = "claude-3-5-sonnet-20241022"

# ============================================================================
# AI ENRICHMENT FUNCTIONS
# ============================================================================

def clean_address_with_ai(row: pd.Series, client: anthropic.Anthropic) -> Dict:
    """
    Use AI to validate and clean address data
    Returns: {cleaned_address, city, state, zip, confidence, corrections_made}
    """
    
    prompt = f"""Given this trade school record, validate and standardize the address:

Institution: {row.get('Institution Name', 'Unknown')}
Address: {row.get('Address', '')}
City: {row.get('City', '')}
State: {row.get('State', '')}

Tasks:
1. Identify any obvious errors or inconsistencies
2. Standardize to USPS format (abbreviations, capitalization)
3. Fill in missing city/state if you can infer from address
4. Extract ZIP code if present

Return ONLY valid JSON (no markdown):
{{
  "cleaned_address": "street address in USPS format",
  "city": "city name",
  "state": "two-letter state code",
  "zip": "ZIP code or null",
  "confidence": "high|medium|low",
  "corrections_made": ["list of changes made"],
  "needs_review": false
}}"""

    try:
        message = client.messages.create(
            model=MODEL,
            max_tokens=500,
            temperature=0,
            messages=[{"role": "user", "content": prompt}]
        )
        
        response_text = message.content[0].text.strip()
        
        # Remove markdown code blocks if present
        if response_text.startswith("```"):
            response_text = response_text.split("```")[1]
            if response_text.startswith("json"):
                response_text = response_text[4:]
        
        result = json.loads(response_text)
        return result
        
    except Exception as e:
        print(f"  ⚠ AI enrichment failed for {row.get('Institution Name', 'unknown')[:40]}: {e}")
        return {
            "cleaned_address": row.get('Address', ''),
            "city": row.get('City', ''),
            "state": row.get('State', ''),
            "zip": None,
            "confidence": "failed",
            "corrections_made": [],
            "needs_review": True
        }


def batch_enrich_addresses(df: pd.DataFrame, 
                          batch_size: int = 10,
                          save_every: int = 50) -> pd.DataFrame:
    """
    Enrich all addresses with AI validation
    Saves progress periodically
    """
    
    if not ANTHROPIC_API_KEY:
        print("❌ ERROR: ANTHROPIC_API_KEY not set")
        print("   Set it with: export ANTHROPIC_API_KEY=your_key_here")
        return df
    
    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
    
    print(f"\n🤖 AI Address Enrichment")
    print(f"   Processing {len(df)} addresses...")
    print(f"   Model: {MODEL}")
    
    enriched_data = []
    
    for idx, row in df.iterrows():
        # Enrich this row
        result = clean_address_with_ai(row, client)
        enriched_data.append(result)
        
        # Progress
        if (idx + 1) % 10 == 0:
            print(f"  Progress: {idx+1}/{len(df)} ({((idx+1)/len(df)*100):.1f}%)")
        
        # Periodic save
        if (idx + 1) % save_every == 0:
            temp_df = pd.DataFrame(enriched_data)
            temp_df.to_csv("ai_enrichment_progress.csv", index=False)
            print(f"  💾 Progress saved ({idx+1} records)")
    
    # Create enriched dataframe
    enriched_df = pd.DataFrame(enriched_data)
    
    # Merge back with original
    result_df = pd.concat([
        df.reset_index(drop=True),
        enriched_df.add_prefix('ai_')
    ], axis=1)
    
    # Summary stats
    high_conf = (enriched_df['confidence'] == 'high').sum()
    med_conf = (enriched_df['confidence'] == 'medium').sum()
    low_conf = (enriched_df['confidence'] == 'low').sum()
    needs_review = enriched_df['needs_review'].sum()
    
    print(f"\n📊 AI Enrichment Summary:")
    print(f"   High confidence: {high_conf} ({high_conf/len(df)*100:.1f}%)")
    print(f"   Medium confidence: {med_conf} ({med_conf/len(df)*100:.1f}%)")
    print(f"   Low confidence: {low_conf} ({low_conf/len(df)*100:.1f}%)")
    print(f"   Needs manual review: {needs_review}")
    
    if needs_review > 0:
        print(f"\n⚠  {needs_review} records need manual review")
        review_df = result_df[result_df['ai_needs_review'] == True][
            ['Institution Name', 'Address', 'ai_cleaned_address', 'ai_confidence']
        ]
        review_df.to_csv("addresses_needing_review.csv", index=False)
        print(f"   Saved to: addresses_needing_review.csv")
    
    return result_df


def infer_institution_type(row: pd.Series, client: anthropic.Anthropic) -> Dict:
    """
    Infer institution type and estimated capacity
    """
    
    prompt = f"""Based on this trade school information, provide estimates:

Institution Name: {row.get('Institution Name', '')}
Programs Offered: {row.get('Program_Count', 0)} programs
State: {row.get('State', '')}

Provide educated estimates as JSON:
{{
  "institution_type": "community_college|technical_institute|career_center|apprenticeship|private_vocational",
  "estimated_annual_enrollment": "number (typical for this type)",
  "estimated_seats_per_program": "number",
  "likely_accreditation": ["list of likely accreditors"],
  "confidence": "high|medium|low",
  "reasoning": "brief explanation"
}}"""

    try:
        message = client.messages.create(
            model=MODEL,
            max_tokens=400,
            temperature=0,
            messages=[{"role": "user", "content": prompt}]
        )
        
        response_text = message.content[0].text.strip()
        if response_text.startswith("```"):
            response_text = response_text.split("```")[1]
            if response_text.startswith("json"):
                response_text = response_text[4:]
        
        return json.loads(response_text)
        
    except Exception as e:
        return {
            "institution_type": "unknown",
            "estimated_annual_enrollment": None,
            "estimated_seats_per_program": None,
            "likely_accreditation": [],
            "confidence": "failed",
            "reasoning": str(e)
        }


# ============================================================================
# MAIN WORKFLOW
# ============================================================================

def run_ai_enrichment(input_csv: str, output_csv: str = "trade_schools_ai_enriched.csv"):
    """
    Run complete AI enrichment pipeline
    """
    
    print("="*70)
    print("AI-POWERED DATA ENRICHMENT")
    print("="*70)
    print(f"Input: {input_csv}")
    print(f"Output: {output_csv}")
    
    # Load data
    print("\n1. Loading data...")
    df = pd.read_csv(input_csv)
    print(f"   Loaded {len(df)} records")
    
    # Address cleaning
    print("\n2. AI address validation and cleaning...")
    df_enriched = batch_enrich_addresses(df.head(100))  # Start with first 100
    
    # Save results
    print(f"\n3. Saving enriched data to {output_csv}...")
    df_enriched.to_csv(output_csv, index=False)
    
    print("\n✅ AI Enrichment Complete!")
    print("\nNew columns added:")
    print("  - ai_cleaned_address: Validated and standardized address")
    print("  - ai_city: Cleaned city name")
    print("  - ai_state: Validated state code")
    print("  - ai_zip: Extracted ZIP code")
    print("  - ai_confidence: Quality score (high/medium/low)")
    print("  - ai_corrections_made: List of corrections")
    print("  - ai_needs_review: Flag for manual review")
    
    print("\n💡 Next Steps:")
    print("  1. Review addresses_needing_review.csv if it exists")
    print("  2. Use ai_cleaned_address for geocoding instead of raw Address")
    print("  3. Run the main analysis script with this enriched data")
    
    return df_enriched


if __name__ == "__main__":
    import sys
    
    # Check for API key
    if not ANTHROPIC_API_KEY:
        print("\n❌ ERROR: ANTHROPIC_API_KEY environment variable not set")
        print("\nTo use this script:")
        print("  1. Get an API key from https://console.anthropic.com")
        print("  2. Set it: export ANTHROPIC_API_KEY=your_key_here")
        print("  3. Run this script again")
        sys.exit(1)
    
    # Default input file
    input_file = "trade_schools_curated.csv"
    
    # Override from command line if provided
    if len(sys.argv) > 1:
        input_file = sys.argv[1]
    
    # Check file exists
    if not os.path.exists(input_file):
        print(f"\n❌ ERROR: File not found: {input_file}")
        print("\nUsage: python ai-data-enrichment.py [input_file.csv]")
        sys.exit(1)
    
    # Run enrichment
    run_ai_enrichment(input_file)

