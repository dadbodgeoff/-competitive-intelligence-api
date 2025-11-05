#!/usr/bin/env python3
"""
Seed Analytics Test Data
Creates realistic invoice data with price variations to test the analytics dashboard
"""
import os
import sys
from datetime import datetime, timedelta
from decimal import Decimal
import random
from supabase import create_client, Client

# Get Supabase credentials
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Test user ID (replace with your actual user ID)
USER_ID = "455a0c46-b694-44e8-ab1c-ee36342037cf"

# Vendors with different pricing patterns
VENDORS = [
    {"name": "Sysco", "price_multiplier": 1.0, "reliability": 0.95},
    {"name": "US Foods", "price_multiplier": 0.98, "reliability": 0.90},
    {"name": "Restaurant Depot", "price_multiplier": 0.92, "reliability": 0.85},
    {"name": "Gordon Food Service", "price_multiplier": 1.02, "reliability": 0.93},
]

# Common restaurant items with base prices and price volatility
ITEMS = [
    # Proteins
    {"name": "Chicken Breast, Boneless Skinless", "unit": "LB", "base_price": 3.50, "volatility": 0.15},
    {"name": "Ground Beef 80/20", "unit": "LB", "base_price": 4.25, "volatility": 0.20},
    {"name": "Salmon Fillet, Fresh", "unit": "LB", "base_price": 12.50, "volatility": 0.25},
    {"name": "Pork Tenderloin", "unit": "LB", "base_price": 5.75, "volatility": 0.12},
    {"name": "Shrimp 16/20 ct", "unit": "LB", "base_price": 9.50, "volatility": 0.30},
    
    # Produce
    {"name": "Tomatoes, Roma", "unit": "LB", "base_price": 1.85, "volatility": 0.35},
    {"name": "Lettuce, Iceberg", "unit": "CASE", "base_price": 24.00, "volatility": 0.40},
    {"name": "Onions, Yellow", "unit": "LB", "base_price": 0.65, "volatility": 0.25},
    {"name": "Potatoes, Russet", "unit": "LB", "base_price": 0.55, "volatility": 0.20},
    {"name": "Bell Peppers, Mixed", "unit": "LB", "base_price": 2.25, "volatility": 0.30},
    
    # Dairy
    {"name": "Butter, Unsalted", "unit": "LB", "base_price": 4.50, "volatility": 0.18},
    {"name": "Milk, Whole", "unit": "GAL", "base_price": 3.75, "volatility": 0.15},
    {"name": "Cheese, Mozzarella Shredded", "unit": "LB", "base_price": 3.25, "volatility": 0.12},
    {"name": "Heavy Cream", "unit": "QT", "base_price": 5.50, "volatility": 0.10},
    
    # Dry Goods
    {"name": "Flour, All Purpose", "unit": "LB", "base_price": 0.45, "volatility": 0.08},
    {"name": "Sugar, Granulated", "unit": "LB", "base_price": 0.55, "volatility": 0.10},
    {"name": "Rice, Long Grain", "unit": "LB", "base_price": 0.75, "volatility": 0.12},
    {"name": "Pasta, Penne", "unit": "LB", "base_price": 1.25, "volatility": 0.08},
    
    # Oils & Condiments
    {"name": "Olive Oil, Extra Virgin", "unit": "GAL", "base_price": 32.00, "volatility": 0.15},
    {"name": "Vegetable Oil", "unit": "GAL", "base_price": 18.00, "volatility": 0.20},
    {"name": "Ketchup", "unit": "GAL", "base_price": 12.50, "volatility": 0.05},
    {"name": "Mayonnaise", "unit": "GAL", "base_price": 14.00, "volatility": 0.08},
]


def generate_price_with_trend(base_price: float, volatility: float, days_ago: int, trend: str = "stable") -> float:
    """Generate a price with realistic variation and optional trend"""
    # Base random variation
    variation = random.uniform(-volatility, volatility)
    price = base_price * (1 + variation)
    
    # Add trend over time
    if trend == "increasing":
        # Price increases over time (older = cheaper)
        trend_factor = 1 + (days_ago / 365) * 0.15  # 15% increase over a year
        price = price / trend_factor
    elif trend == "decreasing":
        # Price decreases over time (older = more expensive)
        trend_factor = 1 - (days_ago / 365) * 0.10  # 10% decrease over a year
        price = price / trend_factor
    elif trend == "spike":
        # Recent spike
        if days_ago < 14:
            price = price * 1.35  # 35% spike
    elif trend == "drop":
        # Recent drop
        if days_ago < 14:
            price = price * 0.70  # 30% drop
    
    return round(price, 2)


def create_invoice(vendor: dict, invoice_date: datetime, invoice_number: str):
    """Create an invoice with line items"""
    print(f"  📄 Creating invoice {invoice_number} from {vendor['name']} on {invoice_date.date()}")
    
    # Create invoice
    invoice_data = {
        "user_id": USER_ID,
        "vendor_name": vendor["name"],
        "invoice_number": invoice_number,
        "invoice_date": invoice_date.isoformat(),
        "total_amount": 0,  # Will update after items
        "status": "completed",
        "file_hash": f"test_hash_{invoice_number}",
    }
    
    invoice_result = supabase.table("invoices").insert(invoice_data).execute()
    invoice_id = invoice_result.data[0]["id"]
    
    # Select 8-15 random items for this invoice
    num_items = random.randint(8, 15)
    selected_items = random.sample(ITEMS, num_items)
    
    total_amount = Decimal("0.00")
    days_ago = (datetime.now() - invoice_date).days
    
    line_items = []
    for item in selected_items:
        quantity = random.randint(5, 50)
        
        # Determine if this item has a trend
        trend = "stable"
        if item["name"] in ["Tomatoes, Roma", "Lettuce, Iceberg"]:
            trend = "increasing"  # Produce prices rising
        elif item["name"] in ["Chicken Breast, Boneless Skinless"]:
            trend = "decreasing"  # Chicken prices falling
        elif item["name"] == "Ground Beef 80/20" and days_ago < 14:
            trend = "spike"  # Recent beef price spike
        elif item["name"] == "Salmon Fillet, Fresh" and days_ago < 14:
            trend = "drop"  # Recent salmon price drop
        
        unit_price = generate_price_with_trend(
            item["base_price"] * vendor["price_multiplier"],
            item["volatility"],
            days_ago,
            trend
        )
        
        extended_price = Decimal(str(unit_price)) * Decimal(str(quantity))
        total_amount += extended_price
        
        line_items.append({
            "invoice_id": invoice_id,
            "user_id": USER_ID,
            "vendor_item_code": f"{vendor['name'][:3].upper()}-{random.randint(1000, 9999)}",
            "description": item["name"],
            "quantity": quantity,
            "unit_of_measure": item["unit"],
            "unit_price": float(unit_price),
            "extended_price": float(extended_price),
            "matched_inventory_id": None,
        })
    
    # Insert line items
    if line_items:
        supabase.table("invoice_line_items").insert(line_items).execute()
    
    # Update invoice total
    supabase.table("invoices").update({
        "total_amount": float(total_amount)
    }).eq("id", invoice_id).execute()
    
    print(f"    ✅ Created {len(line_items)} line items, total: ${total_amount:.2f}")
    
    return invoice_id


def seed_data():
    """Seed test data for analytics"""
    print("\n" + "="*70)
    print("🌱 SEEDING ANALYTICS TEST DATA")
    print("="*70 + "\n")
    
    print(f"👤 User ID: {USER_ID}")
    print(f"📦 Items to track: {len(ITEMS)}")
    print(f"🏪 Vendors: {len(VENDORS)}")
    print()
    
    # Generate invoices over the past 120 days
    # More frequent recent invoices, less frequent older ones
    invoice_count = 0
    
    # Last 30 days: 2-3 invoices per week (8-12 invoices)
    print("📅 Generating recent invoices (last 30 days)...")
    for week in range(4):
        num_invoices = random.randint(2, 3)
        for _ in range(num_invoices):
            days_ago = random.randint(week * 7, (week + 1) * 7)
            invoice_date = datetime.now() - timedelta(days=days_ago)
            vendor = random.choice(VENDORS)
            invoice_number = f"INV-{invoice_date.strftime('%Y%m%d')}-{random.randint(1000, 9999)}"
            
            create_invoice(vendor, invoice_date, invoice_number)
            invoice_count += 1
    
    # 31-90 days: 1-2 invoices per week (8-12 invoices)
    print("\n📅 Generating mid-range invoices (31-90 days ago)...")
    for week in range(4, 13):
        num_invoices = random.randint(1, 2)
        for _ in range(num_invoices):
            days_ago = random.randint(week * 7, (week + 1) * 7)
            invoice_date = datetime.now() - timedelta(days=days_ago)
            vendor = random.choice(VENDORS)
            invoice_number = f"INV-{invoice_date.strftime('%Y%m%d')}-{random.randint(1000, 9999)}"
            
            create_invoice(vendor, invoice_date, invoice_number)
            invoice_count += 1
    
    # 91-120 days: 1 invoice per week (4-5 invoices)
    print("\n📅 Generating older invoices (91-120 days ago)...")
    for week in range(13, 17):
        days_ago = random.randint(week * 7, min((week + 1) * 7, 120))
        invoice_date = datetime.now() - timedelta(days=days_ago)
        vendor = random.choice(VENDORS)
        invoice_number = f"INV-{invoice_date.strftime('%Y%m%d')}-{random.randint(1000, 9999)}"
        
        create_invoice(vendor, invoice_date, invoice_number)
        invoice_count += 1
    
    print("\n" + "="*70)
    print(f"✅ SEEDING COMPLETE")
    print("="*70)
    print(f"\n📊 Summary:")
    print(f"  • Total invoices created: {invoice_count}")
    print(f"  • Estimated line items: {invoice_count * 12} (avg)")
    print(f"  • Date range: {120} days")
    print(f"  • Unique items: {len(ITEMS)}")
    print()
    print("🎯 Expected Analytics Features:")
    print("  ✓ Price trends over time")
    print("  ✓ Vendor price comparisons")
    print("  ✓ Savings opportunities (Restaurant Depot is cheapest)")
    print("  ✓ Price anomalies (beef spike, salmon drop)")
    print("  ✓ Increasing prices (produce)")
    print("  ✓ Decreasing prices (chicken)")
    print()
    print("🌐 View at: http://localhost:5173/analytics")
    print()


if __name__ == "__main__":
    try:
        seed_data()
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
