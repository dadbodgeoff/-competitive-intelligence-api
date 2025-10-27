"""
Get the full JSON results of the latest analysis
"""
from database.supabase_client import get_supabase_service_client
import json

def get_latest_analysis_results():
    """Get the most recent analysis results"""
    service_client = get_supabase_service_client()
    
    print("🔍 Getting latest analysis results...")
    
    # Get the most recent analysis
    analyses = service_client.table("analyses").select("*").order("created_at", desc=True).limit(1).execute()
    
    if not analyses.data:
        print("❌ No analyses found")
        return
    
    analysis = analyses.data[0]
    analysis_id = analysis['id']
    
    print(f"📊 Analysis ID: {analysis_id}")
    print(f"📊 Status: {analysis.get('status')}")
    print(f"📊 Restaurant: {analysis.get('restaurant_name')}")
    print(f"📊 Location: {analysis.get('location')}")
    print(f"📊 Tier: {analysis.get('tier')}")
    print(f"📊 Created: {analysis.get('created_at')}")
    print(f"📊 Completed: {analysis.get('completed_at')}")
    
    # Get competitors
    competitors = service_client.table("competitors").select("*").eq("analysis_id", analysis_id).execute()
    print(f"\n🏪 Competitors found: {len(competitors.data)}")
    
    for comp in competitors.data:
        print(f"   • {comp.get('name')} (Rating: {comp.get('rating')}, Reviews: {comp.get('review_count')})")
    
    # Get insights
    insights = service_client.table("insights").select("*").eq("analysis_id", analysis_id).execute()
    print(f"\n💡 Insights generated: {len(insights.data)}")
    
    for insight in insights.data:
        print(f"   • {insight.get('title')} ({insight.get('category')}, {insight.get('confidence')})")
    
    # Show full JSON structure
    print(f"\n📋 FULL ANALYSIS JSON:")
    print("=" * 60)
    
    full_result = {
        "analysis": analysis,
        "competitors": competitors.data,
        "insights": insights.data
    }
    
    print(json.dumps(full_result, indent=2, default=str))

if __name__ == "__main__":
    get_latest_analysis_results()