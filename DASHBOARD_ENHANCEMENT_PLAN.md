# Dashboard Enhancement Plan - Restaurant Owner First Login Experience

## Current State Analysis
Your dashboard currently shows:
- **4 KPI Cards**: Negative Alerts, Positive Alerts, Recent Invoices, Menu Items
- **Recently Ordered Items Table**: Item name, vendor, last price, last ordered, trend

## The Problem
Restaurant owners logging in want to see **actionable intelligence at a glance** - not just counts. They need to know:
1. "Am I losing money right now?"
2. "What should I do today?"
3. "How am I performing vs competitors?"
4. "What's trending in my market?"

---

## Recommended Dashboard Widgets (Priority Order)

### 🔴 ZONE 1: CRITICAL ALERTS (Top of Dashboard)
**Widget: "Action Required Today"**
- **Top 3 Price Spikes** (items that increased >threshold in last 7 days)
  - Show: Item name, old price → new price, % increase, vendor
  - Endpoint: `/api/v1/alerts/price-increases` (already exists)
  - Visual: Red alert cards with trending up icon
  
- **Top 3 Savings Opportunities** (items you're overpaying for)
  - Show: Item name, current vendor/price, cheaper vendor/price, potential savings
  - Endpoint: `/api/v1/alerts/savings-opportunities` (already exists)
  - Visual: Green opportunity cards with dollar sign icon

**Data Source**: `alert_generation_service.py` - already calculating this!

---

### 💰 ZONE 2: FINANCIAL INTELLIGENCE
**Widget: "Cost Trends This Month"**
- **Total Spend This Month** vs Last Month (% change)
- **Average Item Cost** trend (7-day moving average)
- **Biggest Cost Increases** (top 3 categories)
- **Estimated Monthly Savings** (if you acted on all opportunities)

**New Endpoint Needed**: `/api/v1/analytics/monthly-summary`
```python
{
  "current_month_spend": 12450.00,
  "last_month_spend": 11200.00,
  "change_percent": 11.2,
  "avg_item_cost_7day": 18.45,
  "avg_item_cost_trend": "up",
  "top_cost_increases": [
    {"category": "Proteins", "increase_percent": 15.2},
    {"category": "Dairy", "increase_percent": 8.5}
  ],
  "potential_monthly_savings": 450.00
}
```

---

### 📊 ZONE 3: COMPETITIVE INTELLIGENCE
**Widget: "Market Intelligence"**
- **Latest Competitor Analysis** (if any exist)
  - Show: Date, competitors analyzed, top insight preview
  - Link to full analysis
  - Endpoint: `/api/v1/analysis/latest-summary` (needs creation)

- **Menu Comparison Insights** (if any exist)
  - Show: Your pricing vs market average
  - Items you're overpriced on
  - Items you're underpriced on (opportunity to raise prices)
  - Endpoint: `/api/v1/menu-comparison/latest-summary` (needs creation)

**Data Source**: `enhanced_analysis_storage.py` + `menu_comparison_storage.py`

---

### 🔥 ZONE 4: TRENDING ITEMS
**Widget: "What's Hot in Your Kitchen"**
- **Most Frequently Ordered Items** (last 30 days)
  - Show: Item name, order frequency, total quantity, total cost
  - Endpoint: `/api/v1/analytics/top-ordered-items?days=30`
  
- **Fastest Rising Costs** (items with steepest price increases)
  - Show: Item name, price 30 days ago → now, % increase
  - Endpoint: `/api/v1/analytics/fastest-rising-costs?days=30`

**New Endpoint Needed**: Both endpoints above

---

### 📈 ZONE 5: VENDOR PERFORMANCE
**Widget: "Vendor Scorecard"**
- **Most Used Vendors** (by order count)
- **Most Expensive Vendors** (by avg item cost)
- **Best Value Vendors** (lowest prices for common items)
- **Vendor Price Volatility** (which vendors change prices most)

**New Endpoint Needed**: `/api/v1/analytics/vendor-scorecard`
```python
{
  "most_used": [
    {"vendor": "Sysco", "order_count": 45, "total_spend": 8500},
    {"vendor": "US Foods", "order_count": 32, "total_spend": 6200}
  ],
  "best_value": [
    {"vendor": "Restaurant Depot", "avg_savings_percent": 12.5}
  ],
  "most_volatile": [
    {"vendor": "Local Produce Co", "price_volatility_score": 8.2}
  ]
}
```

---

### 🎯 ZONE 6: QUICK ACTIONS
**Widget: "Recommended Actions"**
Smart recommendations based on their data:
- "Upload this week's invoices" (if none uploaded in 7 days)
- "Run competitor analysis" (if none in 30 days)
- "Review 5 savings opportunities" (if unacknowledged alerts exist)
- "Update menu prices" (if competitor analysis shows underpricing)

**Logic**: Frontend-driven based on existing data

---

## Implementation Priority

### Phase 1: Quick Wins (Use Existing Data) - 2 hours
1. **Enhance KPI Cards** with click-through details
   - Negative Alerts → Show top 3 items inline
   - Positive Alerts → Show top 3 savings inline
   
2. **Add "This Month vs Last Month" Summary Card**
   - Use existing `/api/v1/analytics/dashboard-summary`
   - Add date range filtering

3. **Add "Top 5 Most Ordered Items" Widget**
   - Use existing `/api/v1/analytics/items-list`
   - Sort by `purchase_count` descending

### Phase 2: New Endpoints (Medium Effort) - 4 hours
1. **Create `/api/v1/analytics/monthly-summary`**
   - Aggregate invoice_items by month
   - Calculate trends and comparisons

2. **Create `/api/v1/analytics/vendor-scorecard`**
   - Aggregate by vendor from invoice_items
   - Calculate metrics (avg cost, volatility, etc.)

3. **Create `/api/v1/analytics/top-ordered-items`**
   - Group invoice_items by description
   - Count frequency and sum quantities

### Phase 3: Competitive Intelligence (Requires Data) - 3 hours
1. **Create `/api/v1/analysis/latest-summary`**
   - Query `analyses` table for most recent
   - Return summary stats + top 3 insights

2. **Create `/api/v1/menu-comparison/latest-summary`**
   - Query `competitor_menu_analyses` for most recent
   - Return pricing comparison summary

---

## Recommended Dashboard Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Welcome back, John! 👋                                      │
│  Here's what's happening with your restaurant today          │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  🔴 ACTION REQUIRED TODAY                                     │
├──────────────────────────────────────────────────────────────┤
│  ⚠️ Price Spikes (3)          💰 Savings Opportunities (5)   │
│  • Chicken Breast +15%        • Switch Mozzarella → Save $45 │
│  • Olive Oil +12%             • Switch Tomatoes → Save $32   │
│  • Flour +8%                  • Switch Flour → Save $28      │
└──────────────────────────────────────────────────────────────┘

┌─────────────────────┬─────────────────────┬─────────────────┐
│  💰 This Month      │  📊 Avg Item Cost   │  🎯 Potential   │
│  $12,450            │  $18.45 ↑ 3%        │  Savings        │
│  ↑ 11% vs last mo   │  7-day trend        │  $450/month     │
└─────────────────────┴─────────────────────┴─────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  🔥 TRENDING IN YOUR KITCHEN                                  │
├──────────────────────────────────────────────────────────────┤
│  Most Ordered (30d)           Fastest Rising Costs           │
│  1. Mozzarella (45x)          1. Chicken +15% ($3.20→$3.68)  │
│  2. Tomatoes (42x)            2. Olive Oil +12% ($8→$8.96)   │
│  3. Flour (38x)               3. Flour +8% ($12→$12.96)      │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  📈 VENDOR SCORECARD                                          │
├──────────────────────────────────────────────────────────────┤
│  Most Used: Sysco (45 orders, $8,500)                        │
│  Best Value: Restaurant Depot (12.5% avg savings)            │
│  Most Volatile: Local Produce Co (8.2/10 volatility)         │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  🎯 COMPETITIVE INTELLIGENCE                                  │
├──────────────────────────────────────────────────────────────┤
│  Latest Analysis: 5 days ago (3 competitors)                 │
│  Top Insight: "Customers love competitor's crust quality"    │
│  Menu Comparison: You're 8% cheaper on pizzas (opportunity!) │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  📋 RECENTLY ORDERED ITEMS                                    │
│  [Existing table with pagination]                            │
└──────────────────────────────────────────────────────────────┘
```

---

## API Endpoints to Create

### 1. Monthly Summary
```python
@router.get("/api/v1/analytics/monthly-summary")
async def get_monthly_summary(
    current_user: str = Depends(get_current_user)
):
    """Get current month vs last month comparison"""
```

### 2. Top Ordered Items
```python
@router.get("/api/v1/analytics/top-ordered-items")
async def get_top_ordered_items(
    days: int = Query(30),
    limit: int = Query(10),
    current_user: str = Depends(get_current_user)
):
    """Get most frequently ordered items"""
```

### 3. Fastest Rising Costs
```python
@router.get("/api/v1/analytics/fastest-rising-costs")
async def get_fastest_rising_costs(
    days: int = Query(30),
    limit: int = Query(10),
    current_user: str = Depends(get_current_user)
):
    """Get items with steepest price increases"""
```

### 4. Vendor Scorecard
```python
@router.get("/api/v1/analytics/vendor-scorecard")
async def get_vendor_scorecard(
    days: int = Query(90),
    current_user: str = Depends(get_current_user)
):
    """Get vendor performance metrics"""
```

### 5. Latest Analysis Summary
```python
@router.get("/api/v1/analysis/latest-summary")
async def get_latest_analysis_summary(
    current_user: str = Depends(get_current_user)
):
    """Get summary of most recent competitor analysis"""
```

### 6. Latest Menu Comparison Summary
```python
@router.get("/api/v1/menu-comparison/latest-summary")
async def get_latest_menu_comparison_summary(
    current_user: str = Depends(get_current_user)
):
    """Get summary of most recent menu comparison"""
```

---

## Key Insights from Your Build

### You Already Have:
✅ Price analytics with 7-day and 28-day averages
✅ Alert generation with configurable thresholds
✅ Savings opportunities detection
✅ Vendor comparison logic
✅ Menu comparison with competitor data
✅ Review analysis with actionable insights
✅ Invoice tracking with price history

### You're Missing:
❌ Aggregated monthly/weekly spend summaries
❌ Top ordered items ranking
❌ Vendor performance scorecards
❌ Quick summary endpoints for competitive intelligence
❌ Trend visualization data (time series)

---

## Next Steps

1. **Start with Phase 1** - Enhance existing dashboard with inline alert details
2. **Build Phase 2 endpoints** - Create the 6 new API endpoints listed above
3. **Design new widgets** - Create React components for each zone
4. **Test with real data** - Ensure calculations are accurate
5. **Add visualizations** - Charts for trends (optional but powerful)

This plan leverages your existing awesome modules and surfaces the most valuable insights restaurant owners need to see immediately!
