# Dashboard Upgrade to shadcn/ui - Pre-Implementation Audit

## Executive Summary
Complete audit of current dashboard and API endpoints before upgrading to modern shadcn/ui admin dashboard.

## Current State Analysis

### Existing shadcn/ui Components
✅ Already installed:
- alert
- badge
- button
- card
- checkbox
- dialog
- form
- input
- label
- progress
- select
- skeleton
- table
- tabs
- textarea
- toast/toaster

### Missing shadcn/ui Components Needed
❌ Need to install:
- **sidebar** - For left navigation
- **sheet** - For mobile drawer
- **separator** - For visual dividers
- **dropdown-menu** - Already exists in design-system, need in ui/
- **command** - For advanced search
- **avatar** - For user profile
- **navigation-menu** - For nav links
- **tooltip** - For hover details
- **chart** (recharts wrapper) - For data visualization
- **scroll-area** - For scrollable sections

## API Endpoints Inventory

### Authentication (`/api/v1/auth`)
- POST `/register` - User registration
- POST `/login` - User login
- POST `/logout` - User logout
- GET `/me` - Get current user profile
- POST `/refresh` - Refresh auth token

### Analysis (`/api/v1/analysis`)
- POST `/run` - Run tier analysis
- GET `/tiers/comparison` - Get tier comparison
- POST `/tiers/estimate-cost` - Estimate analysis cost
- GET `/cache/stats` - Get cache statistics
- POST `/cache/invalidate` - Invalidate cache
- GET `/{analysis_id}/status` - Get analysis status
- GET `/{analysis_id}` - Get analysis result
- GET `/analyses` - Get user analyses list

### Streaming Analysis (`/api/v1/streaming`)
- POST `/run/stream` - Run streaming analysis
- GET `/stream/{analysis_id}/status` - Get streaming status
- GET `/{analysis_id}/reviews` - Get analysis reviews

### Subscription (`/api/v1/subscription`)
- GET `/status` - Get subscription status
- GET `/history` - Get subscription history
- GET `/tiers` - Get available tiers
- POST `/admin/upgrade` - Admin upgrade user
- POST `/admin/downgrade` - Admin downgrade user

### Usage Limits (`/api/v1/usage`)
- GET `/check/{operation_type}` - Check usage limit
- GET `/summary` - Get usage summary
- GET `/history` - Get usage history

### Invoice Operations (`/api/v1/invoices`)
- POST `/upload` - Upload invoice
- POST `/parse` - Parse invoice
- GET `/list` - List invoices
- GET `/{invoice_id}` - Get invoice details
- DELETE `/{invoice_id}` - Delete invoice

### Menu Operations (`/api/v1/menu`)
- POST `/upload` - Upload menu
- POST `/parse` - Parse menu
- GET `/list` - List menus
- GET `/{menu_id}` - Get menu details
- GET `/items/{menu_item_id}/recipe` - Get recipe
- POST `/items/{menu_item_id}/ingredients` - Add ingredient
- PUT `/items/{menu_item_id}/ingredients/{ingredient_id}` - Update ingredient
- DELETE `/items/{menu_item_id}/ingredients/{ingredient_id}` - Delete ingredient
- GET `/search-inventory` - Search inventory items

### Menu Comparison (`/api/v1/menu-comparison`)
- POST `/discover` - Discover competitors
- POST `/analyze/stream` - Analyze competitors (streaming)
- GET `/{analysis_id}/status` - Get analysis status
- GET `/{analysis_id}/results` - Get comparison results
- POST `/save` - Save comparison
- GET `/saved` - List saved comparisons
- DELETE `/saved/{saved_id}` - Archive saved comparison
- DELETE `/{analysis_id}/cascade` - Delete analysis cascade

### Price Analytics (`/api/v1/analytics`)
- GET `/items-list` - Get items list
- GET `/price-comparison` - Get price comparison
- GET `/price-trends` - Get price trends
- GET `/savings-opportunities` - Get savings opportunities
- GET `/vendor-performance` - Get vendor performance
- GET `/price-anomalies` - Get price anomalies
- GET `/dashboard-summary` - Get dashboard summary

### User Preferences (`/api/v1/preferences`)
- GET `/` - Get preferences
- PUT `/` - Update preferences
- POST `/reset` - Reset preferences
- GET `/waste-buffer/{category}` - Get waste buffer
- GET `/alert-threshold` - Get alert threshold
- GET `/defaults` - Get defaults

### Inventory Operations (`/api/v1/inventory`)
- GET `/items` - List inventory items
- GET `/items/{item_id}` - Get inventory item
- GET `/items/{item_id}/transactions` - Get item transactions
- GET `/vendors` - Get vendors list

## Current Pages & Routes

### Public Routes
- `/` - Landing page
- `/login` - Login page
- `/register` - Register page

### Protected Routes
- `/dashboard` - Main dashboard (TO BE UPGRADED)
- `/analysis/new` - New analysis form
- `/analysis/:analysisId/progress` - Analysis progress tracker
- `/analysis/:analysisId/results` - Analysis results
- `/analysis/saved` - Saved analyses list
- `/invoices` - Invoice list
- `/invoices/upload` - Invoice upload
- `/invoices/:invoiceId` - Invoice detail
- `/menu/upload` - Menu upload
- `/menu/dashboard` - Menu dashboard
- `/menu/items/:menuItemId/recipe` - Menu item recipe
- `/analytics` - Price analytics dashboard
- `/menu-comparison` - Menu comparison start
- `/menu-comparison/:analysisId/select` - Competitor selection
- `/menu-comparison/:analysisId/parse` - Menu parsing progress
- `/menu-comparison/:analysisId/results` - Comparison results
- `/menu-comparison/saved` - Saved comparisons

## Dashboard Data Requirements

### KPI Metrics (from `/api/v1/usage/summary`)
- Invoice uploads (used/limit)
- Menu uploads (used/limit)
- Free analyses (used/limit)
- Menu comparisons (used/limit)
- Reset date

### Quick Stats (from `/api/v1/analytics/dashboard-summary`)
- Total items tracked
- Active vendors
- Potential savings
- Price anomalies count

### Recent Activity
- Recent analyses (from `/api/v1/analysis/analyses`)
- Recent invoices (from `/api/v1/invoices/list`)
- Recent menu comparisons (from `/api/v1/menu-comparison/saved`)

### Charts Data
- Price trends over time
- Vendor performance comparison
- Usage trends

## Potential Breaking Changes

### None Expected
- All API endpoints are stable
- Current components will remain functional
- New dashboard will be additive, not replacing existing functionality
- Routing structure remains unchanged

## Implementation Plan

### Phase 1: Install Missing Components
1. Install missing shadcn/ui components
2. Create custom dashboard layout components
3. Set up sidebar navigation structure

### Phase 2: Build Dashboard Layout
1. Create Sidebar component with navigation
2. Create Header component with search/notifications
3. Create main content grid layout
4. Add responsive mobile support with Sheet

### Phase 3: Build Dashboard Widgets
1. KPI metric cards with real-time data
2. Usage limits widget (already exists, integrate)
3. Quick action cards
4. Recent activity feed
5. Charts for analytics

### Phase 4: Integration
1. Connect all widgets to API endpoints
2. Add loading states with Skeleton
3. Add error handling with Toast
4. Test responsive behavior
5. Verify all links and navigation

## Risk Assessment

### Low Risk
- ✅ All API endpoints documented and stable
- ✅ shadcn/ui components are well-tested
- ✅ Existing components remain functional
- ✅ No database schema changes required

### Mitigation Strategies
- Keep old DashboardPage.tsx as backup
- Test each component independently
- Use TypeScript for type safety
- Implement comprehensive error boundaries

## Success Criteria
- [ ] Clean, modern UI with shadcn/ui components
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] All API endpoints integrated correctly
- [ ] No broken links or navigation
- [ ] Loading states for all async operations
- [ ] Error handling for all API calls
- [ ] Accessible (ARIA compliant)
- [ ] Performance optimized (lazy loading, code splitting)

## Conclusion
✅ **READY TO PROCEED** - All API endpoints documented, no breaking changes expected, clear implementation path.
