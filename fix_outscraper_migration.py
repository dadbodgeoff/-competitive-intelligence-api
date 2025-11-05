#!/usr/bin/env python3
"""
Quick Fix Script for Outscraper Migration
Installs outscraper package and updates requirements.txt
"""
import subprocess
import sys

def main():
    print("🔧 OUTSCRAPER MIGRATION FIX SCRIPT")
    print("=" * 60)
    
    # Step 1: Install outscraper package
    print("\n📦 Step 1: Installing outscraper package...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "outscraper==0.2.0"])
        print("✅ outscraper package installed successfully")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install outscraper: {e}")
        return False
    
    # Step 2: Update requirements.txt
    print("\n📝 Step 2: Updating requirements.txt...")
    try:
        with open("requirements.txt", "r") as f:
            requirements = f.read()
        
        if "outscraper" not in requirements:
            with open("requirements.txt", "a") as f:
                f.write("\noutscraper==0.2.0\n")
            print("✅ requirements.txt updated")
        else:
            print("ℹ️  outscraper already in requirements.txt")
    except Exception as e:
        print(f"❌ Failed to update requirements.txt: {e}")
        return False
    
    # Step 3: Verify installation
    print("\n🧪 Step 3: Verifying installation...")
    try:
        import outscraper
        print("✅ outscraper imports successfully")
        
        from services.outscraper_service import OutscraperService
        print("✅ OutscraperService imports successfully")
        
        from api.routes.tier_analysis import router
        print("✅ tier_analysis imports successfully")
        
    except ImportError as e:
        print(f"❌ Import verification failed: {e}")
        return False
    
    print("\n" + "=" * 60)
    print("✅ MIGRATION FIX COMPLETE!")
    print("\n🎯 Next Steps:")
    print("1. Run: python test_outscraper_end_to_end.py")
    print("2. Verify 100 reviews per competitor")
    print("3. Verify 35 reviews selected for LLM")
    print("4. Verify insights generated with evidence")
    print("\n💰 Expected Cost: ~$0.22 per premium analysis")
    print("=" * 60)
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
