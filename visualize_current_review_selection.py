#!/usr/bin/env python3
"""Visualize how reviews are currently being selected"""
import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY"))

analysis_id = "1b59b061-1743-4828-a569-6d8f02e844d0"

# Get competitors
competitors_response = client.table("analysis_competitors").select("*").eq("analysis_id", analysis_id).execute()
competitor_ids = [c['competitor_id'] for c in competitors_response.data]

print("=" * 80)
print("CURRENT REVIEW SELECTION VISUALIZATION")
print("=" * 80)

for comp_id in competitor_ids:
    # Get competitor name
    comp_response = client.table("competitors").select("*").eq("id", comp_id).execute()
    comp_name = comp_response.data[0]['name'] if comp_response.data else "Unknown"
    
    # Get all reviews for this competitor
    reviews_response = client.table("reviews").select("*").eq("competitor_id", comp_id).execute()
    reviews = reviews_response.data
    
    print(f"\n{'='*80}")
    print(f"🏪 {comp_name}")
    print(f"{'='*80}")
    print(f"Total reviews collected: {len(reviews)}")
    
    # Analyze rating distribution
    rating_dist = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    for review in reviews:
        rating_dist[review['rating']] += 1
    
    print(f"\n📊 Rating Distribution:")
    for rating in [5, 4, 3, 2, 1]:
        count = rating_dist[rating]
        bar = "█" * count
        print(f"  {rating}⭐: {bar} ({count})")
    
    # Show quality scores if available
    print(f"\n💎 Quality Scores:")
    for idx, review in enumerate(reviews, 1):
        quality = review.get('quality_score', 0)
        rating = review['rating']
        text_preview = review['text'][:60]
        print(f"  {idx}. [{rating}⭐] Quality: {quality:.2f} - {text_preview}...")
    
    # Calculate what SHOULD be selected with intelligent sampling
    print(f"\n🎯 Intelligent Selection Would Choose:")
    
    # Group by rating
    by_rating = {1: [], 2: [], 3: [], 4: [], 5: []}
    for review in reviews:
        by_rating[review['rating']].append(review)
    
    # Show what would be selected with diversity sampling
    selected = []
    for rating in [1, 5, 2, 4, 3]:  # Prioritize extremes
        if by_rating[rating] and len(selected) < 5:
            # Would select highest quality from this rating
            best = max(by_rating[rating], key=lambda x: x.get('quality_score', 0))
            selected.append(best)
            print(f"  ✓ [{rating}⭐] Quality {best.get('quality_score', 0):.2f}: {best['text'][:50]}...")
    
    # Fill remaining with highest quality
    if len(selected) < 5:
        remaining = [r for r in reviews if r not in selected]
        remaining_sorted = sorted(remaining, key=lambda x: x.get('quality_score', 0), reverse=True)
        for review in remaining_sorted[:5-len(selected)]:
            selected.append(review)
            print(f"  ✓ [{review['rating']}⭐] Quality {review.get('quality_score', 0):.2f}: {review['text'][:50]}...")
    
    print(f"\n📈 Selection Quality:")
    print(f"  Current: Just takes first 5 (whatever Google returns)")
    print(f"  Improved: Balanced ratings + highest quality = better insights")

print("\n" + "=" * 80)
print("SUMMARY")
print("=" * 80)
print("""
Current System:
  ❌ Takes first N reviews (random order from Google)
  ❌ No quality-based sorting
  ❌ No rating distribution balance
  ❌ Luck-dependent results

Improved System Would:
  ✅ Sort by quality score
  ✅ Ensure rating diversity (1-5 stars)
  ✅ Prioritize extreme ratings (1⭐ and 5⭐)
  ✅ Consistent, reliable insights
  
Impact: Better competitive intelligence with same API cost
""")
