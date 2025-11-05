"""
Price Analytics Service - Advanced price intelligence and vendor comparison
Analyzes price_history data to provide actionable insights
"""
from typing import Dict, List, Optional, Tuple
from decimal import Decimal
from datetime import datetime, timedelta
from supabase import Client
import statistics


class PriceAnalyticsService:
    """Service for advanced price analytics and vendor comparison"""
    
    def __init__(self, supabase_client: Client):
        self.supabase = supabase_client
    
    def get_cross_vendor_comparison(
        self, 
        item_id: str, 
        user_id: str,
        days_back: int = 90
    ) -> Dict:
        """
        Compare prices across all vendors for a specific item
        Uses database function as source of truth
        """
        # Get item details
        item_response = self.supabase.table('inventory_items')\
            .select('id, name')\
            .eq('id', item_id)\
            .eq('user_id', user_id)\
            .single()\
            .execute()
        
        if not item_response.data:
            raise ValueError(f"Item {item_id} not found")
        
        item_name = item_response.data['name']
        
        # Call database function (source of truth)
        result = self.supabase.rpc(
            'get_vendor_price_comparison',
            {
                'target_item_id': item_id,
                'target_user_id': user_id,
                'days_back': days_back
            }
        ).execute()
        
        if not result.data:
            return {
                "item_id": item_id,
                "item_name": item_name,
                "vendors": [],
                "best_vendor": None,
                "potential_savings": 0.0
            }
        
        # Format vendor data from database function
        vendors = []
        for row in result.data:
            vendors.append({
                "vendor_id": row['vendor_id'],
                "vendor_name": row['vendor_name'],
                "current_price": float(row['current_price']) if row['current_price'] else 0.0,
                "avg_price": float(row['avg_price']) if row['avg_price'] else 0.0,
                "min_price": float(row['min_price']) if row['min_price'] else 0.0,
                "max_price": float(row['max_price']) if row['max_price'] else 0.0,
                "price_trend": row['price_trend'],
                "last_purchase_date": row['last_purchase_date'],
                "purchase_count": row['purchase_count']
            })
        
        # Best vendor is first (database sorts by current_price ASC)
        best_vendor = vendors[0] if vendors else None
        
        # Calculate potential savings (if not using best vendor)
        if len(vendors) > 1:
            current_vendor_price = vendors[-1]['current_price']  # Most expensive
            best_price = best_vendor['current_price']
            potential_savings = max(current_vendor_price - best_price, 0.0)
        else:
            potential_savings = 0.0
        
        return {
            "item_id": item_id,
            "item_name": item_name,
            "vendors": vendors,
            "best_vendor": best_vendor,
            "potential_savings": potential_savings
        }
    
    def get_price_trends(
        self, 
        item_id: str, 
        user_id: str,
        days: int = 90
    ) -> List[Dict]:
        """
        Get price trend data for charting
        
        Returns:
            [
                {
                    "date": "2024-01-15",
                    "price": 12.50,
                    "vendor_name": "Sysco",
                    "vendor_id": "uuid"
                }
            ]
        """
        cutoff_date = datetime.now() - timedelta(days=days)
        
        response = self.supabase.table('price_history')\
            .select('invoice_date, unit_price, vendor_id, vendors(name)')\
            .eq('inventory_item_id', item_id)\
            .eq('user_id', user_id)\
            .gte('invoice_date', cutoff_date.date().isoformat())\
            .order('invoice_date', desc=False)\
            .execute()
        
        trends = []
        for record in response.data:
            trends.append({
                "date": record['invoice_date'],
                "price": float(record['unit_price']),
                "vendor_name": record['vendors']['name'],
                "vendor_id": record['vendor_id']
            })
        
        return trends

    def find_savings_opportunities(
        self, 
        user_id: str,
        min_savings_percent: float = 5.0,
        days_back: int = 90
    ) -> List[Dict]:
        """
        Find items where switching vendors could save money
        Uses database function as source of truth
        """
        # Call database function (source of truth)
        result = self.supabase.rpc(
            'find_savings_opportunities',
            {
                'target_user_id': user_id,
                'min_savings_percent': min_savings_percent,
                'days_back': days_back
            }
        ).execute()
        
        if not result.data:
            return []
        
        # Format opportunities from database function
        opportunities = []
        for row in result.data:
            # Estimate monthly usage from recent history
            usage_response = self.supabase.table('price_history')\
                .select('id', count='exact')\
                .eq('inventory_item_id', row['item_id'])\
                .eq('vendor_id', row['current_vendor_id'])\
                .eq('user_id', user_id)\
                .gte('invoice_date', (datetime.now() - timedelta(days=30)).date().isoformat())\
                .execute()
            
            monthly_usage = usage_response.count or 1
            savings_amount = float(row['savings_amount']) if row['savings_amount'] else 0.0
            
            opportunities.append({
                "item_id": row['item_id'],
                "item_name": row['item_name'],
                "current_vendor": row['current_vendor_name'],
                "current_price": float(row['current_price']) if row['current_price'] else 0.0,
                "best_vendor": row['best_vendor_name'],
                "best_price": float(row['best_price']) if row['best_price'] else 0.0,
                "savings_amount": savings_amount,
                "savings_percent": float(row['savings_percent']) if row['savings_percent'] else 0.0,
                "monthly_usage": monthly_usage,
                "estimated_monthly_savings": savings_amount * monthly_usage
            })
        
        # Already sorted by savings_amount in database function
        return opportunities
    
    def get_vendor_performance(
        self, 
        vendor_id: str, 
        user_id: str,
        days_back: int = 90
    ) -> Dict:
        """
        Get vendor pricing performance metrics
        Uses database function for competitive score (source of truth)
        """
        cutoff_date = datetime.now() - timedelta(days=days_back)
        
        # Get vendor details
        vendor_response = self.supabase.table('vendors')\
            .select('id, name')\
            .eq('id', vendor_id)\
            .eq('user_id', user_id)\
            .single()\
            .execute()
        
        if not vendor_response.data:
            raise ValueError(f"Vendor {vendor_id} not found")
        
        vendor_name = vendor_response.data['name']
        
        # Get all price history for this vendor
        price_response = self.supabase.table('price_history')\
            .select('inventory_item_id, unit_price, invoice_date, inventory_items(name)')\
            .eq('vendor_id', vendor_id)\
            .eq('user_id', user_id)\
            .gte('invoice_date', cutoff_date.date().isoformat())\
            .order('invoice_date', desc=True)\
            .execute()
        
        if not price_response.data:
            return {
                "vendor_id": vendor_id,
                "vendor_name": vendor_name,
                "total_items": 0,
                "avg_price_trend": "stable",
                "price_volatility": 0.0,
                "competitive_score": 50.0,
                "items_analysis": []
            }
        
        # Group by item
        item_prices = {}
        for record in price_response.data:
            item_id = record['inventory_item_id']
            if item_id not in item_prices:
                item_prices[item_id] = {
                    'item_name': record['inventory_items']['name'],
                    'prices': []
                }
            item_prices[item_id]['prices'].append(Decimal(str(record['unit_price'])))
        
        # Calculate overall trend
        all_prices = [p for item in item_prices.values() for p in item['prices']]
        avg_trend = self._calculate_price_trend(all_prices)
        
        # Calculate volatility (standard deviation / mean)
        if len(all_prices) > 1:
            mean_price = statistics.mean(all_prices)
            std_dev = statistics.stdev(all_prices)
            volatility = float((std_dev / mean_price) * 100) if mean_price > 0 else 0.0
        else:
            volatility = 0.0
        
        # Call database function for competitive score (source of truth)
        score_result = self.supabase.rpc(
            'calculate_vendor_competitive_score',
            {
                'target_vendor_id': vendor_id,
                'target_user_id': user_id,
                'days_back': days_back
            }
        ).execute()
        
        competitive_score = float(score_result.data) if score_result.data else 50.0
        
        # Items analysis
        items_analysis = []
        for item_id, data in item_prices.items():
            avg_price = sum(data['prices']) / len(data['prices'])
            rank = self._get_vendor_rank_for_item(item_id, vendor_id, user_id, cutoff_date)
            
            items_analysis.append({
                "item_name": data['item_name'],
                "avg_price": float(avg_price),
                "rank": rank
            })
        
        return {
            "vendor_id": vendor_id,
            "vendor_name": vendor_name,
            "total_items": len(item_prices),
            "avg_price_trend": avg_trend,
            "price_volatility": volatility,
            "competitive_score": competitive_score,
            "items_analysis": items_analysis
        }

    def detect_price_anomalies(
        self, 
        user_id: str,
        days_back: int = 90,
        std_dev_threshold: float = 2.0
    ) -> List[Dict]:
        """
        Detect unusual price changes (spikes or drops)
        Uses database function as source of truth
        """
        # Call database function (source of truth)
        result = self.supabase.rpc(
            'detect_price_anomalies',
            {
                'target_user_id': user_id,
                'days_back': days_back,
                'std_dev_threshold': std_dev_threshold
            }
        ).execute()
        
        if not result.data:
            return []
        
        # Format anomalies from database function
        anomalies = []
        for row in result.data:
            # Get the date of the anomaly
            date_response = self.supabase.table('price_history')\
                .select('invoice_date')\
                .eq('inventory_item_id', row['item_id'])\
                .eq('vendor_id', row['vendor_id'])\
                .eq('unit_price', row['current_price'])\
                .eq('user_id', user_id)\
                .order('invoice_date', desc=True)\
                .limit(1)\
                .execute()
            
            anomaly_date = date_response.data[0]['invoice_date'] if date_response.data else None
            
            anomalies.append({
                "item_id": row['item_id'],
                "item_name": row['item_name'],
                "vendor_name": row['vendor_name'],
                "current_price": float(row['current_price']) if row['current_price'] else 0.0,
                "expected_price": float(row['expected_price']) if row['expected_price'] else 0.0,
                "deviation_percent": float(row['deviation_percent']) if row['deviation_percent'] else 0.0,
                "anomaly_type": row['anomaly_type'],
                "date": anomaly_date,
                "severity": row['severity']
            })
        
        # Already sorted by z_score in database function
        return anomalies
    
    # Helper methods
    
    def _calculate_price_trend(self, prices: List[Decimal]) -> str:
        """Calculate if prices are increasing, decreasing, or stable"""
        if len(prices) < 2:
            return "stable"
        
        # Compare first half to second half
        mid = len(prices) // 2
        first_half_avg = sum(prices[:mid]) / len(prices[:mid])
        second_half_avg = sum(prices[mid:]) / len(prices[mid:])
        
        change_percent = ((second_half_avg - first_half_avg) / first_half_avg) * 100
        
        if change_percent > 5:
            return "increasing"
        elif change_percent < -5:
            return "decreasing"
        else:
            return "stable"
    
    def _calculate_competitive_score(
        self, 
        vendor_id: str, 
        user_id: str,
        item_ids: List[str],
        cutoff_date: datetime
    ) -> float:
        """
        Calculate how competitive a vendor's pricing is (0-100)
        100 = always cheapest, 0 = always most expensive
        """
        if not item_ids:
            return 50.0
        
        total_rank_score = 0
        items_compared = 0
        
        for item_id in item_ids:
            rank = self._get_vendor_rank_for_item(item_id, vendor_id, user_id, cutoff_date)
            if rank > 0:
                # Get total vendors for this item
                vendors_response = self.supabase.table('price_history')\
                    .select('vendor_id', count='exact')\
                    .eq('inventory_item_id', item_id)\
                    .eq('user_id', user_id)\
                    .gte('invoice_date', cutoff_date.date().isoformat())\
                    .execute()
                
                unique_vendors = len(set([r['vendor_id'] for r in vendors_response.data]))
                
                if unique_vendors > 1:
                    # Score: 1st place = 100%, last place = 0%
                    rank_score = ((unique_vendors - rank + 1) / unique_vendors) * 100
                    total_rank_score += rank_score
                    items_compared += 1
        
        return total_rank_score / items_compared if items_compared > 0 else 50.0
    
    def _get_vendor_rank_for_item(
        self, 
        item_id: str, 
        vendor_id: str, 
        user_id: str,
        cutoff_date: datetime
    ) -> int:
        """Get vendor's price rank for an item (1 = cheapest)"""
        # Get all vendors' average prices for this item
        price_response = self.supabase.table('price_history')\
            .select('vendor_id, unit_price')\
            .eq('inventory_item_id', item_id)\
            .eq('user_id', user_id)\
            .gte('invoice_date', cutoff_date.date().isoformat())\
            .execute()
        
        if not price_response.data:
            return 0
        
        # Calculate average price per vendor
        vendor_avg_prices = {}
        for record in price_response.data:
            vid = record['vendor_id']
            if vid not in vendor_avg_prices:
                vendor_avg_prices[vid] = []
            vendor_avg_prices[vid].append(Decimal(str(record['unit_price'])))
        
        vendor_avgs = {
            vid: sum(prices) / len(prices) 
            for vid, prices in vendor_avg_prices.items()
        }
        
        # Sort by price and find rank
        sorted_vendors = sorted(vendor_avgs.items(), key=lambda x: x[1])
        
        for rank, (vid, _) in enumerate(sorted_vendors, start=1):
            if vid == vendor_id:
                return rank
        
        return 0
    
    def get_item_price_metrics(
        self,
        user_id: str,
        item_id: Optional[str] = None
    ) -> List[Dict]:
        """
        Get price tracking metrics for items
        Returns last paid price, 7-day avg, 28-day avg
        Uses database function as source of truth
        """
        result = self.supabase.rpc(
            'get_item_price_metrics',
            {
                'target_user_id': user_id,
                'target_item_id': item_id
            }
        ).execute()
        
        if not result.data:
            return []
        
        metrics = []
        for row in result.data:
            metrics.append({
                "item_id": row['item_id'],
                "item_name": row['item_name'],
                "last_paid_price": float(row['last_paid_price']) if row['last_paid_price'] else None,
                "last_paid_date": row['last_paid_date'],
                "last_paid_vendor_id": row['last_paid_vendor_id'],
                "last_paid_vendor_name": row['last_paid_vendor_name'],
                "avg_price_7day": float(row['avg_price_7day']) if row['avg_price_7day'] else None,
                "avg_price_28day": float(row['avg_price_28day']) if row['avg_price_28day'] else None,
                "price_change_7day_percent": float(row['price_change_7day_percent']) if row['price_change_7day_percent'] else None,
                "price_change_28day_percent": float(row['price_change_28day_percent']) if row['price_change_28day_percent'] else None,
                "total_purchases_7day": row['total_purchases_7day'],
                "total_purchases_28day": row['total_purchases_28day']
            })
        
        return metrics
    
    def get_all_items_price_summary(self, user_id: str) -> List[Dict]:
        """
        Get simplified price summary for all items
        Uses database function as source of truth
        """
        result = self.supabase.rpc(
            'get_all_items_price_summary',
            {'target_user_id': user_id}
        ).execute()
        
        if not result.data:
            return []
        
        summary = []
        for row in result.data:
            summary.append({
                "item_id": row['item_id'],
                "item_name": row['item_name'],
                "last_paid_price": float(row['last_paid_price']) if row['last_paid_price'] else None,
                "last_paid_date": row['last_paid_date'],
                "last_paid_vendor": row['last_paid_vendor'],
                "avg_price_7day": float(row['avg_price_7day']) if row['avg_price_7day'] else None,
                "avg_price_28day": float(row['avg_price_28day']) if row['avg_price_28day'] else None,
                "price_trend": row['price_trend'],
                "has_recent_data": row['has_recent_data']
            })
        
        return summary
    
    def get_items_with_price_changes(
        self,
        user_id: str,
        min_change_percent: float = 10.0,
        days_to_compare: int = 7
    ) -> List[Dict]:
        """
        Get items with significant price changes
        Uses database function as source of truth
        """
        result = self.supabase.rpc(
            'get_items_with_price_changes',
            {
                'target_user_id': user_id,
                'min_change_percent': min_change_percent,
                'days_to_compare': days_to_compare
            }
        ).execute()
        
        if not result.data:
            return []
        
        changes = []
        for row in result.data:
            changes.append({
                "item_id": row['item_id'],
                "item_name": row['item_name'],
                "last_paid_price": float(row['last_paid_price']) if row['last_paid_price'] else None,
                "comparison_avg_price": float(row['comparison_avg_price']) if row['comparison_avg_price'] else None,
                "price_change_percent": float(row['price_change_percent']) if row['price_change_percent'] else None,
                "change_type": row['change_type'],
                "last_vendor": row['last_vendor']
            })
        
        return changes
