# Alerts Management System - Final Build Plan
## Using 100% Existing Data - No New Backend Logic Required

---

## Executive Summary

Build two new frontend pages that display existing alert data with user-configurable thresholds and dismiss functionality. **All data already exists** - we're just creating new views and adding threshold preferences.

---

## What Already Exists ✅

### Backend APIs (Ready to Use)
1. ✅ `/api/v1/analytics/items-list` - Returns all items with 7d/28d averages
2. ✅ `/api/v1/analytics/price-anomalies` - Returns price increase alerts  
3. ✅ `/api/v1/analytics/savings-opportunities` - Returns savings alerts
4. ✅ `/api/v1/user-preferences` - User settings storage

### Data Points Available
- ✅ `avg_price_7day` - 7-day rolling average
- ✅ `avg_price_28day` - 28-day rolling average
- ✅ `price_change_7day_percent` - % change from 7-day avg
- ✅ `price_change_28day_percent` - % change from 28-day avg
- ✅ `last_paid_price` - Most recent price
- ✅ `last_paid_vendor` - Most recent vendor
- ✅ `last_paid_date` - Most recent purchase date

---

## What We're Building 🔨

### 1. Two New Frontend Pages
- `/analytics/alerts` - Price increase alerts page
- `/analytics/opportunities` - Savings opportunities page

### 2. User Threshold Settings
- Add threshold preferences to existing `user_preferences` table
- Settings UI to configure alert sensitivity

### 3. Alert Acknowledgment System
- Track which alerts user has dismissed
- Filter active vs dismissed alerts

### 4. Dashboard KPI Updates
- Update links to point to new pages
- Show alert counts

---

## Complete Implementation Checklist

### Phase 1: Database & User Preferences (2 hours)

#### 1.1 Add Threshold Columns to user_inventory_preferences
```sql
-- ============================================================================
-- MIGRATION 025: Alert Thresholds
-- ============================================================================
-- Description: Add user-configurable alert thresholds to preferences
-- Author: Alerts System Implementation
-- Date: 2025-11-04
-- Dependencies: Requires user_inventory_preferences table
-- ============================================================================

-- Add threshold columns
ALTER TABLE user_inventory_preferences 
ADD COLUMN IF NOT EXISTS price_alert_threshold_7day DECIMAL(5,2) DEFAULT 10.0,
ADD COLUMN IF NOT EXISTS price_alert_threshold_28day DECIMAL(5,2) DEFAULT 15.0,
ADD COLUMN IF NOT EXISTS price_drop_alert_threshold_7day DECIMAL(5,2) DEFAULT 10.0,
ADD COLUMN IF NOT EXISTS price_drop_alert_threshold_28day DECIMAL(5,2) DEFAULT 15.0;

-- Add comments
COMMENT ON COLUMN user_inventory_preferences.price_alert_threshold_7day IS 'Alert if price increases > this % vs 7-day avg';
COMMENT ON COLUMN user_inventory_preferences.price_alert_threshold_28day IS 'Alert if price increases > this % vs 28-day avg';
COMMENT ON COLUMN user_inventory_preferences.price_drop_alert_threshold_7day IS 'Alert if price decreases > this % vs 7-day avg';
COMMENT ON COLUMN user_inventory_preferences.price_drop_alert_threshold_28day IS 'Alert if price decreases > this % vs 28-day avg';

-- Constraint for reasonable values
ALTER TABLE user_inventory_preferences
ADD CONSTRAINT reasonable_alert_thresholds CHECK (
  price_alert_threshold_7day BETWEEN 1.0 AND 100.0 AND
  price_alert_threshold_28day BETWEEN 1.0 AND 100.0 AND
  price_drop_alert_threshold_7day BETWEEN 1.0 AND 100.0 AND
  price_drop_alert_threshold_28day BETWEEN 1.0 AND 100.0
);

-- Verification
DO $
BEGIN
    ASSERT (SELECT COUNT(*) FROM information_schema.columns 
            WHERE table_name = 'user_inventory_preferences' 
            AND column_name LIKE '%alert_threshold%') = 4,
           'Not all threshold columns were created';
    
    RAISE NOTICE '✅ Alert threshold columns added successfully';
END $;
```

#### 1.2 Create Alert Acknowledgments Table
```sql
-- ============================================================================
-- MIGRATION 026: Alert Acknowledgments
-- ============================================================================
-- Description: Track dismissed and acknowledged alerts
-- Author: Alerts System Implementation
-- Date: 2025-11-04
-- Dependencies: Requires auth.users table
-- ============================================================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Track dismissed/acknowledged alerts
CREATE TABLE IF NOT EXISTS alert_acknowledgments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL, -- 'price_increase' or 'savings_opportunity'
  alert_key VARCHAR(255) NOT NULL, -- item_vendor_date combo
  item_description TEXT NOT NULL,
  vendor_name TEXT,
  acknowledged_at TIMESTAMPTZ DEFAULT NOW(),
  dismissed BOOLEAN DEFAULT FALSE,
  notes TEXT,
  UNIQUE(user_id, alert_type, alert_key)
);

-- Enable RLS
ALTER TABLE alert_acknowledgments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own acknowledgments" ON alert_acknowledgments;
DROP POLICY IF EXISTS "Users can manage own acknowledgments" ON alert_acknowledgments;

-- RLS Policies
CREATE POLICY "Users can view own acknowledgments"
  ON alert_acknowledgments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own acknowledgments"
  ON alert_acknowledgments FOR ALL
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_alert_ack_user_type ON alert_acknowledgments(user_id, alert_type);
CREATE INDEX IF NOT EXISTS idx_alert_ack_active ON alert_acknowledgments(user_id, dismissed) WHERE dismissed = false;

-- Verification
DO $
BEGIN
    ASSERT (SELECT COUNT(*) FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'alert_acknowledgments') = 1,
           'alert_acknowledgments table was not created';
    
    RAISE NOTICE '✅ alert_acknowledgments table created successfully';
    RAISE NOTICE '✅ RLS enabled and policies created';
    RAISE NOTICE '✅ Indexes created for performance';
END $;
```

---

### Phase 2: Backend Services (3 hours)

#### 2.1 Alert Generation Service
**File:** `services/alert_generation_service.py` (UPDATE EXISTING)

Add this new method to the existing AlertGenerationService class:

```python
def generate_alerts_with_thresholds(self, user_id: str, thresholds: dict):
    """
    Generate alerts based on user thresholds
    Uses existing items-list data
    
    Args:
        user_id: User ID
        thresholds: Dict with keys: increase_7day, increase_28day, decrease_7day, decrease_28day
    
    Returns:
        Dict with negative_alerts, positive_alerts, and thresholds_used
    """
    from services.price_analytics_service import PriceAnalyticsService
    from database.supabase_client import get_supabase_service_client
    
    # Get all items with price data
    supabase = get_supabase_service_client()
    price_service = PriceAnalyticsService(supabase)
    items = price_service.get_items_list(user_id, days_back=90)
    
    negative_alerts = []
    positive_alerts = []
    
    for item in items:
        # Check 7-day threshold for increases
        if item.get('price_change_7day_percent'):
            if item['price_change_7day_percent'] > thresholds['increase_7day']:
                negative_alerts.append({
                    'alert_key': f"{item['description']}_{item['last_paid_vendor']}_{item['last_paid_date']}",
                    'item_description': item['description'],
                    'vendor_name': item['last_paid_vendor'],
                    'change_percent': item['price_change_7day_percent'],
                    'expected_price': item['avg_price_7day'],
                    'actual_price': item['last_paid_price'],
                    'trigger': '7_day_avg',
                    'date': item['last_paid_date']
                })
        
        # Check 28-day threshold for increases
        if item.get('price_change_28day_percent'):
            if item['price_change_28day_percent'] > thresholds['increase_28day']:
                # Check if already added from 7-day
                existing = next((a for a in negative_alerts 
                               if a['item_description'] == item['description'] 
                               and a['vendor_name'] == item['last_paid_vendor']), None)
                if existing:
                    existing['triggers'] = ['7_day_avg', '28_day_avg']
                    existing['change_percent_28d'] = item['price_change_28day_percent']
                    existing['expected_price_28d'] = item['avg_price_28day']
                else:
                    negative_alerts.append({
                        'alert_key': f"{item['description']}_{item['last_paid_vendor']}_{item['last_paid_date']}",
                        'item_description': item['description'],
                        'vendor_name': item['last_paid_vendor'],
                        'change_percent': item['price_change_28day_percent'],
                        'expected_price': item['avg_price_28day'],
                        'actual_price': item['last_paid_price'],
                        'trigger': '28_day_avg',
                        'date': item['last_paid_date']
                    })
        
        # Check for price decreases (savings opportunities)
        if item.get('price_change_7day_percent'):
            if item['price_change_7day_percent'] < -thresholds['decrease_7day']:
                positive_alerts.append({
                    'alert_key': f"{item['description']}_{item['last_paid_vendor']}_{item['last_paid_date']}",
                    'item_description': item['description'],
                    'vendor_name': item['last_paid_vendor'],
                    'savings_percent': abs(item['price_change_7day_percent']),
                    'expected_price': item['avg_price_7day'],
                    'actual_price': item['last_paid_price'],
                    'savings_amount': item['avg_price_7day'] - item['last_paid_price'],
                    'trigger': '7_day_avg',
                    'date': item['last_paid_date']
                })
    
    return {
        'negative_alerts': negative_alerts,
        'positive_alerts': positive_alerts,
        'thresholds_used': thresholds
    }
```

#### 2.2 Alert Management Service
**File:** `services/alert_management_service.py` (NEW)

```python
"""
Alert Management Service
Manages alert acknowledgments and dismissals
Pattern: Follows services/user_preferences_service.py structure
"""
import os
from typing import Dict, List, Optional
from datetime import datetime
from supabase import create_client, Client
from dotenv import load_dotenv
import logging

load_dotenv()
logger = logging.getLogger(__name__)


class AlertManagementService:
    """Manage alert acknowledgments and dismissals"""
    
    def __init__(self):
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        
        if not supabase_url or not supabase_key:
            raise ValueError("Supabase credentials not found in environment")
        
        self.client: Client = create_client(supabase_url, supabase_key)
    
    def acknowledge_alert(self, user_id: str, alert_data: dict) -> Dict:
        """
        Mark alert as acknowledged
        
        Args:
            user_id: User ID
            alert_data: Dict with alert_type, alert_key, item_description, vendor_name, notes
        
        Returns:
            Created acknowledgment record
        """
        result = self.client.table('alert_acknowledgments').insert({
            'user_id': user_id,
            'alert_type': alert_data['alert_type'],
            'alert_key': alert_data['alert_key'],
            'item_description': alert_data['item_description'],
            'vendor_name': alert_data.get('vendor_name'),
            'dismissed': False,
            'notes': alert_data.get('notes')
        }).execute()
        
        logger.info(f"Acknowledged alert for user {user_id}: {alert_data['alert_key']}")
        return result.data[0] if result.data else {}
    
    def dismiss_alert(self, user_id: str, alert_key: str, alert_type: str) -> Dict:
        """
        Dismiss an alert
        
        Args:
            user_id: User ID
            alert_key: Unique alert identifier
            alert_type: Type of alert (price_increase or savings_opportunity)
        
        Returns:
            Updated acknowledgment record
        """
        result = self.client.table('alert_acknowledgments').upsert({
            'user_id': user_id,
            'alert_type': alert_type,
            'alert_key': alert_key,
            'dismissed': True
        }).execute()
        
        logger.info(f"Dismissed alert for user {user_id}: {alert_key}")
        return result.data[0] if result.data else {}
    
    def get_dismissed_alerts(self, user_id: str, alert_type: str) -> List[str]:
        """
        Get list of dismissed alert keys
        
        Args:
            user_id: User ID
            alert_type: Type of alert to filter
        
        Returns:
            List of dismissed alert keys
        """
        result = self.client.table('alert_acknowledgments')\
            .select('alert_key')\
            .eq('user_id', user_id)\
            .eq('alert_type', alert_type)\
            .eq('dismissed', True)\
            .execute()
        return [r['alert_key'] for r in result.data]
```

#### 2.3 API Routes
**File:** `api/routes/alert_management.py` (NEW)

```python
"""
Alert Management API Routes
Endpoints for price alerts and savings opportunities
Pattern: Follows api/routes/price_analytics.py structure
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
import logging

from api.middleware.auth import get_current_user
from services.alert_management_service import AlertManagementService
from services.alert_generation_service import AlertGenerationService
from services.user_preferences_service import UserPreferencesService
from services.error_sanitizer import ErrorSanitizer

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/alerts", tags=["alerts"])


# Request models
class DismissAlertRequest(BaseModel):
    alert_key: str
    alert_type: str


class UpdateThresholdsRequest(BaseModel):
    price_alert_threshold_7day: Optional[float] = None
    price_alert_threshold_28day: Optional[float] = None
    price_drop_alert_threshold_7day: Optional[float] = None
    price_drop_alert_threshold_28day: Optional[float] = None

@router.get("/price-increases")
async def get_price_increase_alerts(
    current_user: str = Depends(get_current_user)
):
    """Get price increase alerts based on user thresholds"""
    try:
        # Get user thresholds
        prefs_service = UserPreferencesService()
        prefs = prefs_service.get_preferences(current_user)
    
        thresholds = {
            'increase_7day': prefs.get('price_alert_threshold_7day', 10.0),
            'increase_28day': prefs.get('price_alert_threshold_28day', 15.0),
            'decrease_7day': prefs.get('price_drop_alert_threshold_7day', 10.0),
            'decrease_28day': prefs.get('price_drop_alert_threshold_28day', 15.0)
        }
        
        # Generate alerts
        alert_gen_service = AlertGenerationService()
        alerts = alert_gen_service.generate_alerts_with_thresholds(current_user, thresholds)
        
        # Get dismissed alerts
        alert_mgmt_service = AlertManagementService()
        dismissed = alert_mgmt_service.get_dismissed_alerts(current_user, 'price_increase')
        
        # Filter out dismissed
        active_alerts = [a for a in alerts['negative_alerts'] if a['alert_key'] not in dismissed]
        
        return {
            'alerts': active_alerts,
            'total_count': len(active_alerts),
            'thresholds': thresholds
        }
    except Exception as e:
        raise ErrorSanitizer.create_http_exception(
            e, status_code=500, user_message="Failed to fetch price increase alerts"
        )

@router.get("/savings-opportunities")
async def get_savings_opportunities(
    current_user: str = Depends(get_current_user)
):
    """Get savings opportunity alerts based on user thresholds"""
    try:
        # Get user thresholds
        prefs_service = UserPreferencesService()
        prefs = prefs_service.get_preferences(current_user)
        
        thresholds = {
            'increase_7day': prefs.get('price_alert_threshold_7day', 10.0),
            'increase_28day': prefs.get('price_alert_threshold_28day', 15.0),
            'decrease_7day': prefs.get('price_drop_alert_threshold_7day', 10.0),
            'decrease_28day': prefs.get('price_drop_alert_threshold_28day', 15.0)
        }
        
        # Generate alerts
        alert_gen_service = AlertGenerationService()
        alerts = alert_gen_service.generate_alerts_with_thresholds(current_user, thresholds)
        
        # Get dismissed alerts
        alert_mgmt_service = AlertManagementService()
        dismissed = alert_mgmt_service.get_dismissed_alerts(current_user, 'savings_opportunity')
        
        # Filter out dismissed
        active_alerts = [a for a in alerts['positive_alerts'] if a['alert_key'] not in dismissed]
        
        return {
            'alerts': active_alerts,
            'total_count': len(active_alerts),
            'thresholds': thresholds
        }
    except Exception as e:
        raise ErrorSanitizer.create_http_exception(
            e, status_code=500, user_message="Failed to fetch savings opportunities"
        )

@router.post("/dismiss")
async def dismiss_alert(
    request: DismissAlertRequest,
    current_user: str = Depends(get_current_user)
):
    """Dismiss an alert"""
    try:
        alert_service = AlertManagementService()
        alert_service.dismiss_alert(current_user, request.alert_key, request.alert_type)
        return {"success": True, "message": "Alert dismissed successfully"}
    except Exception as e:
        raise ErrorSanitizer.create_http_exception(
            e, status_code=500, user_message="Failed to dismiss alert"
        )


@router.put("/thresholds")
async def update_thresholds(
    request: UpdateThresholdsRequest,
    current_user: str = Depends(get_current_user)
):
    """Update user alert thresholds"""
    try:
        prefs_service = UserPreferencesService()
        
        # Build updates dict (only include provided values)
        updates = {}
        if request.price_alert_threshold_7day is not None:
            updates['price_alert_threshold_7day'] = request.price_alert_threshold_7day
        if request.price_alert_threshold_28day is not None:
            updates['price_alert_threshold_28day'] = request.price_alert_threshold_28day
        if request.price_drop_alert_threshold_7day is not None:
            updates['price_drop_alert_threshold_7day'] = request.price_drop_alert_threshold_7day
        if request.price_drop_alert_threshold_28day is not None:
            updates['price_drop_alert_threshold_28day'] = request.price_drop_alert_threshold_28day
        
        if not updates:
            raise HTTPException(status_code=400, detail="No threshold values provided")
        
        prefs_service.update_preferences(current_user, updates)
        return {"success": True, "message": "Thresholds updated successfully", "updated": updates}
    except HTTPException:
        raise
    except Exception as e:
        raise ErrorSanitizer.create_http_exception(
            e, status_code=500, user_message="Failed to update thresholds"
        )
```

---

### Phase 3: Frontend Pages (4 hours)

#### 3.1 Price Alerts Page
**File:** `frontend/src/pages/PriceAlertsPage.tsx`

```typescript
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tantml:react-query';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { alertsApi } from '@/services/api/alertsApi';

export function PriceAlertsPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'active' | 'dismissed'>('active');
  const queryClient = useQueryClient();
  
  const { data: alerts, isLoading } = useQuery({
    queryKey: ['alerts', 'price-increases'],
    queryFn: () => alertsApi.getPriceIncreaseAlerts()
  });
  
  const dismissMutation = useMutation({
    mutationFn: (alertKey: string) => 
      alertsApi.dismissAlert(alertKey, 'price_increase'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    }
  });
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <AlertTriangle className="h-8 w-8 text-red-400" />
            Price Alerts
          </h1>
          <p className="text-slate-400 mt-2">
            {alerts?.total_count || 0} items with unusual price increases
          </p>
        </div>
        
        <Button variant="outline" onClick={() => navigate('/settings/alerts')}>
          Adjust Thresholds
        </Button>
      </div>
      
      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="dismissed">Dismissed</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="space-y-4">
        {alerts?.alerts.map((alert) => (
          <Card key={alert.alert_key} className="p-6 bg-card-dark border-red-500/30">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white">
                  {alert.item_description}
                </h3>
                <p className="text-slate-400 mt-1">{alert.vendor_name}</p>
                
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-4">
                    <span className="text-red-400 font-bold text-2xl">
                      +{alert.change_percent}%
                    </span>
                    <span className="text-slate-400">vs {alert.trigger.replace('_', '-')} average</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-slate-500">Expected</p>
                      <p className="text-lg text-white">${alert.expected_price.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Actual</p>
                      <p className="text-lg text-red-400">${alert.actual_price.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => dismissMutation.mutate(alert.alert_key)}
              >
                Dismiss
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

#### 3.2 API Client
**File:** `frontend/src/services/api/alertsApi.ts`

```typescript
import { apiClient } from './client';

export interface Alert {
  alert_key: string;
  item_description: string;
  vendor_name: string;
  change_percent?: number;
  savings_percent?: number;
  expected_price: number;
  actual_price: number;
  savings_amount?: number;
  trigger: string;
  date: string;
}

export interface AlertsResponse {
  alerts: Alert[];
  total_count: number;
  thresholds: {
    increase_7day: number;
    increase_28day: number;
    decrease_7day: number;
    decrease_28day: number;
  };
}

export const alertsApi = {
  async getPriceIncreaseAlerts(): Promise<AlertsResponse> {
    const response = await apiClient.get('/api/v1/alerts/price-increases');
    return response.data;
  },

  async getSavingsOpportunities(): Promise<AlertsResponse> {
    const response = await apiClient.get('/api/v1/alerts/savings-opportunities');
    return response.data;
  },

  async dismissAlert(alertKey: string, alertType: string): Promise<void> {
    await apiClient.post('/api/v1/alerts/dismiss', {
      alert_key: alertKey,
      alert_type: alertType,
    });
  },

  async updateThresholds(thresholds: {
    price_alert_threshold_7day?: number;
    price_alert_threshold_28day?: number;
    price_drop_alert_threshold_7day?: number;
    price_drop_alert_threshold_28day?: number;
  }): Promise<void> {
    await apiClient.put('/api/v1/alerts/thresholds', thresholds);
  },
};
```

#### 3.3 Savings Opportunities Page
**File:** `frontend/src/pages/SavingsOpportunitiesPage.tsx`

```typescript
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tantml:react-query';
import { useNavigate } from 'react-router-dom';
import { TrendingDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { alertsApi } from '@/services/api/alertsApi';

export function SavingsOpportunitiesPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'active' | 'dismissed'>('active');
  const queryClient = useQueryClient();
  
  const { data: alerts, isLoading } = useQuery({
    queryKey: ['alerts', 'savings-opportunities'],
    queryFn: () => alertsApi.getSavingsOpportunities()
  });
  
  const dismissMutation = useMutation({
    mutationFn: (alertKey: string) => 
      alertsApi.dismissAlert(alertKey, 'savings_opportunity'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    }
  });
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <TrendingDown className="h-8 w-8 text-green-400" />
            Savings Opportunities
          </h1>
          <p className="text-slate-400 mt-2">
            {alerts?.total_count || 0} items with potential savings
          </p>
        </div>
        
        <Button variant="outline" onClick={() => navigate('/settings/alerts')}>
          Adjust Thresholds
        </Button>
      </div>
      
      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="dismissed">Dismissed</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="space-y-4">
        {alerts?.alerts.map((alert) => (
          <Card key={alert.alert_key} className="p-6 bg-card-dark border-green-500/30">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white">
                  {alert.item_description}
                </h3>
                <p className="text-slate-400 mt-1">{alert.vendor_name}</p>
                
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-4">
                    <span className="text-green-400 font-bold text-2xl">
                      -{alert.savings_percent}%
                    </span>
                    <span className="text-slate-400">vs {alert.trigger.replace('_', '-')} average</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-slate-500">Expected</p>
                      <p className="text-lg text-white">${alert.expected_price.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Actual</p>
                      <p className="text-lg text-green-400">${alert.actual_price.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Savings</p>
                      <p className="text-lg text-green-400">${alert.savings_amount?.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => dismissMutation.mutate(alert.alert_key)}
              >
                Dismiss
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

#### 3.3 Alert Threshold Settings Page
**File:** `frontend/src/pages/AlertSettingsPage.tsx`

Form to adjust the 4 threshold values with sliders/inputs.

---

### Phase 4: Dashboard Integration (1 hour)

#### 4.1 Update Dashboard KPI Links
**File:** `frontend/src/pages/DashboardPageNew.tsx`

Update the AlertKPICard components to link to the new alert pages:

```typescript
<AlertKPICard
  title="Negative Alerts"
  count={kpiData?.negativeAlerts || 0}
  icon={AlertTriangle}
  type="negative"
  loading={loading}
  linkTo="/analytics/alerts"  // ← Changed from /analytics
  subtitle="Items requiring attention"
/>

<AlertKPICard
  title="Positive Alerts"
  count={kpiData?.positiveAlerts || 0}
  icon={TrendingDown}
  type="positive"
  loading={loading}
  linkTo="/analytics/opportunities"  // ← Changed from /analytics
  subtitle="Savings opportunities"
/>
```

#### 4.2 Add Routes
**File:** `frontend/src/App.tsx` or routing config

```typescript
<Route path="/analytics/alerts" element={<PriceAlertsPage />} />
<Route path="/analytics/opportunities" element={<SavingsOpportunitiesPage />} />
<Route path="/settings/alerts" element={<AlertSettingsPage />} />
```

#### 4.3 Update Sidebar (Optional)
**File:** `frontend/src/components/dashboard/DashboardSidebar.tsx`

Add under "Reports" section:
```typescript
{
  title: 'Price Alerts',
  icon: AlertTriangle,
  href: '/analytics/alerts',
},
{
  title: 'Savings',
  icon: TrendingDown,
  href: '/analytics/opportunities',
}
```

---

## Complete File Checklist

### Backend Files
- [ ] `database/migrations/025_alert_thresholds.sql` - NEW (add threshold columns)
- [ ] `database/migrations/026_alert_acknowledgments.sql` - NEW (create acknowledgments table)
- [ ] `services/alert_generation_service.py` - UPDATE (add generate_alerts_with_thresholds method)
- [ ] `services/alert_management_service.py` - NEW (acknowledgment/dismissal logic)
- [ ] `api/routes/alert_management.py` - NEW (alert endpoints)
- [ ] `api/main.py` - UPDATE (register alert_management router)

### Frontend Files
- [ ] `frontend/src/pages/PriceAlertsPage.tsx` - NEW
- [ ] `frontend/src/pages/SavingsOpportunitiesPage.tsx` - NEW
- [ ] `frontend/src/pages/AlertSettingsPage.tsx` - NEW
- [ ] `frontend/src/pages/DashboardPageNew.tsx` - UPDATE (change KPI links)
- [ ] `frontend/src/App.tsx` - UPDATE (add routes)
- [ ] `frontend/src/components/dashboard/DashboardSidebar.tsx` - UPDATE (optional)
- [ ] `frontend/src/services/api/alertsApi.ts` - NEW (API client)
- [ ] `frontend/src/types/alerts.ts` - NEW (TypeScript types)

---

## Testing Checklist

- [ ] User can set custom thresholds
- [ ] Alerts generate based on thresholds
- [ ] Clicking dashboard KPI navigates to correct page
- [ ] Dismiss button removes alert from active view
- [ ] Dismissed alerts appear in "Dismissed" tab
- [ ] Alert counts update after dismissing
- [ ] Per-vendor filtering works
- [ ] Mobile responsive

---

## Estimated Time: 10-12 hours total

- Phase 1 (Database): 2 hours
- Phase 2 (Backend): 3 hours  
- Phase 3 (Frontend Pages): 4 hours
- Phase 4 (Integration): 1 hour
- Testing & Polish: 2 hours

---

## Key Design Decisions

1. ✅ **Use existing data** - No new analytics calculations
2. ✅ **User-configurable thresholds** - Stored in user_preferences
3. ✅ **Dismiss functionality** - Separate acknowledgments table
4. ✅ **Per-vendor tracking** - Group by item+vendor in frontend
5. ✅ **Filter by status** - Active/All/Dismissed tabs
6. ✅ **Direct navigation** - KPIs link to dedicated pages

Ready to build! 🚀
