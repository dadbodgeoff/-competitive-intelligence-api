# Navigation Update Pattern

## Standard Pattern for All Pages

### 1. Import PageLayout
```typescript
import { PageLayout } from '@/components/layout/PageLayout';
```

### 2. Remove old header code
Remove:
- `useAuthStore` import (unless needed for other logic)
- Manual header div with brand/user
- Background gradient div
- Container wrapper div

### 3. Wrap content in PageLayout
```typescript
return (
  <PageLayout
    breadcrumbs={[
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Module Name', href: '/module' },
      { label: 'Current Page' },
    ]}
    showBackButton={true}  // optional
    backButtonLabel="Back to List"  // optional
    backButtonHref="/module"  // optional
  >
    {/* Your page content here */}
  </PageLayout>
);
```

## Breadcrumb Patterns by Module

### Analysis Module
- New: `Dashboard → Analysis → New Analysis`
- Saved: `Dashboard → Analysis → Saved Analyses`
- Progress: `Dashboard → Analysis → Analysis Progress`
- Results: `Dashboard → Analysis → Results`

### Invoice Module  
- List: `Dashboard → Invoices`
- Upload: `Dashboard → Invoices → Upload`
- Detail: `Dashboard → Invoices → Invoice #{id}`

### Menu Module
- Dashboard: `Dashboard → Menu`
- Upload: `Dashboard → Menu → Upload`
- Recipe: `Dashboard → Menu → Recipe`

### Menu Comparison Module
- New: `Dashboard → Menu Comparison → New`
- Saved: `Dashboard → Menu Comparison → Saved`
- Select: `Dashboard → Menu Comparison → Select Competitors`
- Results: `Dashboard → Menu Comparison → Results`

### Analytics Module
- Dashboard: `Dashboard → Analytics`

## Completed Pages ✅
- ✅ SavedAnalysesPage
- ✅ InvoiceListPage
- ✅ InvoiceDetailPage
- ✅ MenuDashboard
- ✅ MenuComparisonPage
- ✅ CompetitorSelectionPage
- ✅ MenuParsingProgressPage
- ✅ SavedComparisonsPage
- ✅ MenuComparisonResultsPage
- ✅ PriceAnalyticsDashboard
- ✅ ReviewAnalysisForm (component used by NewAnalysisPage)

## Skipped Pages (No Changes Needed)
- NewAnalysisPage - Simple wrapper, delegates to ReviewAnalysisForm ✅
- AnalysisProgressPage - Simple wrapper, delegates to AnalysisProgressTracker
- AnalysisResultsPage - Simple wrapper, delegates to ReviewAnalysisResultsPage
- DashboardPage - Already has PageHeader component
- LandingPage - Public marketing page, doesn't need PageLayout

## Summary
All authenticated pages now use the unified PageLayout component with:
- Consistent RestaurantIQ branding
- Breadcrumb navigation
- Optional back buttons
- Unified styling and spacing
