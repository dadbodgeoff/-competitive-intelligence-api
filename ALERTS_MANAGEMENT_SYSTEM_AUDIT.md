# Alerts Management System - Complete Audit & Implementation Plan

## Executive Summary
Build a comprehensive alerts management system with dedicated pages for Price Alerts and Savings Opportunities, including dismiss/acknowledge functionality.

---

## Current State Analysis

### What Exists
1. **Backend APIs** ✅
   - `/api/v1/analytics/price-anomalies` - Returns price increase alerts
   - `/api/v1/analytics/savings-opportunities` - Returns vendor switching opportunities
   - Both endpoints working and returning data

2. **Dashboard KPIs** ✅
   - Negative Alerts card (8 alerts)
   - Positive Alerts card (1 opportunity)
   - Both link to `/analytics` (Price Analytics Dashboard)

3. **Price Analytics Dashboard** ⚠️
   - Shows both alert types in expandable sections
   - No dedicated pages
   - No dismiss/acknowledge functionality
   - Alerts show duplicate entries (same item, multiple vendors)

### What's Missing
1. **Dedicated Alert Pages** ❌
   - `/analytics/alerts` - Price alerts page
   - `/analytics/opportunities` - Savings opportunities page

2. **Alert Management** ❌
   - Dismiss/acknowledge functionality
   - Alert state persistence
   - Filter by status (active/dismissed)

3. **Database Schema** ❌
   - Alert acknowledgment tracking table
   - User-specific alert states

4. **UI Components** ❌
   - Alert detail cards with actions
   - Dismiss buttons
   - Status indicators

---

## Issues to Address

### 1. Duplicate Alert Display
**Problem:** Same item showing 3 times with different vendors
```
ITALIAN SAUSAGE BULK - 20.0% (Gordon Food Service)
ITALIAN SAUSAGE BULK - 19.4% (Gordon Food Service) 
ITALIAN SAUSAGE BULK - 18.9% (Restaurant Depot)
```

**Solutions:**
- **Option A:** Group by item, show all vendor instances
- **Option B:** Show highest % change only
- **Option C:** Deduplicate by item+vendor combination

**Recommendation:** Option A - Group by item with expandable vendor details

### 2. Alert Persistence
**Problem:** No way to track which alerts user has seen/dismissed

**Solution:** New database table
```sql
CREATE TABLE alert_acknowledgments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  alert_type VARCHAR(50) NOT NULL, -- 'price_anomaly' or 'savings_opportunity'
  alert_key VARCHAR(255) NOT NULL, -- Unique identifier for the alert
  item_description TEXT NOT NULL,
  vendor_name TEXT,
  acknowledged_at TIMESTAMPTZ DEFAULT NOW(),
  dismissed BOOLEAN DEFAULT FALSE,
  notes TEXT,
  UNIQUE(user_id, alert_type, alert_key)
);
```

### 3. Navigation Flow
**Current:** Dashboard KPIs → `/analytics` (shows everything)
**Proposed:** 
- Negative Alerts → `/analytics/alerts` (price increases only)
- Positive Alerts → `/analytics/opportunities` (savings only)

---

## Implementation Plan

### Phase 1: Database & Backend (2-3 hours)

#### 1.1 Database Migration
```sql
-- Create alert acknowledgments table
-- Add RLS policies
-- Add indexes for performance
```

#### 1.2 Backend Services
**New Service:** `services/alert_management_service.py`
- `acknowledge_alert(user_id, alert_type, alert_key)`
- `dismiss_alert(user_id, alert_type, alert_key)`
- `get_alert_status(user_id, alert_type, alert_key)`
- `get_active_alerts(user_id, alert_type)`

#### 1.3 API Routes
**New Routes:** `api/routes/alert_management.py`
```python
POST   /api/v1/alerts/acknowledge
POST   /api/v1/alerts/dismiss
GET    /api/v1/alerts/status
DELETE /api/v1/alerts/{alert_id}
```

### Phase 2: Frontend Pages (3-4 hours)

#### 2.1 Price Alerts Page
**Route:** `/analytics/alerts`
**File:** `frontend/src/pages/PriceAlertsPage.tsx`

**Features:**
- List all price anomalies
- Group by item (show vendor breakdown)
- Filter: All / Active / Dismissed
- Sort: By % change, date, item name
- Actions: Dismiss, Add note, View details

**Layout:**
```
┌─────────────────────────────────────────┐
│ Price Alerts (8 active)                 │
│ [All] [Active] [Dismissed]              │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ ITALIAN SAUSAGE BULK                │ │
│ │ 3 vendors • Highest: +20.0%         │ │
│ │ ┌─────────────────────────────────┐ │ │
│ │ │ Gordon Food Service  +20.0%     │ │ │
│ │ │ Expected: $35.00 → Actual: $42  │ │ │
│ │ │ [Dismiss] [Add Note]            │ │ │
│ │ └─────────────────────────────────┘ │ │
│ │ [Show 2 more vendors ▼]            │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

#### 2.2 Savings Opportunities Page
**Route:** `/analytics/opportunities`
**File:** `frontend/src/pages/SavingsOpportunitiesPage.tsx`

**Features:**
- List all savings opportunities
- Show potential savings amount
- Filter: All / Active / Dismissed
- Sort: By savings amount, %, item name
- Actions: Dismiss, Mark as actioned, Add note

**Layout:**
```
┌─────────────────────────────────────────┐
│ Savings Opportunities (1 active)        │
│ Total Potential: $4.00/order            │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ PEPPERONI SLICED                    │ │
│ │ Save $4.00 per order                │ │
│ │                                     │ │
│ │ Current: Sysco Food Services        │ │
│ │ $38.50                              │ │
│ │                                     │ │
│ │ Switch to: Restaurant Depot         │ │
│ │ $34.50 (10.4% cheaper)              │ │
│ │                                     │ │
│ │ [Dismiss] [Mark Actioned] [Note]    │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

#### 2.3 Shared Components
**New Components:**
- `AlertCard.tsx` - Reusable alert display
- `AlertActions.tsx` - Dismiss/acknowledge buttons
- `AlertFilters.tsx` - Status filter tabs
- `AlertGrouping.tsx` - Grouped item display

### Phase 3: Dashboard Integration (1 hour)

#### 3.1 Update KPI Cards
- Change `linkTo` from `/analytics` to specific pages
- Negative Alerts → `/analytics/alerts`
- Positive Alerts → `/analytics/opportunities`

#### 3.2 Update Sidebar Navigation
Add new menu items under "Reports" or "Analytics":
```typescript
{
  title: 'Price Alerts',
  icon: AlertTriangle,
  href: '/analytics/alerts',
  badge: negativeAlertsCount
},
{
  title: 'Savings',
  icon: TrendingDown,
  href: '/analytics/opportunities',
  badge: positiveAlertsCount
}
```

### Phase 4: Alert Deduplication Logic (1-2 hours)

#### 4.1 Backend Grouping
**Service:** `services/alert_grouping_service.py`
```python
def group_price_anomalies(anomalies):
    """Group anomalies by item, aggregate vendor data"""
    grouped = {}
    for anomaly in anomalies:
        key = normalize_item_name(anomaly['item_description'])
        if key not in grouped:
            grouped[key] = {
                'item_description': anomaly['item_description'],
                'vendors': [],
                'highest_change': 0,
                'alert_count': 0
            }
        grouped[key]['vendors'].append(anomaly)
        grouped[key]['highest_change'] = max(
            grouped[key]['highest_change'],
            anomaly['change_percent']
        )
        grouped[key]['alert_count'] += 1
    return list(grouped.values())
```

---

## Technical Specifications

### API Contracts

#### POST /api/v1/alerts/acknowledge
```json
{
  "alert_type": "price_anomaly",
  "alert_key": "italian_sausage_bulk_gordon_20251023",
  "item_description": "ITALIAN SAUSAGE BULK",
  "vendor_name": "Gordon Food Service",
  "notes": "Contacted vendor about price increase"
}
```

#### GET /api/v1/alerts/status?alert_type=price_anomaly
```json
{
  "alerts": [
    {
      "alert_key": "...",
      "acknowledged": true,
      "dismissed": false,
      "acknowledged_at": "2025-11-04T...",
      "notes": "..."
    }
  ]
}
```

### Frontend State Management

**Option 1:** React Query (Recommended)
```typescript
const { data: alerts } = useQuery({
  queryKey: ['alerts', 'price_anomaly', filter],
  queryFn: () => fetchAlerts('price_anomaly', filter)
});

const dismissMutation = useMutation({
  mutationFn: dismissAlert,
  onSuccess: () => queryClient.invalidateQueries(['alerts'])
});
```

**Option 2:** Zustand Store
```typescript
interface AlertStore {
  alerts: Alert[];
  dismissedAlerts: Set<string>;
  dismissAlert: (alertKey: string) => void;
}
```

---

## Design Patterns to Follow

### 1. Existing Patterns in Codebase
- ✅ Sidebar navigation structure
- ✅ Card-based layouts
- ✅ Dark theme with slate colors
- ✅ Lucide icons
- ✅ React Query for data fetching
- ✅ Supabase RLS for security

### 2. Component Structure
```
frontend/src/
├── pages/
│   ├── PriceAlertsPage.tsx
│   └── SavingsOpportunitiesPage.tsx
├── components/
│   └── alerts/
│       ├── AlertCard.tsx
│       ├── AlertActions.tsx
│       ├── AlertFilters.tsx
│       ├── AlertGrouping.tsx
│       └── AlertNoteModal.tsx
├── services/api/
│   └── alertsApi.ts
└── types/
    └── alerts.ts
```

### 3. Styling Consistency
- Use existing color scheme (emerald for positive, red for negative)
- Match table styling from RecentlyOrderedTable
- Follow card design from existing KPI cards
- Use same button styles as throughout app

---

## Testing Requirements

### Backend Tests
- Alert acknowledgment CRUD operations
- RLS policy enforcement
- Alert grouping logic
- Duplicate prevention

### Frontend Tests
- Alert list rendering
- Filter functionality
- Dismiss action
- Navigation from dashboard

---

## Performance Considerations

### 1. Database Indexes
```sql
CREATE INDEX idx_alert_ack_user_type ON alert_acknowledgments(user_id, alert_type);
CREATE INDEX idx_alert_ack_dismissed ON alert_acknowledgments(dismissed) WHERE dismissed = false;
```

### 2. Caching Strategy
- Cache alert counts for dashboard KPIs (5 min TTL)
- Invalidate on dismiss/acknowledge actions
- Use React Query stale time

### 3. Pagination
- Implement for large alert lists (>50 items)
- Default page size: 20
- Infinite scroll or traditional pagination

---

## Security Considerations

### RLS Policies
```sql
-- Users can only see their own alert acknowledgments
CREATE POLICY "Users can view own alerts"
  ON alert_acknowledgments FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only modify their own alerts
CREATE POLICY "Users can manage own alerts"
  ON alert_acknowledgments FOR ALL
  USING (auth.uid() = user_id);
```

### Input Validation
- Sanitize alert_key format
- Validate alert_type enum
- Limit notes length (500 chars)

---

## Rollout Plan

### Phase 1: Backend Foundation (Day 1)
1. Create database migration
2. Build alert management service
3. Create API routes
4. Write backend tests

### Phase 2: Frontend Pages (Day 2)
1. Build PriceAlertsPage
2. Build SavingsOpportunitiesPage
3. Create shared components
4. Implement dismiss functionality

### Phase 3: Integration (Day 3)
1. Update dashboard KPI links
2. Add sidebar navigation
3. Test end-to-end flow
4. Fix any bugs

### Phase 4: Polish (Day 4)
1. Add loading states
2. Error handling
3. Empty states
4. Mobile responsiveness

---

## Success Metrics

### User Experience
- ✅ Users can view all alerts in one place
- ✅ Users can dismiss alerts they've addressed
- ✅ Alerts don't show duplicates unnecessarily
- ✅ Clear path from dashboard to alert details

### Technical
- ✅ Page load < 1s
- ✅ No N+1 queries
- ✅ Proper error handling
- ✅ Mobile responsive

---

## Open Questions

1. **Alert Expiry:** Should dismissed alerts auto-expire after X days?
2. **Notifications:** Email/push notifications for new critical alerts?
3. **Alert History:** Keep history of all past alerts or just active?
4. **Bulk Actions:** Dismiss multiple alerts at once?
5. **Alert Priority:** Add severity levels (critical/warning/info)?

---

## Next Steps

1. Review this audit document
2. Confirm approach and priorities
3. Create database migration
4. Build backend services
5. Create frontend pages
6. Integrate with dashboard
7. Test and deploy

---

**Estimated Total Time:** 8-12 hours
**Priority:** High (Core feature for user engagement)
**Dependencies:** None (all APIs exist)


---

## CRITICAL ADDITION: User-Configurable Alert Thresholds

### Overview
Alerts should be **automatically generated** based on user-defined variance thresholds, not just filtered views. The system already tracks 7-day and 28-day averages - we need to add threshold triggers.

### Alert Generation Logic

#### Current State
The `get_items_list()` in `price_analytics_service.py` already calculates:
- `avg_price_7day` - 7-day rolling average
- `avg_price_28day` - 28-day rolling average  
- `price_change_7day_percent` - % change from 7-day avg
- `price_change_28day_percent` - % change from 28-day avg

#### New Threshold System

**User Preferences Table Addition:**
```sql
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS
  price_alert_threshold_7day DECIMAL(5,2) DEFAULT 10.0,
ADD COLUMN IF NOT EXISTS
  price_alert_threshold_28day DECIMAL(5,2) DEFAULT 15.0,
ADD COLUMN IF NOT EXISTS
  price_drop_alert_threshold_7day DECIMAL(5,2) DEFAULT 10.0,
ADD COLUMN IF NOT EXISTS
  price_drop_alert_threshold_28day DECIMAL(5,2) DEFAULT 15.0;
```

**Default Thresholds:**
- 7-day variance: ±10%
- 28-day variance: ±15%

### Alert Trigger Logic

```python
def generate_alerts_for_user(user_id: str, user_thresholds: dict):
    """
    Generate alerts based on user-defined thresholds
    
    Triggers:
    1. Price INCREASE > threshold vs 7-day avg
    2. Price INCREASE > threshold vs 28-day avg
    3. Price DECREASE > threshold vs 7-day avg (savings opportunity)
    4. Price DECREASE > threshold vs 28-day avg (savings opportunity)
    """
    
    items = get_items_list(user_id, days_back=90)
    
    negative_alerts = []
    positive_alerts = []
    
    for item in items:
        # Check 7-day threshold
        if item['price_change_7day_percent']:
            if item['price_change_7day_percent'] > user_thresholds['increase_7day']:
                negative_alerts.append({
                    'item': item['description'],
                    'vendor': item['last_paid_vendor'],
                    'change_percent': item['price_change_7day_percent'],
                    'expected': item['avg_price_7day'],
                    'actual': item['last_paid_price'],
                    'trigger': '7_day_avg',
                    'date': item['last_paid_date']
                })
            elif item['price_change_7day_percent'] < -user_thresholds['decrease_7day']:
                positive_alerts.append({
                    'item': item['description'],
                    'vendor': item['last_paid_vendor'],
                    'savings_percent': abs(item['price_change_7day_percent']),
                    'expected': item['avg_price_7day'],
                    'actual': item['last_paid_price'],
                    'trigger': '7_day_avg'
                })
        
        # Check 28-day threshold
        if item['price_change_28day_percent']:
            if item['price_change_28day_percent'] > user_thresholds['increase_28day']:
                negative_alerts.append({
                    'item': item['description'],
                    'vendor': item['last_paid_vendor'],
                    'change_percent': item['price_change_28day_percent'],
                    'expected': item['avg_price_28day'],
                    'actual': item['last_paid_price'],
                    'trigger': '28_day_avg',
                    'date': item['last_paid_date']
                })
            elif item['price_change_28day_percent'] < -user_thresholds['decrease_28day']:
                positive_alerts.append({
                    'item': item['description'],
                    'vendor': item['last_paid_vendor'],
                    'savings_percent': abs(item['price_change_28day_percent']),
                    'expected': item['avg_price_28day'],
                    'actual': item['last_paid_price'],
                    'trigger': '28_day_avg'
                })
    
    return {
        'negative_alerts': deduplicate_alerts(negative_alerts),
        'positive_alerts': deduplicate_alerts(positive_alerts)
    }
```

### Deduplication Strategy

**Problem:** Same item can trigger both 7-day and 28-day thresholds

**Solution:** Show highest variance, indicate both triggers
```python
def deduplicate_alerts(alerts):
    """Group by item+vendor, keep highest variance, track all triggers"""
    grouped = {}
    for alert in alerts:
        key = f"{alert['item']}_{alert['vendor']}"
        if key not in grouped:
            grouped[key] = alert
            grouped[key]['triggers'] = [alert['trigger']]
        else:
            # Keep alert with highest variance
            if alert['change_percent'] > grouped[key]['change_percent']:
                grouped[key] = alert
            # Track all triggers
            if alert['trigger'] not in grouped[key]['triggers']:
                grouped[key]['triggers'].append(alert['trigger'])
    
    return list(grouped.values())
```

### User Settings UI

**New Page:** `/settings/alerts`
**Component:** `AlertThresholdSettings.tsx`

```typescript
interface AlertThresholds {
  price_increase_7day: number;    // Default: 10%
  price_increase_28day: number;   // Default: 15%
  price_decrease_7day: number;    // Default: 10%
  price_decrease_28day: number;   // Default: 15%
}
```

**UI Layout:**
```
┌─────────────────────────────────────────┐
│ Alert Threshold Settings                │
├─────────────────────────────────────────┤
│ Price Increase Alerts                   │
│ ┌─────────────────────────────────────┐ │
│ │ 7-Day Average Threshold             │ │
│ │ [10]% Alert when price increases    │ │
│ │ more than this vs 7-day average     │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ 28-Day Average Threshold            │ │
│ │ [15]% Alert when price increases    │ │
│ │ more than this vs 28-day average    │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Savings Opportunity Alerts              │
│ ┌─────────────────────────────────────┐ │
│ │ 7-Day Average Threshold             │ │
│ │ [10]% Alert when price decreases    │ │
│ │ more than this vs 7-day average     │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ 28-Day Average Threshold            │ │
│ │ [15]% Alert when price decreases    │ │
│ │ more than this vs 28-day average    │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [Save Settings]                         │
└─────────────────────────────────────────┘
```

### API Updates

#### New Endpoint: GET /api/v1/analytics/alerts
```python
@router.get("/alerts")
async def get_user_alerts(
    current_user: str = Depends(get_current_user)
):
    """
    Get alerts based on user's threshold settings
    Replaces price-anomalies endpoint for dashboard
    """
    # Get user thresholds
    thresholds = await user_preferences_service.get_alert_thresholds(current_user)
    
    # Generate alerts
    alerts = generate_alerts_for_user(current_user, thresholds)
    
    return {
        "negative_alerts": alerts['negative_alerts'],
        "positive_alerts": alerts['positive_alerts'],
        "thresholds_used": thresholds
    }
```

#### Update Endpoint: PUT /api/v1/user-preferences/alert-thresholds
```python
@router.put("/alert-thresholds")
async def update_alert_thresholds(
    thresholds: AlertThresholdsUpdate,
    current_user: str = Depends(get_current_user)
):
    """Update user's alert threshold preferences"""
    await user_preferences_service.update_alert_thresholds(
        current_user,
        thresholds
    )
    return {"success": True}
```

### Alert Display Updates

**Show trigger context in alerts:**
```
┌─────────────────────────────────────────┐
│ ITALIAN SAUSAGE BULK                    │
│ Gordon Food Service                     │
│                                         │
│ +20.0% vs 7-day average ⚠️              │
│ +18.5% vs 28-day average ⚠️             │
│                                         │
│ Expected (7d): $35.00                   │
│ Expected (28d): $35.50                  │
│ Actual: $42.00                          │
│                                         │
│ Your threshold: 10% (7d), 15% (28d)     │
│ [Dismiss] [Adjust Threshold]            │
└─────────────────────────────────────────┘
```

### Implementation Priority

**Phase 1: Threshold System (CRITICAL)**
1. Add threshold columns to user_preferences
2. Create alert generation service
3. Update /analytics/alerts endpoint
4. Update dashboard to use new endpoint

**Phase 2: Settings UI**
1. Create AlertThresholdSettings page
2. Add to sidebar under Settings
3. Implement threshold update API

**Phase 3: Alert Pages**
1. Build dedicated alert pages
2. Add dismiss functionality
3. Show threshold context

### Migration Path

**Backward Compatibility:**
- Keep existing `/price-anomalies` endpoint for now
- New `/alerts` endpoint uses threshold system
- Dashboard switches to new endpoint
- Deprecate old endpoint after 30 days

### Testing Scenarios

1. **Default thresholds work** - New user gets 10%/15% defaults
2. **Custom thresholds trigger correctly** - User sets 5%, alerts fire at 5%+
3. **Both triggers show** - Item exceeds both 7d and 28d thresholds
4. **Deduplication works** - Same item/vendor only shows once
5. **Threshold updates apply immediately** - Change setting, alerts update

---

## Updated Database Schema

```sql
-- Add to existing user_preferences table
ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS price_alert_threshold_7day DECIMAL(5,2) DEFAULT 10.0,
ADD COLUMN IF NOT EXISTS price_alert_threshold_28day DECIMAL(5,2) DEFAULT 15.0,
ADD COLUMN IF NOT EXISTS price_drop_alert_threshold_7day DECIMAL(5,2) DEFAULT 10.0,
ADD COLUMN IF NOT EXISTS price_drop_alert_threshold_28day DECIMAL(5,2) DEFAULT 15.0,
ADD COLUMN IF NOT EXISTS alert_thresholds_updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add constraint to ensure reasonable thresholds
ALTER TABLE user_preferences
ADD CONSTRAINT reasonable_thresholds CHECK (
  price_alert_threshold_7day BETWEEN 1.0 AND 100.0 AND
  price_alert_threshold_28day BETWEEN 1.0 AND 100.0 AND
  price_drop_alert_threshold_7day BETWEEN 1.0 AND 100.0 AND
  price_drop_alert_threshold_28day BETWEEN 1.0 AND 100.0
);
```

---

## Revised Timeline

**Phase 1: Threshold System (Day 1-2)** - 6-8 hours
- Database migration for thresholds
- Alert generation service with threshold logic
- Update analytics endpoints
- Update dashboard KPIs

**Phase 2: Settings UI (Day 2-3)** - 3-4 hours
- Alert threshold settings page
- Update user preferences API
- Add to navigation

**Phase 3: Alert Management Pages (Day 3-4)** - 6-8 hours
- Dedicated alert pages
- Dismiss functionality
- Alert acknowledgment system

**Phase 4: Polish (Day 4-5)** - 2-3 hours
- Show threshold context in alerts
- "Adjust threshold" quick action
- Alert history/trends

**Total Estimated Time:** 17-23 hours

---

## Key Decisions Made

1. ✅ **Automatic alert generation** based on thresholds (not filters)
2. ✅ **User-configurable thresholds** per time period
3. ✅ **Deduplication** shows highest variance, tracks all triggers
4. ✅ **Default thresholds** 10% (7d), 15% (28d)
5. ✅ **Both increase and decrease** alerts (negative/positive)
6. ✅ **Threshold context** shown in alert details

This approach gives users control while automating the alert logic based on their actual price history.
