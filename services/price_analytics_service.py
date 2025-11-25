"""
Price Analytics Service V2 - Source of Truth Pattern
Queries invoice_items directly (no inventory dependency)
Proper separation of concerns
"""
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from decimal import Decimal
from collections import defaultdict
import statistics
import logging
from supabase import Client

logger = logging.getLogger(__name__)


def normalize_item_name(description: str) -> str:
    """Normalize item description for grouping across invoices"""
    return description.lower().strip()


def safe_divide(numerator: float, denominator: float, default: float = 0.0) -> float:
    """
    Safe division that handles zero denominator
    
    Args:
        numerator: Number to divide
        denominator: Number to divide by
        default: Value to return if division by zero
        
    Returns:
        Result of division or default value
    """
    if denominator == 0 or denominator is None:
        return default
    return numerator / denominator


def calculate_price_change(old_price: float, new_price: float) -> Optional[float]:
    """
    Calculate percentage price change safely
    
    Args:
        old_price: Previous price
        new_price: Current price
        
    Returns:
        Percentage change or None if cannot calculate
    """
    # Handle None values
    if old_price is None or new_price is None:
        return None
    
    # Handle zero or negative prices
    if old_price == 0:
        logger.warning(f"Cannot calculate price change from zero: {old_price} -> {new_price}")
        return None
    
    if old_price < 0 or new_price < 0:
        logger.warning(f"Negative price detected: {old_price} -> {new_price}")
        return None
    
    return ((new_price - old_price) / old_price) * 100


def validate_price_data(price: float, quantity: float, item_description: str = "") -> bool:
    """
    Validate price and quantity data
    
    Args:
        price: Unit price
        quantity: Quantity
        item_description: Item description for logging
        
    Returns:
        True if valid, False if invalid
    """
    if price is None or quantity is None:
        logger.warning(f"Null price or quantity for {item_description}")
        return False
    
    if price < 0:
        logger.warning(f"Negative price for {item_description}: {price}")
        return False
    
    if quantity <= 0:
        logger.warning(f"Invalid quantity for {item_description}: {quantity}")
        return False
    
    if price == 0:
        logger.info(f"Zero price detected for {item_description}")
        # Allow zero prices but log them
    
    return True


class PriceAnalyticsService:
    """
    Price analytics that queries invoice_items directly
    No dependency on inventory_items or price_history tables
    """
    
    def __init__(self, supabase_client: Client):
        self.supabase = supabase_client
    
    def get_price_comparison(
        self,
        user_id: str,
        item_description: str,
        days_back: int = 90
    ) -> Dict:
        """
        Compare prices across vendors for an item
        
        Args:
            user_id: User ID
            item_description: Item description to search for
            days_back: Days of history to analyze
            
        Returns:
            Dict with vendor comparison data
        """
        cutoff_date = (datetime.now() - timedelta(days=days_back)).date()
        
        # Query invoice_items (source of truth)
        result = self.supabase.table('invoice_items')\
            .select('*, invoices!inner(vendor_name, invoice_date, user_id)')\
            .ilike('description', f'%{item_description}%')\
            .eq('invoices.user_id', user_id)\
            .gte('invoices.invoice_date', cutoff_date.isoformat())\
            .execute()
        
        if not result.data:
            return {
                "item_description": item_description,
                "vendors": [],
                "message": "No data found"
            }
        
        # Group by vendor with validation
        vendor_data = defaultdict(list)
        for item in result.data:
            try:
                price = float(Decimal(str(item['unit_price'])))
                quantity = float(Decimal(str(item['quantity'])))
                
                # Validate data
                if not validate_price_data(price, quantity, item['description']):
                    continue  # Skip invalid data
                
                vendor_name = item['invoices']['vendor_name']
                vendor_data[vendor_name].append({
                    'price': price,
                    'date': item['invoices']['invoice_date'],
                    'quantity': quantity
                })
            except (ValueError, TypeError, KeyError) as e:
                logger.warning(f"Skipping invalid item data: {e}")
                continue
        
        # Calculate vendor stats
        vendors = []
        for vendor_name, prices in vendor_data.items():
            price_values = [p['price'] for p in prices]
            latest = max(prices, key=lambda x: x['date'])
            
            vendors.append({
                "vendor_name": vendor_name,
                "current_price": latest['price'],
                "avg_price": round(statistics.mean(price_values), 2),
                "min_price": min(price_values),
                "max_price": max(price_values),
                "purchase_count": len(prices),
                "last_purchase_date": latest['date']
            })
        
        vendors.sort(key=lambda x: x['current_price'])
        
        return {
            "item_description": item_description,
            "vendors": vendors,
            "best_vendor": vendors[0] if vendors else None,
            "vendor_count": len(vendors)
        }
    
    def get_price_trends(
        self,
        user_id: str,
        item_description: str,
        days: int = 90
    ) -> List[Dict]:
        """
        Get price trend data for charting
        
        Args:
            user_id: User ID
            item_description: Item description
            days: Days of trend data
            
        Returns:
            List of price data points
        """
        cutoff_date = (datetime.now() - timedelta(days=days)).date()
        
        result = self.supabase.table('invoice_items')\
            .select('unit_price, quantity, invoices!inner(vendor_name, invoice_date, user_id)')\
            .ilike('description', f'%{item_description}%')\
            .eq('invoices.user_id', user_id)\
            .gte('invoices.invoice_date', cutoff_date.isoformat())\
            .execute()
        
        # Sort in Python since we can't order by joined table column
        result.data.sort(key=lambda x: x['invoices']['invoice_date'])
        
        trends = []
        for item in result.data:
            trends.append({
                "date": item['invoices']['invoice_date'],
                "price": float(Decimal(str(item['unit_price']))),
                "vendor_name": item['invoices']['vendor_name'],
                "quantity": float(Decimal(str(item['quantity'])))
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
        
        Args:
            user_id: User ID
            min_savings_percent: Minimum savings % to report
            days_back: Days of history
            
        Returns:
            List of savings opportunities
        """
        cutoff_date = (datetime.now() - timedelta(days=days_back)).date()
        
        result = self.supabase.table('invoice_items')\
            .select('*, invoices!inner(vendor_name, invoice_date, user_id)')\
            .eq('invoices.user_id', user_id)\
            .gte('invoices.invoice_date', cutoff_date.isoformat())\
            .execute()
        
        # Group by normalized item name
        items_by_description = defaultdict(lambda: defaultdict(list))
        for item in result.data:
            normalized = normalize_item_name(item['description'])
            vendor = item['invoices']['vendor_name']
            items_by_description[normalized][vendor].append({
                'price': float(Decimal(str(item['unit_price']))),
                'date': item['invoices']['invoice_date'],
                'description': item['description']
            })
        
        opportunities = []
        for item_name, vendors in items_by_description.items():
            if len(vendors) < 2:
                continue
            
            # Get latest price per vendor
            vendor_latest = {}
            for vendor, purchases in vendors.items():
                latest = max(purchases, key=lambda x: x['date'])
                vendor_latest[vendor] = latest['price']
            
            # Find most recent purchase overall
            all_purchases = [p for v in vendors.values() for p in v]
            most_recent = max(all_purchases, key=lambda x: x['date'])
            current_vendor = None
            for vendor, purchases in vendors.items():
                if most_recent in purchases:
                    current_vendor = vendor
                    break
            
            current_price = vendor_latest[current_vendor]
            best_price = min(vendor_latest.values())
            best_vendor = [v for v, p in vendor_latest.items() if p == best_price][0]
            
            if current_vendor != best_vendor:
                savings_amount = current_price - best_price
                
                # Safe percent calculation
                savings_percent = calculate_price_change(best_price, current_price)
                
                if savings_percent is None:
                    logger.warning(f"Cannot calculate savings for {most_recent['description']}: invalid prices")
                    continue
                
                # Use absolute value for comparison
                if abs(savings_percent) >= min_savings_percent:
                    opportunities.append({
                        "item_description": most_recent['description'],
                        "current_vendor": current_vendor,
                        "current_price": current_price,
                        "best_vendor": best_vendor,
                        "best_price": best_price,
                        "savings_amount": round(savings_amount, 2),
                        "savings_percent": round(savings_percent, 2)
                    })
        
        opportunities.sort(key=lambda x: x['savings_amount'], reverse=True)
        return opportunities
    
    def get_vendor_performance(
        self,
        user_id: str,
        vendor_name: str,
        days_back: int = 90
    ) -> Dict:
        """
        Get vendor pricing performance metrics
        
        Args:
            user_id: User ID
            vendor_name: Vendor name
            days_back: Days of history
            
        Returns:
            Vendor performance data
        """
        cutoff_date = (datetime.now() - timedelta(days=days_back)).date()
        
        result = self.supabase.table('invoice_items')\
            .select('*, invoices!inner(vendor_name, invoice_date, user_id)')\
            .eq('invoices.vendor_name', vendor_name)\
            .eq('invoices.user_id', user_id)\
            .gte('invoices.invoice_date', cutoff_date.isoformat())\
            .execute()
        
        if not result.data:
            return {
                "vendor_name": vendor_name,
                "error": "No data found"
            }
        
        # Group by item
        items = defaultdict(list)
        for item in result.data:
            normalized = normalize_item_name(item['description'])
            items[normalized].append(Decimal(str(item['unit_price'])))
        
        all_prices = [p for prices in items.values() for p in prices]
        
        return {
            "vendor_name": vendor_name,
            "total_items": len(items),
            "total_purchases": len(result.data),
            "avg_price": round(statistics.mean(all_prices), 2) if all_prices else 0,
            "price_volatility": round(statistics.stdev(all_prices), 2) if len(all_prices) > 1 else 0,
            "analysis_period_days": days_back
        }
    
    def detect_price_anomalies(
        self,
        user_id: str,
        days_back: int = 90,
        min_change_percent: float = 20.0
    ) -> List[Dict]:
        """
        Detect unusual price changes
        
        Args:
            user_id: User ID
            days_back: Days of history
            min_change_percent: Minimum % change to flag
            
        Returns:
            List of price anomalies
        """
        cutoff_date = (datetime.now() - timedelta(days=days_back)).date()
        
        result = self.supabase.table('invoice_items')\
            .select('*, invoices!inner(vendor_name, invoice_date, user_id)')\
            .eq('invoices.user_id', user_id)\
            .gte('invoices.invoice_date', cutoff_date.isoformat())\
            .execute()
        
        # Group by item
        items_by_description = defaultdict(list)
        for item in result.data:
            normalized = normalize_item_name(item['description'])
            items_by_description[normalized].append({
                'price': float(item['unit_price']),
                'date': item['invoices']['invoice_date'],
                'vendor': item['invoices']['vendor_name'],
                'description': item['description']
            })
        
        anomalies = []
        for item_name, purchases in items_by_description.items():
            if len(purchases) < 3:
                continue
            
            purchases.sort(key=lambda x: x['date'])
            
            # Check each purchase against average of previous
            for i in range(2, len(purchases)):
                previous_prices = [p['price'] for p in purchases[:i]]
                avg_price = statistics.mean(previous_prices)
                current_price = purchases[i]['price']
                
                change = calculate_price_change(avg_price, current_price)
                if change is None:
                    continue  # Skip if can't calculate
                
                change_percent = abs(change)
                
                if change_percent >= min_change_percent:
                    anomalies.append({
                        "item_description": purchases[i]['description'],
                        "vendor_name": purchases[i]['vendor'],
                        "date": purchases[i]['date'],
                        "current_price": current_price,
                        "expected_price": round(avg_price, 2),
                        "change_percent": round(change_percent, 2),
                        "anomaly_type": "spike" if current_price > avg_price else "drop"
                    })
        
        anomalies.sort(key=lambda x: x['change_percent'], reverse=True)
        return anomalies
    
    def get_dashboard_summary(
        self,
        user_id: str,
        days_back: int = 90
    ) -> Dict:
        """
        Get summary analytics for dashboard
        
        Args:
            user_id: User ID
            days_back: Days of history
            
        Returns:
            Dashboard summary data
        """
        cutoff_date = (datetime.now() - timedelta(days=days_back)).date()
        
        result = self.supabase.table('invoice_items')\
            .select('*, invoices!inner(vendor_name, invoice_date, user_id)')\
            .eq('invoices.user_id', user_id)\
            .gte('invoices.invoice_date', cutoff_date.isoformat())\
            .execute()
        
        if not result.data:
            return {
                "unique_items_tracked": 0,
                "active_vendors": 0,
                "total_purchases": 0,
                "total_spend": 0,
                "analysis_period_days": days_back
            }
        
        unique_items = len(set(normalize_item_name(item['description']) for item in result.data))
        unique_vendors = len(set(item['invoices']['vendor_name'] for item in result.data))
        total_purchases = len(result.data)
        total_spend = float(sum(Decimal(str(item['extended_price'])) for item in result.data))
        
        return {
            "unique_items_tracked": unique_items,
            "active_vendors": unique_vendors,
            "total_purchases": total_purchases,
            "total_spend": round(total_spend, 2),
            "analysis_period_days": days_back
        }
    
    def get_items_list(
        self,
        user_id: str,
        days_back: int = 90
    ) -> List[Dict]:
        """
        Get list of all items with recent purchase data
        Includes last paid price, 7-day avg, and 28-day avg
        
        Args:
            user_id: User ID
            days_back: Days of history
            
        Returns:
            List of items with price data
        """
        cutoff_date = (datetime.now() - timedelta(days=days_back)).date()
        cutoff_7d = (datetime.now() - timedelta(days=7)).date()
        cutoff_28d = (datetime.now() - timedelta(days=28)).date()
        
        result = self.supabase.table('invoice_items')\
            .select('*, invoices!inner(vendor_name, invoice_date, user_id)')\
            .eq('invoices.user_id', user_id)\
            .gte('invoices.invoice_date', cutoff_date.isoformat())\
            .execute()
        
        # Group by normalized name
        items_data = defaultdict(list)
        for item in result.data:
            normalized = normalize_item_name(item['description'])
            items_data[normalized].append({
                'price': float(item['unit_price']),
                'date': item['invoices']['invoice_date'],
                'vendor': item['invoices']['vendor_name'],
                'description': item['description']
            })
        
        items = []
        for item_name, purchases in items_data.items():
            latest = max(purchases, key=lambda x: x['date'])
            prices = [p['price'] for p in purchases]
            
            # Calculate 7-day average
            prices_7d = [p['price'] for p in purchases if p['date'] >= cutoff_7d.isoformat()]
            avg_7d = round(statistics.mean(prices_7d), 2) if prices_7d else None
            
            # Calculate 28-day average
            prices_28d = [p['price'] for p in purchases if p['date'] >= cutoff_28d.isoformat()]
            avg_28d = round(statistics.mean(prices_28d), 2) if prices_28d else None
            
            # Calculate price change percentages safely
            price_change_7d = None
            if avg_7d:
                change = calculate_price_change(avg_7d, latest['price'])
                if change is not None:
                    price_change_7d = round(change, 1)
            
            price_change_28d = None
            if avg_28d:
                change = calculate_price_change(avg_28d, latest['price'])
                if change is not None:
                    price_change_28d = round(change, 1)
            
            # Calculate 90-day average (all prices within the query window)
            avg_90d = round(statistics.mean(prices), 2)
            
            items.append({
                "description": latest['description'],
                "last_paid_price": latest['price'],
                "last_paid_date": latest['date'],
                "last_paid_vendor": latest['vendor'],
                "avg_price_7day": avg_7d,
                "avg_price_28day": avg_28d,
                "avg_price_90day": avg_90d,
                "avg_price_all": avg_90d,  # Keep for backwards compatibility
                "price_change_7day_percent": price_change_7d,
                "price_change_28day_percent": price_change_28d,
                "min_price": min(prices),
                "max_price": max(prices),
                "purchase_count": len(purchases),
                "purchases_last_7days": len(prices_7d),
                "purchases_last_28days": len(prices_28d)
            })
        
        items.sort(key=lambda x: x['last_paid_date'], reverse=True)
        return items


    def get_item_purchase_history(self, user_id: str, item_description: str) -> List[Dict]:
        """
        Get all purchases for a specific item
        
        Args:
            user_id: User ID
            item_description: Item description to search for
            
        Returns:
            List of purchase records with date, vendor, price, quantity, invoice
        """
        try:
            # Query invoice_items for this user and item
            result = self.supabase.table("invoice_items").select(
                "id, description, unit_price, quantity, created_at, invoice_id, "
                "invoices!inner(vendor_name, invoice_number, invoice_date, user_id)"
            ).eq("invoices.user_id", user_id).ilike(
                "description", f"%{item_description}%"
            ).order("created_at", desc=True).limit(50).execute()
            
            purchases = []
            for item in result.data:
                invoice = item.get("invoices", {})
                purchases.append({
                    "date": item.get("created_at") or invoice.get("invoice_date"),
                    "vendor": invoice.get("vendor_name", "Unknown"),
                    "price": float(item.get("unit_price") or 0),
                    "quantity": float(item.get("quantity") or 0),
                    "invoice_number": invoice.get("invoice_number", "N/A")
                })
            
            return purchases
            
        except Exception as e:
            logger.error(f"Error getting item purchase history: {e}")
            return []
