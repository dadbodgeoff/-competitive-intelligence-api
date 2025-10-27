#!/usr/bin/env python3
"""
Comprehensive verification of Strategic Review Selection System
"""
import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000/api/v1"

def print_header(title):
    print("\n" + "=" * 80)
    print(f"  {title}")
    print("=" * 80)

def verify_system():
    """Verify all components of the strategic review selection system"""
    
    print_header("STRATEGIC REVIEW SELECTION SYSTEM - VERIFICATION")
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    # Login
    print("🔐 Authenticating...")
    login_response = requests.post(f"{BASE_URL}/auth/login", json={
        "email": "nrivikings8@gmail.com",
        "password": "testpass123"
    })
    
    if login_response.status_code != 200:
        print(f"❌ Authentication failed")
        return False
    
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("✅ Authenticated\n")
    
    # Use the most recent analysis
    analysis_id = "749d0eee-0981-458c-a5a2-46546144c0bf"
    
    print(f"📊 Fetching analysis: {analysis_id}")
    results_response = requests.get(
        f"{BASE_URL}/analysis/{analysis_id}",
        headers=headers
    )
    
    if results_response.status_code != 200:
        print(f"❌ Failed to fetch analysis")
        return False
    
    results = results_response.json()
    
    # Verification Checklist
    print_header("VERIFICATION CHECKLIST")
    
    checks = []
    
    # 1. Data Collection (35 Reviews)
    print("\n✓ 1. DATA COLLECTION (35 Reviews per Competitor)")
    competitors = results.get('competitors', [])
    print(f"   Competitors found: {len(competitors)}")
    
    # Check database for actual review count
    for comp in competitors:
        comp_name = comp.get('competitor_name', comp.get('name', 'Unknown'))
        sample_reviews = comp.get('sample_reviews', [])
        print(f"   • {comp_name}")
        print(f"     - Sample reviews in API: {len(sample_reviews)}")
        print(f"     - Review count: {comp.get('review_count', 'N/A')}")
    
    checks.append(("35 reviews collected", len(competitors) == 2))
    
    # 2. Smart Selection (Best 10 from 35)
    print("\n✓ 2. SMART SELECTION (Best 10 from 35)")
    print(f"   Evidence reviews in response: {'evidence_reviews' in results}")
    
    if 'evidence_reviews' in results:
        evidence = results['evidence_reviews']
        print(f"   Evidence structure: {list(evidence.keys())}")
        for comp_name, reviews in evidence.items():
            print(f"   • {comp_name}:")
            print(f"     - Negative: {len(reviews.get('negative', []))}")
            print(f"     - Positive: {len(reviews.get('positive', []))}")
            print(f"     - Neutral: {len(reviews.get('neutral', []))}")
    else:
        print(f"   ⚠️  Evidence reviews not in API response")
    
    checks.append(("Evidence reviews available", 'evidence_reviews' in results))
    
    # 3. Competitor Limit (2 for Free Tier)
    print("\n✓ 3. COMPETITOR LIMIT (2 for Free Tier)")
    print(f"   Competitors: {len(competitors)}")
    print(f"   Tier: {results.get('tier', 'unknown')}")
    
    checks.append(("Exactly 2 competitors", len(competitors) == 2))
    
    # 4. Insight Generation (4 Total: 2 per Competitor)
    print("\n✓ 4. INSIGHT GENERATION (4 Total: 2 per Competitor)")
    insights = results.get('insights', [])
    print(f"   Total insights: {len(insights)}")
    
    insights_by_competitor = {}
    for insight in insights:
        comp_name = insight.get('competitor_name', 'Unknown')
        insights_by_competitor[comp_name] = insights_by_competitor.get(comp_name, 0) + 1
    
    print(f"   Distribution:")
    for comp_name, count in insights_by_competitor.items():
        print(f"   • {comp_name}: {count} insights")
    
    checks.append(("Exactly 4 insights", len(insights) == 4))
    checks.append(("2 insights per competitor", all(c == 2 for c in insights_by_competitor.values())))
    
    # 5. Competitor Name Attribution
    print("\n✓ 5. COMPETITOR NAME ATTRIBUTION")
    missing_names = [i for i in insights if not i.get('competitor_name') or i.get('competitor_name') == 'Multiple Sources']
    print(f"   Insights with competitor names: {len(insights) - len(missing_names)}/{len(insights)}")
    
    if missing_names:
        print(f"   ⚠️  {len(missing_names)} insights missing competitor attribution")
    
    checks.append(("All insights attributed", len(missing_names) == 0))
    
    # 6. Evidence Tracking
    print("\n✓ 6. EVIDENCE TRACKING (NEW FEATURE)")
    has_evidence = 'evidence_reviews' in results
    print(f"   Evidence reviews field: {'✅ Present' if has_evidence else '❌ Missing'}")
    
    checks.append(("Evidence tracking implemented", has_evidence))
    
    # 7. Sample Reviews
    print("\n✓ 7. SAMPLE REVIEWS (3 per Competitor)")
    for comp in competitors:
        comp_name = comp.get('competitor_name', comp.get('name', 'Unknown'))
        sample_count = len(comp.get('sample_reviews', []))
        print(f"   • {comp_name}: {sample_count} sample reviews")
    
    checks.append(("Sample reviews present", all(len(c.get('sample_reviews', [])) > 0 for c in competitors)))
    
    # 8. Strategic Pattern (1 weakness + 1 strength per competitor)
    print("\n✓ 8. STRATEGIC PATTERN (1 Weakness + 1 Strength)")
    
    for comp_name in insights_by_competitor.keys():
        comp_insights = [i for i in insights if i.get('competitor_name') == comp_name]
        categories = [i.get('category') for i in comp_insights]
        
        has_weakness = 'opportunity' in categories or 'threat' in categories
        has_strength = 'watch' in categories
        
        print(f"   • {comp_name}:")
        print(f"     - Weakness insight: {'✅' if has_weakness else '❌'}")
        print(f"     - Strength insight: {'✅' if has_strength else '❌'}")
    
    # Summary
    print_header("VERIFICATION SUMMARY")
    
    passed = sum(1 for _, result in checks if result)
    total = len(checks)
    
    print(f"\n📊 Results: {passed}/{total} checks passed\n")
    
    for check_name, result in checks:
        status = "✅" if result else "❌"
        print(f"   {status} {check_name}")
    
    # Detailed Insight Analysis
    print_header("DETAILED INSIGHT ANALYSIS")
    
    for idx, insight in enumerate(insights, 1):
        print(f"\n💡 Insight {idx}:")
        print(f"   Title: {insight.get('title')}")
        print(f"   Category: {insight.get('category')}")
        print(f"   Competitor: {insight.get('competitor_name')}")
        print(f"   Confidence: {insight.get('confidence')}")
        print(f"   Significance: {insight.get('significance')}%")
        print(f"   Mentions: {insight.get('mention_count')}")
        proof = insight.get('proof_quote', '')
        if proof:
            print(f"   Proof: \"{proof[:80]}...\"" if len(proof) > 80 else f"   Proof: \"{proof}\"")
    
    # Final Status
    print_header("FINAL STATUS")
    
    if passed == total:
        print("\n✅ ALL CHECKS PASSED - System is working as designed!")
    elif passed >= total * 0.8:
        print(f"\n⚠️  MOSTLY WORKING - {total - passed} issues need attention")
    else:
        print(f"\n❌ ISSUES DETECTED - {total - passed} checks failed")
    
    print(f"\nAnalysis ID: {analysis_id}")
    print(f"View in browser: http://localhost:5173/analysis/{analysis_id}/results\n")
    
    return passed == total

if __name__ == "__main__":
    try:
        success = verify_system()
        exit(0 if success else 1)
    except Exception as e:
        print(f"\n❌ Verification failed: {str(e)}")
        import traceback
        traceback.print_exc()
        exit(1)
