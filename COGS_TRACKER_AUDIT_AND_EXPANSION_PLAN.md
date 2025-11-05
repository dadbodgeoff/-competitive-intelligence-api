# Cost of Goods (COGS) Tracker - Complete Audit & Expansion Plan

## Executive Summary

You have a **fully functional COGS/Recipe tracking system** embedded within the Menu module. This audit documents the complete architecture and provides a detailed plan for creating a dedicated COGS experience that **reuses 100% of existing infrastructure** without any backend changes.

---

## Current System Architecture

### 1. Database Layer (Source of Truth)

**Tables:**
- `menu_items` - Menu items from uploaded menus
- `menu_item_prices` - Price variants (sizes) for menu items
- `menu_item_ingredients` - Recipe ingredients (OWNED by menu module)
- `invoice_items` - Invoice line items (SOURCE OF TRUTH for pricing - READ ONLY)
- `inventory_items` - Aggregated inventory (READ ONLY reference)

**Key Relationships:**
```
menu_items (1) ──→ (N) menu_item_prices
menu_items (1) ──→ (N) menu_item_ingredients
menu_item_ingredients (N) ──→ (1) invoice_items [READ ONLY]
```

**Critical Architecture Decision:**
- `menu_item_ingredients` links DIRECTLY to `invoice_items` (not inventory_items)
- This ensures pricing always comes from actual invoices (source of truth)
- Menu module NEVER writes to invoice/inventory tables

### 2. Backend Services

**File:** `services/menu_recipe_service.py`

**Key Methods:**
1. `search_inventory_items(user_id, query, limit)` 
   - Uses FUZZY MATCHING to search invoice items
   - Returns items with calculated unit costs from pack sizes
   - READ ONLY access to invoice_items

2. `get_recipe(menu_item_id, user_id, price_id)`
   - Fetches recipe with all ingredients
   - Joins with invoice_items for current pricing
   - Calculates total COGS, margins, food cost %
   - Handles unit conversions automatically

3. `add_ingredient(menu_item_id, invoice_item_id, quantity, unit, user_id)`
   - Links ingredient to menu item
   - Validates unit compatibility
   - Calculates initial cost
   - WRITES to menu_item_ingredients only

4. `update_ingredient(ingredient_id, user_id, quantity, notes)`
   - Updates quantity or notes
   - WRITES to menu_item_ingredients only

5. `remove_ingredient(ingredient_id, user_id)`
   - Removes ingredient from recipe
   - DELETES from menu_item_ingredients only

**Unit Conversion System:**
- Integrated `UnitConverter` service
- Handles oz/lb/g/kg/ea conversions
- Calculates unit costs from pack sizes
- Validates unit compatibility

**Fuzzy Matching:**
- Uses `FuzzyItemMatcher` for intelligent search
- Returns similarity scores and confidence levels
- Helps users find ingredients even with typos

### 3. API Endpoints

**File:** `api/routes/menu/recipes.py`

**Available Endpoints:**
```
GET  /api/v1/menu/search-inventory?q={query}&limit={limit}
GET  /api/v1/menu/items/{menu_item_id}/recipe?price_id={price_id}
POST /api/v1/menu/items/{menu_item_id}/ingredients
PUT  /api/v1/menu/items/{menu_item_id}/ingredients/{ingredient_id}
DELETE /api/v1/menu/items/{menu_item_id}/ingredients/{ingredient_id}
```

**All endpoints:**
- Include authentication via `get_current_user` dependency
- Validate ownership through menu → restaurant_menus → user_id chain
- Return detailed error messages
- Include warnings for unit conversion issues

### 4. Frontend Components

**Current Route:**
```
/menu/items/{menuItemId}/recipe
```

**Page:** `frontend/src/pages/MenuItemRecipePage.tsx`
- Two-column layout: COGS calculator + ingredient list
- Real-time cost calculations
- Inline editing of quantities

**Hook:** `frontend/src/hooks/useRecipeBuilder.ts`
- Manages recipe state
- Handles all CRUD operations
- Auto-refreshes after changes
- Toast notifications

**Components:**
1. `COGSCalculator.tsx` - Cost breakdown display
   - Total COGS
   - Menu price
   - Gross profit
   - Food cost percentage
   - Visual health indicators (green/orange/red)

2. `IngredientList.tsx` - Ingredient management
   - List view with inline editing
   - Add/edit/delete operations
   - Shows pack sizes, unit costs, line costs
   - Displays warnings

3. `IngredientSearchModal.tsx` - Search and add ingredients
   - Fuzzy search interface
   - Shows similarity scores
   - Displays pack info and calculated costs

**API Service:** `frontend/src/services/api/menuRecipeApi.ts`
- Clean API abstraction
- TypeScript types
- Error handling

**Types:** `frontend/src/types/menuRecipe.ts`
- Complete type definitions
- Matches backend responses
- Includes fuzzy matching metadata

### 5. Current User Flow

1. User uploads menu → menu items created
2. User navigates to Menu Dashboard
3. User clicks "Build Recipe" on any menu item
4. User lands on `/menu/items/{id}/recipe`
5. User searches for ingredients (fuzzy search)
6. User adds ingredients with quantities
7. System calculates COGS automatically
8. User sees real-time profitability metrics

---

## What Works Perfectly (No Changes Needed)

✅ **Database schema** - Properly normalized, RLS enabled
✅ **Backend service** - Complete CRUD operations, unit conversion, fuzzy matching
✅ **API endpoints** - RESTful, authenticated, validated
✅ **Frontend components** - Polished UI, real-time updates
✅ **Data flow** - Invoice items as source of truth
✅ **Security** - Ownership validation at every layer
✅ **Performance** - Optimized queries, batch fetching

---

## Proposed Enhancement: Dedicated COGS Tracker Page

### Goal
Create a standalone COGS management experience at `/cogs` that provides:
- Overview of all menu items with COGS data
- Bulk recipe management
- Filtering and grouping capabilities
- Export functionality
- Better analytics and insights

### Implementation Strategy: 100% Frontend Only

**NO BACKEND CHANGES REQUIRED** - All existing endpoints support this use case.

---

## Detailed Implementation Plan

### Phase 1: New Page Structure

**New Route:** `/cogs` (or `/cogs/dashboard`)

**File to Create:** `frontend/src/pages/COGSDashboardPage.tsx`

**Layout:**
```
┌─────────────────────────────────────────────────┐
│  COGS Tracker                                   │
│  Manage recipes and track profitability         │
├─────────────────────────────────────────────────┤
│  [Filters] [Search] [Export] [View Options]     │
├─────────────────────────────────────────────────┤
│  Summary Cards:                                  │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐           │
│  │Items │ │Avg   │ │High  │ │Needs │           │
│  │w/COGS│ │Margin│ │Cost  │ │Review│           │
│  └──────┘ └──────┘ └──────┘ └──────┘           │
├─────────────────────────────────────────────────┤
│  Menu Items Table:                               │
│  ┌─────────────────────────────────────────┐   │
│  │ Item Name │ Price │ COGS │ Margin │ ... │   │
│  ├─────────────────────────────────────────┤   │
│  │ Burger    │ $12   │ $3.5 │ 29%    │ ✓   │   │
│  │ Pizza     │ $18   │ $5.2 │ 28%    │ ✓   │   │
│  │ Salad     │ $10   │ $0   │ -      │ ⚠   │   │
│  └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

### Phase 2: Data Fetching Strategy

**Approach:** Fetch all menu items, then fetch recipes in parallel

**New Hook:** `frontend/src/hooks/useCOGSOverview.ts`

```typescript
export function useCOGSOverview() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [recipes, setRecipes] = useState<Map<string, MenuItemRecipe>>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch all menu items from existing endpoint
    //    GET /api/v1/menu/current
    
    // 2. For each menu item, fetch recipe
    //    GET /api/v1/menu/items/{id}/recipe
    //    (Can be done in parallel with Promise.all)
    
    // 3. Build aggregated view
  }, []);

  return {
    menuItems,
    recipes,
    loading,
    // Computed metrics
    totalItems,
    itemsWithRecipes,
    averageMargin,
    highCostItems,
    needsReviewItems,
  };
}
```

**Optimization:** Cache recipes in React Query for performance

### Phase 3: Filtering & Grouping

**Filters to Add:**
- Category (from menu categories)
- COGS status (has recipe / no recipe)
- Margin health (healthy / warning / danger)
- Price range
- Ingredient count

**Grouping Options:**
- By category
- By margin health
- By price tier
- Flat list (default)

**Implementation:** All client-side filtering using existing data

### Phase 4: Bulk Operations

**Features:**
- Select multiple items
- Bulk export to CSV/Excel
- Print recipe cards
- Compare items side-by-side

**No Backend Changes:** All data already available via existing endpoints

### Phase 5: Enhanced Analytics

**New Visualizations:**
- Food cost % distribution chart
- Margin by category
- Top 10 most/least profitable items
- Ingredient usage frequency
- Cost trends over time (if historical data available)

**Libraries to Use:**
- Recharts (already in project)
- React Table (for advanced table features)

### Phase 6: Quick Actions

**From COGS Dashboard:**
- Click item → Navigate to `/menu/items/{id}/recipe` (existing page)
- "Build Recipe" button → Same navigation
- "View Menu" button → Navigate to `/menu/dashboard`

**Bidirectional Navigation:**
- Add "COGS Tracker" link to main navigation
- Add "View in COGS Tracker" button on recipe page

---

## Files to Create (Frontend Only)

### 1. New Page
```
frontend/src/pages/COGSDashboardPage.tsx
```

### 2. New Hook
```
frontend/src/hooks/useCOGSOverview.ts
```

### 3. New Components
```
frontend/src/components/cogs/COGSOverviewCard.tsx
frontend/src/components/cogs/COGSTable.tsx
frontend/src/components/cogs/COGSFilters.tsx
frontend/src/components/cogs/COGSExportButton.tsx
frontend/src/components/cogs/COGSCharts.tsx
```

### 4. New Types (if needed)
```
frontend/src/types/cogsOverview.ts
```

### 5. Route Update
```typescript
// In frontend/src/App.tsx
<Route
  path="/cogs"
  element={
    <ProtectedRoute>
      <COGSDashboardPage />
    </ProtectedRoute>
  }
/>
```

### 6. Navigation Update
```typescript
// In frontend/src/components/layout/AppSidebar.tsx
// Add new menu item:
{
  label: 'COGS Tracker',
  href: '/cogs',
  icon: DollarSign,
}
```

---

## API Endpoints to Reuse (No Changes)

### Already Available:
1. ✅ `GET /api/v1/menu/current` - Get all menu items
2. ✅ `GET /api/v1/menu/items/{id}/recipe` - Get recipe for each item
3. ✅ `GET /api/v1/menu/search-inventory` - Search ingredients
4. ✅ `POST /api/v1/menu/items/{id}/ingredients` - Add ingredient
5. ✅ `PUT /api/v1/menu/items/{id}/ingredients/{ing_id}` - Update ingredient
6. ✅ `DELETE /api/v1/menu/items/{id}/ingredients/{ing_id}` - Delete ingredient

### Potential Optimization (Optional):
If fetching recipes one-by-one is slow, could add:
```
GET /api/v1/menu/recipes/bulk?menu_item_ids=id1,id2,id3
```

But this is **NOT REQUIRED** - can start with parallel fetching.

---

## Data Synchronization

### How It Stays in Sync:

1. **Single Source of Truth:** 
   - All recipe data stored in `menu_item_ingredients` table
   - Both pages read from same database

2. **Real-time Updates:**
   - Changes on `/menu/items/{id}/recipe` immediately visible on `/cogs`
   - Changes on `/cogs` (if we add inline editing) immediately visible on recipe page

3. **No Conflicts:**
   - Both pages use same API endpoints
   - Same authentication and ownership validation
   - Same business logic

### Refresh Strategy:
- Use React Query with cache invalidation
- Refetch on window focus (optional)
- Manual refresh button
- Optimistic updates for better UX

---

## Export Functionality

### CSV Export (Client-Side):
```typescript
function exportToCSV(recipes: Map<string, MenuItemRecipe>) {
  const rows = Array.from(recipes.entries()).map(([itemId, recipe]) => ({
    'Item Name': recipe.menu_item.name,
    'Menu Price': recipe.menu_price,
    'Total COGS': recipe.total_cogs,
    'Gross Profit': recipe.gross_profit,
    'Food Cost %': recipe.food_cost_percent,
    'Ingredient Count': recipe.ingredients.length,
  }));
  
  // Convert to CSV and download
  const csv = convertToCSV(rows);
  downloadFile(csv, 'cogs-report.csv');
}
```

### Recipe Card Export:
- Generate printable HTML
- Include ingredient list, costs, instructions
- Use browser print dialog

---

## Performance Considerations

### Initial Load:
- Fetch menu items first (fast)
- Show skeleton loaders
- Fetch recipes in background (parallel)
- Progressive rendering as recipes load

### Caching:
- Use React Query with 5-minute stale time
- Cache recipes by menu_item_id
- Invalidate on mutations

### Pagination:
- If >50 menu items, add pagination
- Or virtual scrolling with react-window

---

## UI/UX Enhancements

### Visual Indicators:
- 🟢 Green: Food cost < 30% (healthy)
- 🟡 Orange: Food cost 30-35% (warning)
- 🔴 Red: Food cost > 35% (danger)
- ⚠️ Gray: No recipe yet

### Quick Stats:
- Total menu items
- Items with recipes
- Average food cost %
- Items needing attention

### Sorting:
- By name (A-Z)
- By price (high/low)
- By COGS (high/low)
- By margin (best/worst)
- By food cost % (low/high)

### Search:
- Filter by item name
- Filter by ingredient
- Filter by category

---

## Mobile Responsiveness

### Desktop (>1024px):
- Full table view
- Side-by-side comparisons
- Charts visible

### Tablet (768-1024px):
- Condensed table
- Collapsible filters
- Stacked charts

### Mobile (<768px):
- Card view instead of table
- Bottom sheet for filters
- Swipe actions for quick edits

---

## Testing Strategy

### Unit Tests:
- Test `useCOGSOverview` hook
- Test filtering logic
- Test export functions

### Integration Tests:
- Test data fetching
- Test navigation between pages
- Test sync between COGS dashboard and recipe page

### E2E Tests:
- User creates recipe on recipe page
- User sees it on COGS dashboard
- User filters and exports data

---

## Rollout Plan

### Phase 1: MVP (Week 1)
- Create basic COGS dashboard page
- Fetch and display all menu items with COGS
- Add navigation link
- Basic filtering (has recipe / no recipe)

### Phase 2: Enhanced Features (Week 2)
- Add advanced filters
- Add sorting
- Add summary cards
- Add export to CSV

### Phase 3: Analytics (Week 3)
- Add charts
- Add bulk operations
- Add comparison view

### Phase 4: Polish (Week 4)
- Mobile optimization
- Performance tuning
- User testing and feedback

---

## Risk Assessment

### Low Risk:
✅ No backend changes = no database migration risk
✅ Reusing existing endpoints = no API contract changes
✅ Existing components = proven UI patterns
✅ Same authentication = no security changes

### Medium Risk:
⚠️ Performance with many menu items (mitigated by pagination)
⚠️ Complex filtering logic (mitigated by testing)

### High Risk:
❌ None identified

---

## Success Metrics

### User Experience:
- Time to view all COGS data: <3 seconds
- Time to find specific item: <5 seconds
- Time to export report: <2 seconds

### Adoption:
- % of users who visit COGS dashboard
- % of menu items with recipes
- Frequency of COGS dashboard visits

### Business Impact:
- Improved food cost awareness
- Better pricing decisions
- Reduced waste through better portioning

---

## Future Enhancements (Beyond Initial Scope)

### 1. Recipe Templates
- Save common recipes
- Apply to multiple items
- Share across restaurants

### 2. Cost Alerts
- Notify when ingredient costs spike
- Alert when margins drop below threshold
- Weekly COGS summary email

### 3. Batch Recipe Builder
- Upload CSV with recipes
- Bulk import ingredients
- Template-based creation

### 4. Historical Tracking
- Track COGS changes over time
- Compare current vs. past costs
- Trend analysis

### 5. Integration with POS
- Import actual sales data
- Calculate theoretical vs. actual food cost
- Identify waste or theft

---

## Conclusion

You have a **production-ready COGS tracking system** that is:
- ✅ Fully functional
- ✅ Well-architected
- ✅ Properly secured
- ✅ Performance optimized
- ✅ Type-safe

The proposed COGS Dashboard is a **pure frontend enhancement** that:
- ✅ Requires ZERO backend changes
- ✅ Reuses 100% of existing infrastructure
- ✅ Maintains data consistency
- ✅ Provides better user experience
- ✅ Enables new workflows

**Recommendation:** Proceed with frontend-only implementation. Start with MVP (Phase 1) and iterate based on user feedback.

---

## Questions to Consider Before Implementation

1. **Navigation:** Where should "COGS Tracker" appear in the main menu?
2. **Default View:** Should it show all items or only items with recipes?
3. **Permissions:** Should this be available to all users or premium only?
4. **Export Format:** CSV only or also Excel/PDF?
5. **Mobile Priority:** Is mobile view critical for MVP or can it wait?
6. **Naming:** "COGS Tracker" vs "Recipe Manager" vs "Plate Costing"?

---

**Document Version:** 1.0  
**Date:** November 4, 2025  
**Status:** Ready for Implementation  
**Estimated Effort:** 2-4 weeks (frontend only)
