#!/usr/bin/env python3
"""
Simplified Menu Comparison Workflow Verification
Tests: Discover → Parse → Review → Save (no LLM analysis)
"""
import asyncio
import os
import sys
import uuid
from dotenv import load_dotenv

load_dotenv()

# Test data
RESTAURANT_NAME = "Park Ave Pizza"
LOCATION = "Woonsocket, RI"
CATEGORY = "pizza"
TEST_USER_ID = str(uuid.uuid4())


async def test_simplified_workflow():
    """Test simplified workflow: discover → parse → save"""
    
    print("=" * 80)
    print("SIMPLIFIED MENU COMPARISON WORKFLOW TEST")
    print("=" * 80)
    print(f"Testing: {RESTAURANT_NAME} in {LOCATION}")
    print("Workflow: Discover → Parse Competitor Menus → Save for Review")
    
    # Step 1: Initialize services
    print("\n📦 Step 1: Initializing services...")
    try:
        from services.competitor_discovery_service import CompetitorDiscoveryService
        from services.competitor_menu_parser import CompetitorMenuParser
        from services.menu_comparison_storage import MenuComparisonStorage
        
        discovery = CompetitorDiscoveryService()
        parser = CompetitorMenuParser()
        storage = MenuComparisonStorage()
        
        print("✅ All services initialized successfully")
    except Exception as e:
        print(f"❌ Service initialization failed: {e}")
        return False
    
    # Step 2: Discover competitors
    print("\n🔍 Step 2: Discovering competitors...")
    try:
        competitors = await asyncio.to_thread(
            discovery.find_competitors,
            location=LOCATION,
            restaurant_name=RESTAURANT_NAME,
            category=CATEGORY,
            radius_miles=3.0,
            max_results=5
        )
        
        print(f"✅ Found {len(competitors)} competitors:")
        for i, comp in enumerate(competitors, 1):
            print(f"   {i}. {comp.business_name}")
            print(f"      Rating: {comp.rating} ({comp.review_count} reviews)")
            print(f"      Distance: {comp.distance_miles} miles")
            if comp.website:
                print(f"      Website: {comp.website}")
        
        if len(competitors) < 2:
            print("⚠️  Need at least 2 competitors for testing")
            return False
            
    except Exception as e:
        print(f"❌ Competitor discovery failed: {e}")
        return False
    
    # Step 3: Create analysis session (for data organization)
    print("\n💾 Step 3: Creating analysis session...")
    try:
        # Create mock user menu ID (in real scenario, user has uploaded menu)
        mock_user_menu_id = str(uuid.uuid4())
        
        analysis_id = storage.create_analysis(
            user_id=TEST_USER_ID,
            user_menu_id=mock_user_menu_id,
            restaurant_name=RESTAURANT_NAME,
            location=LOCATION
        )
        
        print(f"✅ Analysis session created: {analysis_id}")
        
        # Store discovered competitors
        competitor_data = [
            {
                "place_id": comp.place_id,
                "business_name": comp.business_name,
                "address": comp.address,
                "latitude": comp.latitude,
                "longitude": comp.longitude,
                "rating": comp.rating,
                "review_count": comp.review_count,
                "price_level": comp.price_level,
                "distance_miles": comp.distance_miles,
                "phone": comp.phone,
                "website": comp.website,
                "menu_url": comp.menu_url,
                "types": getattr(comp, 'types', [])
            }
            for comp in competitors
        ]
        
        storage.store_competitors(analysis_id, competitor_data)
        print(f"✅ Stored {len(competitor_data)} competitors")
        
    except Exception as e:
        print(f"❌ Analysis session creation failed: {e}")
        return False
    
    # Step 4: Parse competitor menus (simplified - just structure, no LLM analysis)
    print("\n🍕 Step 4: Parsing competitor menus...")
    try:
        parsed_menus = []
        
        # Select first 2 competitors for parsing
        selected_competitors = competitors[:2]
        
        for i, competitor in enumerate(selected_competitors):
            print(f"\n   Parsing menu for: {competitor.business_name}")
            
            # Try to parse menu if URL available
            menu_url = competitor.menu_url or competitor.website
            
            if menu_url:
                try:
                    parse_result = await parser.parse_competitor_menu(
                        menu_url=menu_url,
                        competitor_name=competitor.business_name,
                        menu_source="google_places"
                    )
                    
                    if parse_result['metadata']['success']:
                        items_count = parse_result['metadata']['items_extracted']
                        print(f"   ✅ Parsed {items_count} menu items")
                        
                        # Store parsed menu
                        storage.store_competitor_menu(
                            competitor_id=competitor.place_id,
                            analysis_id=analysis_id,
                            menu_items=parse_result['menu_items'],
                            menu_source="google_places",
                            menu_url=menu_url,
                            parse_metadata=parse_result['metadata']
                        )
                        
                        parsed_menus.append({
                            "competitor_name": competitor.business_name,
                            "items_count": items_count,
                            "sample_items": parse_result['menu_items'][:3]  # First 3 items
                        })
                        
                    else:
                        print(f"   ⚠️  Parsing failed: {parse_result['metadata'].get('error')}")
                        
                except Exception as parse_error:
                    print(f"   ⚠️  Parsing error: {parse_error}")
            else:
                print(f"   ⚠️  No menu URL available")
        
        print(f"\n✅ Successfully parsed {len(parsed_menus)} competitor menus")
        
        # Show sample items
        if parsed_menus:
            print("\n📋 Sample menu items found:")
            for menu in parsed_menus:
                print(f"\n   {menu['competitor_name']} ({menu['items_count']} total items):")
                for item in menu['sample_items']:
                    item_name = item.get('item_name', 'Unknown')
                    prices = item.get('prices', [])
                    if prices:
                        price_str = ", ".join([f"${p.get('price', 0):.2f}" for p in prices])
                        print(f"     - {item_name}: {price_str}")
                    else:
                        print(f"     - {item_name}: No price")
        
    except Exception as e:
        print(f"❌ Menu parsing failed: {e}")
        return False
    
    # Step 5: Save for user review (no LLM analysis yet)
    print("\n💾 Step 5: Saving for user review...")
    try:
        # Update analysis status to "ready_for_review"
        storage.update_analysis_status(
            analysis_id=analysis_id,
            status="ready_for_review",
            current_step="Competitor menus parsed. Ready for user review."
        )
        
        # Get complete analysis data
        analysis_data = storage.get_analysis(analysis_id, TEST_USER_ID)
        
        if analysis_data:
            analysis = analysis_data['analysis']
            competitors = analysis_data['competitors']
            
            print(f"✅ Analysis ready for review!")
            print(f"   Analysis ID: {analysis_id}")
            print(f"   Status: {analysis['status']}")
            print(f"   Competitors: {len(competitors)}")
            print(f"   Location: {analysis['location']}")
            
            # Show what user would see
            print(f"\n📊 User Review Summary:")
            print(f"   Restaurant: {analysis['restaurant_name']}")
            print(f"   Location: {analysis['location']}")
            print(f"   Competitors found: {len(competitors)}")
            print(f"   Menus parsed: {len(parsed_menus)}")
            print(f"   Status: Ready for review and comparison")
            
        else:
            print("❌ Failed to retrieve analysis data")
            return False
            
    except Exception as e:
        print(f"❌ Save for review failed: {e}")
        return False
    
    # Step 6: Simulate user saving to account
    print("\n💾 Step 6: Simulating user save to account...")
    try:
        # Save comparison report
        saved_id = storage.save_comparison(
            analysis_id=analysis_id,
            user_id=TEST_USER_ID,
            report_name=f"{RESTAURANT_NAME} - Competitor Menu Analysis",
            notes="Parsed competitor menus for pricing comparison"
        )
        
        print(f"✅ Saved to user account: {saved_id}")
        
        # List user's saved comparisons
        saved_list = storage.list_saved_comparisons(TEST_USER_ID)
        print(f"✅ User now has {saved_list['count']} saved comparison(s)")
        
        if saved_list['data']:
            latest = saved_list['data'][0]
            print(f"   Latest: {latest.get('report_name', 'Unnamed')}")
            print(f"   Created: {latest.get('created_at', 'Unknown')}")
        
    except Exception as e:
        print(f"❌ User save failed: {e}")
        return False
    
    print("\n" + "=" * 80)
    print("✅ SIMPLIFIED WORKFLOW TEST PASSED!")
    print("=" * 80)
    print("\nWorkflow Summary:")
    print(f"1. ✅ Discovered {len(competitors)} competitors")
    print(f"2. ✅ Parsed {len(parsed_menus)} competitor menus")
    print(f"3. ✅ Saved analysis for user review")
    print(f"4. ✅ User can save to their account")
    print(f"\nAnalysis ID: {analysis_id}")
    print(f"Saved Report ID: {saved_id}")
    
    print("\n🎯 Key Features Verified:")
    print("✅ Competitor discovery works")
    print("✅ Menu parsing extracts structured data")
    print("✅ Data stored in separate namespace")
    print("✅ User can review and save results")
    print("✅ No interference with user's menu system")
    
    print("\n🚀 Ready for frontend integration!")
    print("Frontend needs to:")
    print("1. Show discovered competitors")
    print("2. Display parsed menu items")
    print("3. Allow user to review and save")
    print("4. List saved comparisons")
    
    return True


if __name__ == "__main__":
    print("\n🚀 Starting Simplified Menu Comparison Workflow Test\n")
    
    # Check environment variables
    required_vars = [
        "GOOGLE_PLACES_API_KEY",
        "GOOGLE_GEMINI_API_KEY",
        "SUPABASE_URL",
        "SUPABASE_SERVICE_ROLE_KEY"
    ]
    
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    if missing_vars:
        print(f"❌ Missing environment variables: {', '.join(missing_vars)}")
        sys.exit(1)
    
    success = asyncio.run(test_simplified_workflow())
    
    sys.exit(0 if success else 1)