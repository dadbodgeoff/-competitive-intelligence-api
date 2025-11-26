"""
Invoice Analytics Service
Provides aggregated metrics for invoice dashboard
STRICT RULE: All data pulled from invoice_items (read-only source of truth)
"""
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from decimal import Decimal
from collections import defaultdict
import logging
from supabase import Client

logger = logging.getLogger(__name__)


class InvoiceAnalyticsService:
    """
    Invoice analytics that queries invoice_items directly
    Single source of truth for all invoice/pricing data
    Uses account_id for multi-tenant data isolation
    """
    
    def __init__(self, supabase_client: Client):
        self.supabase = supabase_client
    
    def get_dashboard_summary(self, account_id: str, days_back: int = 90) -> Dict:
        """
        Get invoice dashboard summary metrics
        
        Returns:
            {
                "total_spend": 45230.00,
                "invoice_count": 127,
                "vendor_count": 8,
                "avg_order_value": 356.14,
                "spend_change_percent": 12.3,
                "invoice_change": 5,
                "items_tracked": 234
            }
        """
        cutoff_date = (datetime.now() - timedelta(days=days_back)).date()
        prev_cutoff = (datetime.now() - timedelta(days=days_back * 2)).date()
        
        # Optimized: Fetch both periods in a single query with wider date range
        # Then filter in Python - reduces DB round trips
        all_result = self.supabase.table('invoice_items')\
            .select('extended_price, invoice_id, invoices!inner(account_id, vendor_name, invoice_date, id)')\
            .eq('invoices.account_id', account_id)\
            .gte('invoices.invoice_date', prev_cutoff.isoformat())\
            .execute()
        
        # Split data into current and previous periods
        current_items = []
        prev_items = []
        
        for item in (all_result.data or []):
            if not item.get('invoices'):
                continue
            invoice_date = item['invoices']['invoice_date']
            if invoice_date >= cutoff_date.isoformat():
                current_items.append(item)
            else:
                prev_items.append(item)
        
        # Calculate current metrics
        current_spend = sum(float(Decimal(str(item['extended_price'] or 0))) for item in current_items)
        current_invoices = len(set(item['invoice_id'] for item in current_items))
        current_vendors = len(set(item['invoices']['vendor_name'] for item in current_items if item.get('invoices')))
        items_tracked = len(current_items)
        
        # Calculate previous metrics
        prev_spend = sum(float(Decimal(str(item['extended_price'] or 0))) for item in prev_items)
        prev_invoices = len(set(item['invoice_id'] for item in prev_items))
        
        # Calculate changes
        spend_change = ((current_spend - prev_spend) / prev_spend * 100) if prev_spend > 0 else 0
        invoice_change = current_invoices - prev_invoices
        avg_order = current_spend / current_invoices if current_invoices > 0 else 0
        
        return {
            "total_spend": round(current_spend, 2),
            "invoice_count": current_invoices,
            "vendor_count": current_vendors,
            "avg_order_value": round(avg_order, 2),
            "spend_change_percent": round(spend_change, 1),
            "invoice_change": invoice_change,
            "items_tracked": items_tracked,
            "days_analyzed": days_back
        }
    
    def get_spending_by_vendor(self, account_id: str, days_back: int = 90) -> List[Dict]:
        """
        Get spending breakdown by vendor
        
        Returns:
            [
                {"vendor_name": "Performance Food", "total_spend": 18450.00, "invoice_count": 45, "percent": 45.2}
            ]
        """
        cutoff_date = (datetime.now() - timedelta(days=days_back)).date()
        
        result = self.supabase.table('invoice_items')\
            .select('extended_price, invoice_id, invoices!inner(account_id, vendor_name, invoice_date)')\
            .eq('invoices.account_id', account_id)\
            .gte('invoices.invoice_date', cutoff_date.isoformat())\
            .execute()
        
        if not result.data:
            return []
        
        # Group by vendor
        vendor_data = defaultdict(lambda: {'total_spend': 0, 'invoices': set()})
        total_spend = 0
        
        for item in result.data:
            if not item.get('invoices'):
                continue
            vendor = item['invoices']['vendor_name']
            amount = float(Decimal(str(item['extended_price'] or 0)))
            vendor_data[vendor]['total_spend'] += amount
            vendor_data[vendor]['invoices'].add(item['invoice_id'])
            total_spend += amount
        
        # Build result
        vendors = []
        for vendor_name, data in vendor_data.items():
            percent = (data['total_spend'] / total_spend * 100) if total_spend > 0 else 0
            vendors.append({
                "vendor_name": vendor_name,
                "total_spend": round(data['total_spend'], 2),
                "invoice_count": len(data['invoices']),
                "percent": round(percent, 1)
            })
        
        vendors.sort(key=lambda x: x['total_spend'], reverse=True)
        return vendors
    
    def get_weekly_spending_trend(self, account_id: str, weeks: int = 8) -> List[Dict]:
        """
        Get weekly spending trend for charting
        
        Returns:
            [{"week_start": "2025-11-18", "total_spend": 2450.00, "invoice_count": 5}]
        """
        cutoff_date = (datetime.now() - timedelta(weeks=weeks)).date()
        
        result = self.supabase.table('invoice_items')\
            .select('extended_price, invoice_id, invoices!inner(account_id, invoice_date)')\
            .eq('invoices.account_id', account_id)\
            .gte('invoices.invoice_date', cutoff_date.isoformat())\
            .execute()
        
        if not result.data:
            return []
        
        # Group by week
        weekly_data = defaultdict(lambda: {'total_spend': 0, 'invoices': set()})
        
        for item in result.data:
            if not item.get('invoices'):
                continue
            invoice_date = datetime.fromisoformat(item['invoices']['invoice_date'])
            week_start = invoice_date - timedelta(days=invoice_date.weekday())
            week_key = week_start.date().isoformat()
            
            weekly_data[week_key]['total_spend'] += float(Decimal(str(item['extended_price'] or 0)))
            weekly_data[week_key]['invoices'].add(item['invoice_id'])
        
        # Build result
        trend = []
        for week_start, data in weekly_data.items():
            trend.append({
                "week_start": week_start,
                "total_spend": round(data['total_spend'], 2),
                "invoice_count": len(data['invoices'])
            })
        
        trend.sort(key=lambda x: x['week_start'])
        return trend
    
    def get_recent_invoices(self, account_id: str, limit: int = 10) -> List[Dict]:
        """
        Get recent invoices with summary data
        SOURCE OF TRUTH: Totals calculated from invoice_items.extended_price
        """
        # Get invoice headers
        invoices_result = self.supabase.table('invoices')\
            .select('id, invoice_number, vendor_name, invoice_date, status, created_at')\
            .eq('account_id', account_id)\
            .order('invoice_date', desc=True)\
            .limit(limit)\
            .execute()
        
        if not invoices_result.data:
            return []
        
        # Get totals from invoice_items (source of truth)
        invoice_ids = [inv['id'] for inv in invoices_result.data]
        items_result = self.supabase.table('invoice_items')\
            .select('invoice_id, extended_price')\
            .in_('invoice_id', invoice_ids)\
            .execute()
        
        # Calculate totals from invoice_items
        invoice_totals = defaultdict(float)
        for item in (items_result.data or []):
            invoice_totals[item['invoice_id']] += float(Decimal(str(item['extended_price'] or 0)))
        
        # Build result with calculated totals
        result = []
        for inv in invoices_result.data:
            result.append({
                "id": inv['id'],
                "invoice_number": inv['invoice_number'],
                "vendor_name": inv['vendor_name'],
                "invoice_date": inv['invoice_date'],
                "total": round(invoice_totals.get(inv['id'], 0), 2),
                "status": inv['status'],
                "created_at": inv['created_at']
            })
        
        return result
    
    def get_invoices_by_vendor(self, account_id: str, days_back: int = 90) -> List[Dict]:
        """
        Get invoices grouped by vendor with totals
        SOURCE OF TRUTH: Totals calculated from invoice_items.extended_price
        
        Returns:
            [
                {
                    "vendor_name": "Performance Food",
                    "total_spend": 18450.00,
                    "invoice_count": 45,
                    "avg_order": 410.00,
                    "invoices": [
                        {"id": "...", "invoice_number": "INV-001", "date": "2025-11-25", "total": 1234.00, "status": "approved", "item_count": 23}
                    ]
                }
            ]
        """
        cutoff_date = (datetime.now() - timedelta(days=days_back)).date()
        
        # Get invoice headers (no total - we calculate from items)
        invoices_result = self.supabase.table('invoices')\
            .select('id, invoice_number, vendor_name, invoice_date, status')\
            .eq('account_id', account_id)\
            .gte('invoice_date', cutoff_date.isoformat())\
            .order('invoice_date', desc=True)\
            .execute()
        
        if not invoices_result.data:
            return []
        
        # Get all items for these invoices (source of truth for totals)
        invoice_ids = [inv['id'] for inv in invoices_result.data]
        items_result = self.supabase.table('invoice_items')\
            .select('invoice_id, extended_price')\
            .in_('invoice_id', invoice_ids)\
            .execute()
        
        # Calculate totals and counts from invoice_items
        invoice_totals = defaultdict(float)
        item_counts = defaultdict(int)
        for item in (items_result.data or []):
            invoice_totals[item['invoice_id']] += float(Decimal(str(item['extended_price'] or 0)))
            item_counts[item['invoice_id']] += 1
        
        # Group by vendor
        vendor_data = defaultdict(lambda: {'invoices': [], 'total_spend': 0})
        
        for invoice in invoices_result.data:
            vendor = invoice['vendor_name']
            invoice_total = round(invoice_totals.get(invoice['id'], 0), 2)
            vendor_data[vendor]['invoices'].append({
                "id": invoice['id'],
                "invoice_number": invoice['invoice_number'],
                "date": invoice['invoice_date'],
                "total": invoice_total,
                "status": invoice['status'],
                "item_count": item_counts.get(invoice['id'], 0)
            })
            vendor_data[vendor]['total_spend'] += invoice_total
        
        # Build result
        vendors = []
        for vendor_name, data in vendor_data.items():
            invoice_count = len(data['invoices'])
            vendors.append({
                "vendor_name": vendor_name,
                "total_spend": round(data['total_spend'], 2),
                "invoice_count": invoice_count,
                "avg_order": round(data['total_spend'] / invoice_count, 2) if invoice_count > 0 else 0,
                "invoices": data['invoices']
            })
        
        vendors.sort(key=lambda x: x['total_spend'], reverse=True)
        return vendors
    
    def get_invoice_insights(self, account_id: str, invoice_id: str) -> Dict:
        """
        Get price insights for a specific invoice's items
        
        Returns items with price alerts and savings opportunities
        """
        # Get invoice items
        items_result = self.supabase.table('invoice_items')\
            .select('id, description, unit_price, quantity, extended_price')\
            .eq('invoice_id', invoice_id)\
            .execute()
        
        if not items_result.data:
            return {"items": [], "alerts": 0, "potential_savings": 0}
        
        # Get historical prices for comparison
        cutoff_date = (datetime.now() - timedelta(days=90)).date()
        
        insights = []
        total_alerts = 0
        total_savings = 0
        
        for item in items_result.data:
            # Get price history for this item
            history_result = self.supabase.table('invoice_items')\
                .select('unit_price, invoices!inner(account_id, vendor_name, invoice_date)')\
                .eq('invoices.account_id', account_id)\
                .ilike('description', f"%{item['description'][:30]}%")\
                .gte('invoices.invoice_date', cutoff_date.isoformat())\
                .execute()
            
            if len(history_result.data or []) > 1:
                prices = [float(h['unit_price'] or 0) for h in history_result.data]
                avg_price = sum(prices) / len(prices)
                min_price = min(prices)
                current_price = float(item['unit_price'] or 0)
                
                # Check for price spike
                price_change = ((current_price - avg_price) / avg_price * 100) if avg_price > 0 else 0
                is_alert = abs(price_change) > 10
                
                # Check for savings opportunity
                savings = current_price - min_price if current_price > min_price else 0
                
                if is_alert:
                    total_alerts += 1
                total_savings += savings * float(item['quantity'] or 0)
                
                insights.append({
                    "description": item['description'],
                    "current_price": current_price,
                    "avg_price": round(avg_price, 2),
                    "min_price": round(min_price, 2),
                    "price_change_percent": round(price_change, 1),
                    "is_alert": is_alert,
                    "potential_savings": round(savings * float(item['quantity'] or 0), 2)
                })
        
        return {
            "items": insights,
            "alerts": total_alerts,
            "potential_savings": round(total_savings, 2)
        }
