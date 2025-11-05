# Navigation Refactor Progress

## Reusable Components Created ✅
- `PageHeader.tsx` - Standardized header with brand, breadcrumbs, user info
- `PageLayout.tsx` - Full page wrapper with header and content area

## Brand Updates
- Brand name: **RestaurantIQ** (replacing "Restaurant CI")

## Pages to Update

### Analysis Module (4 pages)
- [ ] `/analysis/new` - NewAnalysisPage.tsx
- [x] `/analysis/saved` - SavedAnalysesPage.tsx (already has header)
- [ ] `/analysis/:id/progress` - AnalysisProgressPage.tsx
- [ ] `/analysis/:id/results` - AnalysisResultsPage.tsx

### Invoice Module (3 pages)
- [ ] `/invoices` - InvoiceListPage.tsx
- [ ] `/invoices/upload` - InvoiceUploadPage.tsx
- [ ] `/invoices/:id` - InvoiceDetailPage.tsx

### Menu Module (3 pages)
- [ ] `/menu/dashboard` - MenuDashboard.tsx
- [ ] `/menu/upload` - MenuUploadPage.tsx
- [ ] `/menu/:id/recipe` - MenuItemRecipePage.tsx

### Menu Comparison Module (4 pages)
- [ ] `/menu-comparison` - MenuComparisonPage.tsx
- [ ] `/menu-comparison/saved` - SavedComparisonsPage.tsx
- [ ] `/menu-comparison/:id/select` - CompetitorSelectionPage.tsx
- [ ] `/menu-comparison/:id/results` - MenuComparisonResultsPage.tsx
- [ ] `/menu/parsing/:id` - MenuParsingProgressPage.tsx

### Analytics Module (1 page)
- [ ] `/analytics` - PriceAnalyticsDashboard.tsx

### Dashboard
- [x] `/dashboard` - DashboardPage.tsx (brand updated)

## Total: 16 pages to refactor

## Next Steps
1. Update each page to use PageLayout component
2. Define appropriate breadcrumbs for each
3. Add back navigation where needed
4. Test navigation flow
