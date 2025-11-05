# Comprehensive Error Handling & Messaging Plan

## Executive Summary

After auditing the entire application, found **50+ locations** where error handling can be improved. Current issues:
- Silent failures (console.error only, no user notification)
- Generic error messages ("Error", "Failed to load")
- Inconsistent toast usage
- Missing error context

## 📊 Audit Results by Category

### 🔴 HIGH PRIORITY - User-Facing Errors (15 locations)
**Impact**: Users don't know what went wrong or what to do

1. **Dashboard API** (6 locations) - Silent failures
   - `dashboardApi.ts` - All catch blocks return 0/[] without user notification
   - Negative alerts, positive alerts, invoices, menu items

2. **Menu Dashboard** (3 locations) - Generic errors
   - `MenuDashboard.tsx` - "Failed to load menu"
   - No differentiation between network, auth, or data errors

3. **Invoice Detail** (2 locations) - Generic errors
   - `InvoiceDetailPage.tsx` - "Failed to load invoice"
   - "Failed to delete invoice"

4. **Saved Analyses** (1 location) - Silent failure
   - `SavedAnalysesPage.tsx` - console.error only

5. **Recipe Builder** (3 locations) - Generic errors
   - `useRecipeBuilder.ts` - "Failed to add/update/remove ingredient"

### 🟡 MEDIUM PRIORITY - Data Loading (12 locations)
**Impact**: Users see loading states forever or stale data

1. **Streaming Hooks** (3 locations)
   - `useStreamingAnalysis.ts` - Generic stream errors
   - `useMenuParseStream.ts` - Generic parse errors
   - `useInvoiceParseStream.ts` - Generic parse errors

2. **Menu Comparison** (4 locations)
   - `menuComparisonApi.ts` - Generic API errors
   - `MenuComparisonResultsPage.tsx` - Generic save errors
   - `CompetitorSelectionPage.tsx` - Some good, some generic

3. **Usage Limits** (2 locations)
   - `useUsageLimits.ts` - Generic "Failed to check limit"

4. **Inventory Search** (1 location)
   - `useInventorySearch.ts` - Generic "Search failed"

5. **Recently Ordered** (1 location)
   - `RecentlyOrderedTable.tsx` - Silent failure

### 🟢 LOW PRIORITY - Already Good (8 locations)
**Status**: These have good error handling already

1. **Invoice Upload** ✅ - Excellent specific messages
2. **Menu Upload** ✅ - Excellent specific messages
3. **Review Analysis Form** ✅ - Good limit detection
4. **Auth Forms** ✅ - Just improved!

## 🎯 Implementation Plan

### Phase 1: Extend Error Utilities (30 min)
**Goal**: Add parsers for all error types

**Files to Create/Update**:
- `frontend/src/utils/errorMessages.ts` - Add new parsers

**New Functions**:
```typescript
parseDataLoadError(error: any, dataType: string): ErrorDetails
parseStreamError(error: any, streamType: string): ErrorDetails
parseDeleteError(error: any, itemType: string): ErrorDetails
parseSaveError(error: any, itemType: string): ErrorDetails
```

### Phase 2: Dashboard API - Show Errors (45 min)
**Goal**: Stop silent failures, notify users

**Files to Update**:
- `frontend/src/services/api/dashboardApi.ts`
- `frontend/src/pages/DashboardPageNew.tsx`

**Changes**:
- Return error state instead of default values
- Show toast notifications for critical data
- Add retry buttons

### Phase 3: Menu & Invoice Pages (30 min)
**Goal**: Specific error messages

**Files to Update**:
- `frontend/src/pages/MenuDashboard.tsx`
- `frontend/src/pages/InvoiceDetailPage.tsx`
- `frontend/src/pages/InvoiceListPage.tsx`

**Changes**:
- Use `parseDataLoadError()` for load failures
- Use `parseDeleteError()` for delete failures
- Add specific messages for auth vs network vs data errors

### Phase 4: Streaming Hooks (45 min)
**Goal**: Better stream error handling

**Files to Update**:
- `frontend/src/hooks/useStreamingAnalysis.ts`
- `frontend/src/hooks/useMenuParseStream.ts`
- `frontend/src/hooks/useInvoiceParseStream.ts`

**Changes**:
- Use `parseStreamError()` for stream failures
- Differentiate between connection, timeout, and processing errors
- Add retry logic

### Phase 5: Recipe Builder & Misc (30 min)
**Goal**: Consistent error messages

**Files to Update**:
- `frontend/src/hooks/useRecipeBuilder.ts`
- `frontend/src/hooks/useInventorySearch.ts`
- `frontend/src/hooks/useUsageLimits.ts`

**Changes**:
- Use appropriate error parsers
- Add specific messages for each operation

## 📋 Detailed Implementation Checklist

### Phase 1: Error Utilities ✅ (Ready to implement)
- [ ] Add `parseDataLoadError()` function
- [ ] Add `parseStreamError()` function
- [ ] Add `parseDeleteError()` function
- [ ] Add `parseSaveError()` function
- [ ] Add `parseSearchError()` function
- [ ] Test all new functions

### Phase 2: Dashboard API (Critical)
- [ ] Update `getNegativeAlertsCount()` - return error state
- [ ] Update `getNegativeAlerts()` - return error state
- [ ] Update `getPositiveAlertsCount()` - return error state
- [ ] Update `getPositiveAlerts()` - return error state
- [ ] Update `getRecentInvoicesCount()` - return error state
- [ ] Update `getMenuItemsCount()` - return error state
- [ ] Update `getRecentlyOrderedItems()` - return error state
- [ ] Update `DashboardPageNew.tsx` - handle error states
- [ ] Add toast notifications for failures
- [ ] Add retry buttons

### Phase 3: Menu & Invoice Pages
- [ ] `MenuDashboard.tsx` - parseDataLoadError for menu load
- [ ] `MenuDashboard.tsx` - parseDeleteError for menu delete
- [ ] `InvoiceDetailPage.tsx` - parseDataLoadError for invoice load
- [ ] `InvoiceDetailPage.tsx` - parseDeleteError for invoice delete
- [ ] `InvoiceListPage.tsx` - parseDataLoadError for list load
- [ ] `SavedAnalysesPage.tsx` - parseDataLoadError + toast

### Phase 4: Streaming Hooks
- [ ] `useStreamingAnalysis.ts` - parseStreamError
- [ ] `useStreamingAnalysis.ts` - Add retry logic
- [ ] `useMenuParseStream.ts` - parseStreamError
- [ ] `useMenuParseStream.ts` - Add retry logic
- [ ] `useInvoiceParseStream.ts` - parseStreamError
- [ ] `useInvoiceParseStream.ts` - Add retry logic

### Phase 5: Recipe & Misc
- [ ] `useRecipeBuilder.ts` - parseSaveError for add/update/delete
- [ ] `useInventorySearch.ts` - parseSearchError
- [ ] `useUsageLimits.ts` - parseAPIError
- [ ] `RecentlyOrderedTable.tsx` - parseDataLoadError + toast

## 🎨 Error Message Examples

### Data Loading Errors
```typescript
// Before
console.error('Failed to fetch negative alerts:', error);
return 0;

// After
const errorDetails = parseDataLoadError(error, 'price alerts');
toast({
  variant: 'destructive',
  title: errorDetails.title, // "Unable to Load Price Alerts"
  description: errorDetails.description, // "Connection error. Click retry to try again."
});
return { data: 0, error: errorDetails };
```

### Stream Errors
```typescript
// Before
console.error('Streaming request failed:', error);
setState({ status: 'error', error: 'Stream error' });

// After
const errorDetails = parseStreamError(error, 'invoice processing');
setState({ 
  status: 'error', 
  error: errorDetails.description,
  errorTitle: errorDetails.title // "Processing Interrupted"
});
```

### Delete Errors
```typescript
// Before
toast({
  title: 'Error',
  description: error instanceof Error ? error.message : 'Failed to delete invoice',
});

// After
const errorDetails = parseDeleteError(error, 'invoice');
toast({
  variant: 'destructive',
  title: errorDetails.title, // "Unable to Delete Invoice"
  description: errorDetails.description, // "This invoice is linked to menu items. Remove links first."
});
```

## 🔧 New Utility Functions Spec

### parseDataLoadError
```typescript
/**
 * Parse data loading errors
 * @param error - The error object
 * @param dataType - What was being loaded (e.g., "invoices", "menu", "alerts")
 */
parseDataLoadError(error: any, dataType: string): ErrorDetails
```

**Handles**:
- Network errors → "Connection Error - Check your internet"
- 401 → "Please log in to view {dataType}"
- 403 → "You don't have access to this {dataType}"
- 404 → "{DataType} not found"
- 500+ → "Server error loading {dataType}"

### parseStreamError
```typescript
/**
 * Parse streaming/SSE errors
 * @param error - The error object
 * @param streamType - What's being streamed (e.g., "invoice processing", "analysis")
 */
parseStreamError(error: any, streamType: string): ErrorDetails
```

**Handles**:
- Connection lost → "Connection Lost - Reconnecting..."
- Timeout → "Processing is taking longer than expected"
- Abort → "Processing cancelled"
- Parse error → "Data format error - Please try again"

### parseDeleteError
```typescript
/**
 * Parse delete operation errors
 * @param error - The error object
 * @param itemType - What's being deleted (e.g., "invoice", "menu", "analysis")
 */
parseDeleteError(error: any, itemType: string): ErrorDetails
```

**Handles**:
- 409 → "Cannot delete - {itemType} is in use"
- 403 → "You don't have permission to delete this"
- 404 → "{ItemType} not found or already deleted"
- 500+ → "Server error - Delete failed"

### parseSaveError
```typescript
/**
 * Parse save operation errors
 * @param error - The error object
 * @param itemType - What's being saved (e.g., "invoice", "menu", "recipe")
 */
parseSaveError(error: any, itemType: string): ErrorDetails
```

**Handles**:
- 409 → "Duplicate {itemType} - Already exists"
- 422 → "Invalid data - Check your input"
- 413 → "Data too large - Reduce size"
- 500+ → "Server error - Save failed"

## 📊 Success Metrics

### Before Implementation
- ❌ 15 silent failures (console.error only)
- ❌ 20+ generic "Error" messages
- ❌ Users confused about what went wrong
- ❌ No retry options

### After Implementation
- ✅ 0 silent failures (all show user messages)
- ✅ Specific error messages for each scenario
- ✅ Users know exactly what went wrong
- ✅ Retry buttons where appropriate
- ✅ Consistent error handling across app

## ⏱️ Time Estimate

- **Phase 1**: 30 minutes (utilities)
- **Phase 2**: 45 minutes (dashboard)
- **Phase 3**: 30 minutes (menu/invoice)
- **Phase 4**: 45 minutes (streaming)
- **Phase 5**: 30 minutes (misc)

**Total**: ~3 hours for complete implementation

## 🚀 Ready to Begin?

Start with Phase 1 (utilities) - it's safe, non-breaking, and sets foundation for everything else.
