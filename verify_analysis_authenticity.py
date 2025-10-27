#!/usr/bin/env python3
"""Verify that the analysis insights are based on real review data"""
import os
from dotenv import load_dotenv
from supabase import create_client
import json

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

analysis_id = "1b59b061-1743-4828-a569-6d8f02e844d0"

print("=" * 80)
print("ANALYSIS AUTHENTICITY VERIFICATION")
print("=" * 80)

# Get analysis details
analysis_response = client.table("analyses").select("*").eq("id", analysis_id).execute()
if not analysis_response.data:
    print("❌ Analysis not found")
    exit(1)

analysis = analysis_response.data[0]
print(f"\n📊 ANALYSIS: {analysis['restaurant_name']}")
print(f"Location: {analysis['location']}")
print(f"Category: {analysis['category']}")
print(f"Status: {analysis['status']}")
print(f"Tier: {analysis['tier']}")

# Get competitors
competitors_response = client.table("analysis_competitors").select("*").eq("analysis_id", analysis_id).execute()
competitor_ids = [c['competitor_id'] for c in competitors_response.data]

print(f"\n🏪 COMPETITORS ({len(competitor_ids)}):")
competitors_data = {}
for comp_id in competitor_ids:
    comp_response = client.table("competitors").select("*").eq("id", comp_id).execute()
    if comp_response.data:
        comp = comp_response.data[0]
        competitors_data[comp_id] = comp
        print(f"- {comp['name']} ({comp['rating']}⭐, {comp['review_count']} reviews)")
        print(f"  Address: {comp.get('address', 'N/A')}")
        print(f"  Google Place ID: {comp.get('google_place_id', 'N/A')}")

# Get all reviews for these competitors
print(f"\n📝 ACTUAL REVIEWS COLLECTED:")
all_reviews = []
for comp_id in competitor_ids:
    reviews_response = client.table("reviews").select("*").eq("competitor_id", comp_id).execute()
    comp_name = competitors_data[comp_id]['name']
    reviews = reviews_response.data
    all_reviews.extend(reviews)
    
    print(f"\n### {comp_name} - {len(reviews)} reviews:")
    for idx, review in enumerate(reviews[:5], 1):  # Show first 5
        print(f"  {idx}. [{review['rating']}⭐] {review['text'][:100]}...")

print(f"\n💡 INSIGHTS GENERATED:")
insights_response = client.table("insights").select("*").eq("analysis_id", analysis_id).execute()
insights = insights_response.data

for idx, insight in enumerate(insights, 1):
    print(f"\n--- INSIGHT {idx} ---")
    print(f"Title: {insight['title']}")
    print(f"Category: {insight['category']}")
    print(f"Description: {insight['description']}")
    print(f"Proof Quote: '{insight.get('proof_quote', 'N/A')}'")
    print(f"Source: {insight.get('competitor_name', 'N/A')}")
    print(f"Confidence: {insight['confidence']}")
    
    # VERIFY: Check if proof quote exists in actual reviews
    proof_quote = insight.get('proof_quote', '')
    if proof_quote and proof_quote != 'N/A':
        found = False
        for review in all_reviews:
            if proof_quote.lower() in review['text'].lower():
                found = True
                comp_name = competitors_data.get(review['competitor_id'], {}).get('name', 'Unknown')
                print(f"✅ VERIFIED: Quote found in review from {comp_name}")
                print(f"   Full review: {review['text'][:150]}...")
                break
        
        if not found:
            print(f"⚠️  WARNING: Quote not found in collected reviews")
            print(f"   Searching for partial matches...")
            # Try partial match
            quote_words = proof_quote.lower().split()
            for review in all_reviews:
                review_lower = review['text'].lower()
                matches = sum(1 for word in quote_words if word in review_lower)
                if matches >= len(quote_words) * 0.6:  # 60% word match
                    print(f"   Partial match in: {review['text'][:100]}...")

print("\n" + "=" * 80)
print("VERIFICATION SUMMARY")
print("=" * 80)
print(f"Total Competitors: {len(competitor_ids)}")
print(f"Total Reviews Collected: {len(all_reviews)}")
print(f"Total Insights Generated: {len(insights)}")
print(f"\nCompetitor Names:")
for comp_id, comp in competitors_data.items():
    print(f"  - {comp['name']}")
