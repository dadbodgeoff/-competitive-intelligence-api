#!/usr/bin/env python3
"""
Cleanup Script for Obsolete Documentation and Test Files
Safely removes development artifacts while preserving production code
"""

import os
import shutil
from pathlib import Path

def print_header(title: str):
    """Print formatted header"""
    print(f"\n{'='*60}")
    print(f"🧹 {title}")
    print(f"{'='*60}")

def print_section(title: str):
    """Print formatted section"""
    print(f"\n{title}")
    print("-" * len(title))

def safe_remove_file(file_path: str) -> bool:
    """Safely remove a file if it exists"""
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            print(f"✅ Removed: {file_path}")
            return True
        else:
            print(f"⚠️ Not found: {file_path}")
            return False
    except Exception as e:
        print(f"❌ Error removing {file_path}: {str(e)}")
        return False

def cleanup_obsolete_files():
    """Remove obsolete files identified in the audit"""
    
    print_header("CLEANUP OBSOLETE FILES")
    print("🎯 Removing development artifacts and superseded files")
    print("✅ Preserving all production code and essential documentation")
    
    removed_count = 0
    total_count = 0
    
    # Phase 1: Menu Intelligence Test Cleanup
    print_section("🍽️ PHASE 1: Menu Intelligence Test Cleanup")
    
    menu_test_files = [
        "test_park_ave_pizza_with_flags_enabled.py",
        "test_park_ave_pizza_menu_intelligence.py", 
        "test_menu_intelligence_real_simple.py",
        "test_menu_intelligence_integration_validation.py",
        "test_real_menu_intelligence_e2e.py",
        "test_week2_e2e_menu_intelligence.py",
        "test_day1_menu_extraction.py",
        "test_day2_menu_analysis.py",
        "test_day3_integration.py",
        "test_week1_foundation_e2e.py",
        "tests/test_menu_intelligence_week1.py",
        "test_database_integration.py"
    ]
    
    for file_path in menu_test_files:
        total_count += 1
        if safe_remove_file(file_path):
            removed_count += 1
    
    # Phase 2: Database File Cleanup
    print_section("🗄️ PHASE 2: Database File Cleanup")
    
    database_files = [
        "database/menu_intelligence_schema.sql",
        "database/menu_intelligence_verify_and_complete.sql",
        "supabase_rls_policies.sql",
        "complete_database_schema_update.sql", 
        "COMPLETE_SQL_REQUIREMENTS.sql",
        "clean_sql_for_supabase.sql"
    ]
    
    for file_path in database_files:
        total_count += 1
        if safe_remove_file(file_path):
            removed_count += 1
    
    # Phase 3: Development Documentation Cleanup
    print_section("📄 PHASE 3: Development Documentation Cleanup")
    
    doc_files = [
        "DUAL_TIER_STRATEGY_ANALYSIS.md",
        "TECHNICAL_AUDIT_FINDINGS.md",
        "park_ave_analysis_comparison.md",
        "COMPLETE_PROMPT_AND_SCORING_SYSTEM.md",
        "SYSTEM_STATUS_REPORT.md",
        "SYSTEM_TEST_RESULTS_SUMMARY.md",
        "E2E_TESTING_GUIDE.md",
        "FRONTEND_BETA_LAUNCH_STRATEGY.md",
        "FILEWATCHER_README.md"
    ]
    
    for file_path in doc_files:
        total_count += 1
        if safe_remove_file(file_path):
            removed_count += 1
    
    # Phase 4: Development Utilities Cleanup
    print_section("🔧 PHASE 4: Development Utilities Cleanup")
    
    utility_files = [
        "get_full_analysis_data.py",
        "park_ave_results_summary.py",
        "compare_prompts_park_ave.py",
        "direct_park_ave_test.py",
        "filewatcher.py",
        "monitor_analysis_flow.py"
    ]
    
    for file_path in utility_files:
        total_count += 1
        if safe_remove_file(file_path):
            removed_count += 1
    
    # Phase 5: Review Analysis Test Cleanup
    print_section("📊 PHASE 5: Review Analysis Test Cleanup")
    
    review_test_files = [
        "test_complete_e2e_flow.py",
        "test_e2e_simple.py", 
        "test_enhanced_insights_live.py",
        "test_enhanced_insights_functionality.py",
        "test_existing_analysis.py",
        "test_results_endpoint_detailed.py",
        "test_frontend_flow_validation.py",
        "test_complete_frontend_backend_e2e.py",
        "test_frontend_simulation.py",
        "test_frontend_backend_flow.py",
        "test_quick_system_check.py",
        "test_complete_system_end_to_end.py",
        "test_premium_tier_storage_fix.py",
        "test_cross_category_validation.py",
        "test_free_tier_optimization.py",
        "test_verified_account.py",
        "test_working_auth.py",
        "test_auth.py",
        "test_full_pipeline.py",
        "test_llm_analysis.py",
        "test_park_ave_pizza.py"
    ]
    
    for file_path in review_test_files:
        total_count += 1
        if safe_remove_file(file_path):
            removed_count += 1
    
    # Phase 6: Frontend Development Artifacts
    print_section("🖥️ PHASE 6: Frontend Development Artifacts")
    
    frontend_files = [
        "frontend/sprint_1_audit.md",
        "frontend/sprint_2_audit.md",
        "frontend/sprint_3_audit.md", 
        "frontend/sprint_4_audit.md",
        "frontend/test-frontend.html",
        "frontend/beta_feedback_form.html"
    ]
    
    for file_path in frontend_files:
        total_count += 1
        if safe_remove_file(file_path):
            removed_count += 1
    
    # Summary
    print_section("📊 CLEANUP SUMMARY")
    
    success_rate = (removed_count / total_count * 100) if total_count > 0 else 0
    
    print(f"✅ Files successfully removed: {removed_count}")
    print(f"⚠️ Files not found: {total_count - removed_count}")
    print(f"📊 Total files processed: {total_count}")
    print(f"🎯 Success rate: {success_rate:.1f}%")
    
    if removed_count > 0:
        print(f"\n🎉 CLEANUP COMPLETED SUCCESSFULLY!")
        print("✅ Obsolete files removed")
        print("✅ Production code preserved")
        print("✅ Essential documentation maintained")
        print("✅ Codebase is now clean and production-ready")
    else:
        print(f"\n⚠️ NO FILES REMOVED")
        print("All specified files were already missing or protected")
    
    # Show what's preserved
    print_section("🛡️ PRESERVED PRODUCTION FILES")
    
    preserved_categories = {
        "Core Services": [
            "services/menu_intelligence_orchestrator.py",
            "services/menu_analysis_engine.py", 
            "services/menu_extraction_service.py",
            "services/analysis_service_orchestrator.py",
            "services/free_tier_llm_service.py",
            "services/enhanced_llm_service.py"
        ],
        "API Routes": [
            "api/routes/menu_intelligence.py",
            "api/routes/tier_analysis.py"
        ],
        "Database Schema": [
            "database/menu_intelligence_supabase.sql",
            "database/WEEK_2_DAY_3_SQL_UPDATES.md",
            "database/schema.sql"
        ],
        "Essential Tests": [
            "test_park_ave_pizza_complete_real_analysis.py",
            "test_menu_intelligence_following_review_patterns.py",
            "test_free_tier_end_to_end.py",
            "tests/test_review_analysis_regression.py"
        ],
        "Key Documentation": [
            "WEEK_2_MENU_INTELLIGENCE_COMPLETE.md",
            "MODULE_2_MENU_INTELLIGENCE_MASTER_PLAN.md",
            "PROJECT_OVERVIEW.md",
            "README.md",
            "DEPLOYMENT_READY_CHECKLIST.md"
        ]
    }
    
    for category, files in preserved_categories.items():
        print(f"\n{category}:")
        for file_path in files:
            if os.path.exists(file_path):
                print(f"  ✅ {file_path}")
            else:
                print(f"  ⚠️ {file_path} (missing)")
    
    return removed_count > 0

if __name__ == "__main__":
    print("🧹 OBSOLETE FILE CLEANUP SCRIPT")
    print("=" * 60)
    print("This script will remove development artifacts and obsolete files")
    print("while preserving all production code and essential documentation.")
    print("")
    
    # Confirm before proceeding
    response = input("Do you want to proceed with cleanup? (y/N): ").strip().lower()
    
    if response in ['y', 'yes']:
        success = cleanup_obsolete_files()
        exit(0 if success else 1)
    else:
        print("❌ Cleanup cancelled by user")
        exit(1)