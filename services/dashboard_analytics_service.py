"""
Dashboard Analytics Service
Provides aggregated metrics for dashboard widgets
STRICT RULE: All data pulled from invoice_items (read-only source of truth)
"""
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from decimal import Decimal
from collections import defaultdict
import statistics
import logging
from supabase import Client

logger = logging.getLogger(__name__)


class DashboardAnalyticsService:
    """
    Dashboard analytics that queries invoice_items directly
    Single source of truth for all invoice/pricing data
    """
    
    def __init__(self, supabase_client: Client):
        self.supabase = supabase_client
    
    def get_monthly_summary(self, user_id: str) -> Dict:
        """
        Get current month vs last month spending comparison
        
        Returns:
            {
                "current_month_spend": 12450.00,
                "last_month_spend": 11200.00,
                "change_percent": 11.2,
                "change_amount": 1250.00,
                "current_month_items": 145,
                "last_month_items": 132,
                "avg_item_cost_current": 85.86,
                "avg_item_cost_last": 84.85
            }
        """
        now = datetime.now()
        
        # Current month dates
        current_month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        # Last month dates
        if now.month == 1:
            last_month_start = current_month_start.replace(year=now.year - 1, month=12)
        else:
            last_month_start = current_month_start.replace(month=now.month - 1)
        
        # Get current month data
        current_result = self.supabase.table('invoice_items')\
            .select('extended_price, invoices!inner(user_id, invoice_date)')\
            .eq('invoices.user_id', user_id)\
            .gte('invoices.invoice_date', current_month_start.date().isoformat())\
            .execute()
        
        # Get last month data
        last_result = self.supabase.table('invoice_items')\
            .select('extended_price, invoices!inner(user_id, invoice_date)')\
            .eq('invoices.user_id', user_id)\
            .gte('invoices.invoice_date', last_month_start.date().isoformat())\
            .lt('invoices.invoice_date', current_month_start.date().isoformat())\
            .execute()
        
        # Calculate current month metrics
        current_spend = sum(float(Decimal(str(item['extended_price']))) for item in current_result.data)
        current_count = len(current_result.data)
        avg_current = current_spend / current_count if current_count > 0 else 0
        
        # Calculate last month metrics
        last_spend = sum(float(Decimal(str(item['extended_price']))) for item in last_result.data)
        last_count = len(last_result.data)
        avg_last = last_spend / last_count if last_count > 0 else 0
        
        # Calculate change
        change_amount = current_spend - last_spend
        change_percent = ((current_spend - last_spend) / last_spend * 100) if last_spend > 0 else 0
        
        return {
            "current_month_spend": round(current_spend, 2),
            "last_month_spend": round(last_spend, 2),
            "change_percent": round(change_percent, 2),
            "change_amount": round(change_amount, 2),
            "current_month_items": current_count,
            "last_month_items": last_count,
            "avg_item_cost_current": round(avg_current, 2),
            "avg_item_cost_last": round(avg_last, 2)
        }
    
    def get_top_ordered_items(
        self,
        user_id: str,
        days: int = 30,
        limit: int = 10
    ) -> List[Dict]:
        """
        Get most frequently ordered items
        
        Returns:
            [
                {
                    "description": "RANRNCH BEEF PATTY 2/1 RND SPECIA",
                    "order_frequency": 12,
                    "total_quantity": 96.0,
                    "total_cost": 6786.00,
                    "avg_unit_price": 56.55,
                    "last_ordered": "2025-10-20"
                }
            ]
        """
        cutoff_date = (datetime.now() - timedelta(days=days)).date()
        
        result = self.supabase.table('invoice_items')\
            .select('description, quantity, unit_price, extended_price, invoices!inner(user_id, invoice_date)')\
            .eq('invoices.user_id', user_id)\
            .gte('invoices.invoice_date', cutoff_date.isoformat())\
            .execute()
        
        # Group by normalized description
        items_data = defaultdict(lambda: {
            'orders': [],
            'total_quantity': 0,
            'total_cost': 0,
            'prices': [],
            'dates': []
        })
        
        for item in result.data:
            desc = item['description'].strip()
            items_data[desc]['orders'].append(item)
            items_data[desc]['total_quantity'] += float(Decimal(str(item['quantity'])))
            items_data[desc]['total_cost'] += float(Decimal(str(item['extended_price'])))
            items_data[desc]['prices'].append(float(Decimal(str(item['unit_price']))))
            items_data[desc]['dates'].append(item['invoices']['invoice_date'])
        
        # Build result list
        top_items = []
        for desc, data in items_data.items():
            top_items.append({
                "description": desc,
                "order_frequency": len(data['orders']),
                "total_quantity": round(data['total_quantity'], 2),
                "total_cost": round(data['total_cost'], 2),
                "avg_unit_price": round(statistics.mean(data['prices']), 2),
                "last_ordered": max(data['dates'])
            })
        
        # Sort by order frequency
        top_items.sort(key=lambda x: x['order_frequency'], reverse=True)
        
        return top_items[:limit]
    
    def get_fastest_rising_costs(
        self,
        user_id: str,
        days: int = 30,
        limit: int = 10
    ) -> List[Dict]:
        """
        Get items with steepest price increases
        
        Returns:
            [
                {
                    "description": "RANRNCH BEEF PATTY 2/1 RND SPECIA",
                    "price_30_days_ago": 52.00,
                    "current_price": 56.55,
                    "price_increase": 4.55,
                    "increase_percent": 8.75,
                    "last_ordered": "2025-10-20"
                }
            ]
        """
        cutoff_date = (datetime.now() - timedelta(days=days)).date()
        
        result = self.supabase.table('invoice_items')\
            .select('description, unit_price, invoices!inner(user_id, invoice_date)')\
            .eq('invoices.user_id', user_id)\
            .gte('invoices.invoice_date', cutoff_date.isoformat())\
            .execute()
        
        # Group by description and track price changes
        items_data = defaultdict(list)
        for item in result.data:
            desc = item['description'].strip()
            items_data[desc].append({
                'price': float(Decimal(str(item['unit_price']))),
                'date': item['invoices']['invoice_date']
            })
        
        # Calculate price changes
        rising_costs = []
        for desc, prices in items_data.items():
            if len(prices) < 2:
                continue
            
            # Sort by date
            prices.sort(key=lambda x: x['date'])
            
            oldest_price = prices[0]['price']
            newest_price = prices[-1]['price']
            
            if oldest_price > 0:
                price_increase = newest_price - oldest_price
                increase_percent = (price_increase / oldest_price) * 100
                
                # Only include increases
                if increase_percent > 0:
                    rising_costs.append({
                        "description": desc,
                        "price_30_days_ago": round(oldest_price, 2),
                        "current_price": round(newest_price, 2),
                        "price_increase": round(price_increase, 2),
                        "increase_percent": round(increase_percent, 2),
                        "last_ordered": prices[-1]['date']
                    })
        
        # Sort by increase percent
        rising_costs.sort(key=lambda x: x['increase_percent'], reverse=True)
        
        return rising_costs[:limit]
    
    def get_vendor_scorecard(
        self,
        user_id: str,
        days: int = 90
    ) -> Dict:
        """
        Get vendor performance metrics
        
        Returns:
            {
                "most_used": [
                    {"vendor": "PERFORMANCE FOODSERVICE", "order_count": 45, "total_spend": 8500.00}
                ],
                "highest_spend": [...],
                "avg_order_value": [...]
            }
        """
        cutoff_date = (datetime.now() - timedelta(days=days)).date()
        
        result = self.supabase.table('invoice_items')\
            .select('extended_price, invoices!inner(user_id, vendor_name, invoice_date, invoice_number)')\
            .eq('invoices.user_id', user_id)\
            .gte('invoices.invoice_date', cutoff_date.isoformat())\
            .execute()
        
        # Group by vendor
        vendor_data = defaultdict(lambda: {
            'invoices': set(),
            'total_spend': 0,
            'item_count': 0
        })
        
        for item in result.data:
            vendor = item['invoices']['vendor_name']
            vendor_data[vendor]['invoices'].add(item['invoices']['invoice_number'])
            vendor_data[vendor]['total_spend'] += float(Decimal(str(item['extended_price'])))
            vendor_data[vendor]['item_count'] += 1
        
        # Build vendor lists
        most_used = []
        highest_spend = []
        avg_order_value = []
        
        for vendor, data in vendor_data.items():
            order_count = len(data['invoices'])
            total_spend = data['total_spend']
            avg_value = total_spend / order_count if order_count > 0 else 0
            
            most_used.append({
                "vendor": vendor,
                "order_count": order_count,
                "total_spend": round(total_spend, 2)
            })
            
            highest_spend.append({
                "vendor": vendor,
                "total_spend": round(total_spend, 2),
                "order_count": order_count
            })
            
            avg_order_value.append({
                "vendor": vendor,
                "avg_order_value": round(avg_value, 2),
                "order_count": order_count
            })
        
        # Sort lists
        most_used.sort(key=lambda x: x['order_count'], reverse=True)
        highest_spend.sort(key=lambda x: x['total_spend'], reverse=True)
        avg_order_value.sort(key=lambda x: x['avg_order_value'], reverse=True)
        
        return {
            "most_used": most_used[:5],
            "highest_spend": highest_spend[:5],
            "avg_order_value": avg_order_value[:5],
            "total_vendors": len(vendor_data)
        }
    
    def get_spending_by_category(
        self,
        user_id: str,
        days: int = 30
    ) -> List[Dict]:
        """
        Get spending breakdown by item category (inferred from description)
        
        Returns:
            [
                {"category": "Proteins", "total_spend": 4500.00, "item_count": 45},
                {"category": "Produce", "total_spend": 2300.00, "item_count": 67}
            ]
        """
        cutoff_date = (datetime.now() - timedelta(days=days)).date()
        
        result = self.supabase.table('invoice_items')\
            .select('description, extended_price, invoices!inner(user_id, invoice_date)')\
            .eq('invoices.user_id', user_id)\
            .gte('invoices.invoice_date', cutoff_date.isoformat())\
            .execute()
        
        # Simple category inference from keywords
        category_keywords = {
            'Proteins': ['beef', 'chicken', 'pork', 'fish', 'haddock', 'patty', 'meat'],
            'Produce': ['lettuce', 'tomato', 'onion', 'pepper', 'vegetable'],
            'Dairy': ['cheese', 'milk', 'cream', 'butter'],
            'Frozen': ['fries', 'frozen'],
            'Dry Goods': ['flour', 'sugar', 'rice', 'pasta'],
            'Beverages': ['soda', 'juice', 'water', 'drink'],
            'Supplies': ['cleaner', 'liner', 'bag', 'glove', 'towel'],
            'Sauces': ['sauce', 'dressing', 'ketchup', 'mayo']
        }
        
        category_data = defaultdict(lambda: {'total_spend': 0, 'item_count': 0})
        
        for item in result.data:
            desc_lower = item['description'].lower()
            extended_price = float(Decimal(str(item['extended_price'])))
            
            # Find matching category
            matched_category = 'Other'
            for category, keywords in category_keywords.items():
                if any(keyword in desc_lower for keyword in keywords):
                    matched_category = category
                    break
            
            category_data[matched_category]['total_spend'] += extended_price
            category_data[matched_category]['item_count'] += 1
        
        # Build result list
        categories = []
        for category, data in category_data.items():
            categories.append({
                "category": category,
                "total_spend": round(data['total_spend'], 2),
                "item_count": data['item_count']
            })
        
        # Sort by spend
        categories.sort(key=lambda x: x['total_spend'], reverse=True)
        
        return categories
    
    def get_weekly_trend(
        self,
        user_id: str,
        weeks: int = 8
    ) -> List[Dict]:
        """
        Get weekly spending trend for charting
        
        Returns:
            [
                {"week_start": "2025-09-01", "total_spend": 2450.00, "item_count": 45},
                {"week_start": "2025-09-08", "total_spend": 2680.00, "item_count": 52}
            ]
        """
        cutoff_date = (datetime.now() - timedelta(weeks=weeks)).date()
        
        result = self.supabase.table('invoice_items')\
            .select('extended_price, invoices!inner(user_id, invoice_date)')\
            .eq('invoices.user_id', user_id)\
            .gte('invoices.invoice_date', cutoff_date.isoformat())\
            .execute()
        
        # Group by week
        weekly_data = defaultdict(lambda: {'total_spend': 0, 'item_count': 0})
        
        for item in result.data:
            invoice_date = datetime.fromisoformat(item['invoices']['invoice_date'])
            # Get Monday of that week
            week_start = invoice_date - timedelta(days=invoice_date.weekday())
            week_key = week_start.date().isoformat()
            
            weekly_data[week_key]['total_spend'] += float(Decimal(str(item['extended_price'])))
            weekly_data[week_key]['item_count'] += 1
        
        # Build result list
        weekly_trend = []
        for week_start, data in weekly_data.items():
            weekly_trend.append({
                "week_start": week_start,
                "total_spend": round(data['total_spend'], 2),
                "item_count": data['item_count']
            })
        
        # Sort by date
        weekly_trend.sort(key=lambda x: x['week_start'])
        
        return weekly_trend
