# Build Violations Audit Report

## Critical Issues Found

### 1. Docker Compose - Obsolete Version Attribute
**File:** `docker-compose.yml`
**Issue:** `version: '3.8'` is obsolete and should be removed
**Severity:** Warning (non-breaking)
**Fix:** Remove the version line entirely

### 2. TypeScript Errors (34 total across 12 files)

#### Unused Variables/Imports
- `frontend/src/components/cogs/COGSSummaryCards.tsx` (2 errors)
  - `healthyItems` declared but never used
  - `warningItems` declared but never used

- `frontend/src/components/dashboard/DashboardHeader.tsx` (2 errors)
  - `Search` import never used
  - `Input` import never used

- `frontend/src/components/dashboard/VendorScorecardCard.tsx` (2 errors)
  - `TrendingUp` import never used
  - `DollarSign` import never used

- `frontend/src/components/layout/AppShell.tsx` (5 errors)
  - `breadcrumbs` prop never used
  - `showBackButton` prop never used
  - `backButtonLabel` prop never used
  - `backButtonHref` prop never used
  - `showBackToDashboard` prop never used

- `frontend/src/pages/CompetitorSelectionPage.tsx` (6 errors)
  - `useEffect` import never used
  - `CardDescription` import never used
  - `CompetitorCard` import never used
  - Missing `status` property on type
  - Missing `location` property on type

- `frontend/src/pages/DashboardPage.tsx` (1 error)
  - `TrendingUp` import never used

- `frontend/src/pages/MenuComparisonResultsPage.tsx` (4 errors)
  - `CardDescription` import never used
  - `ComparisonResultsResponse` type never used
  - `result` parameter never used
  - Type mismatch on `categories` prop

- `frontend/src/pages/MenuParsingProgressPage.tsx` (2 errors)
  - Entire import statement unused
  - `index` parameter never used

- `frontend/src/pages/PriceAnalyticsDashboard.tsx` (3 errors)
  - `useEffect` import never used
  - `Button` import never used
  - Invalid props on `PageHeader`

- `frontend/src/pages/SavedComparisonsPage.tsx` (5 errors)
  - `CardDescription` import never used
  - Missing `comparisons` property
  - Implicit `any` type on `comparison` parameter (2 instances)
  - Missing `has_more` property

- `frontend/src/hooks/useCOGSOverview.ts` (1 error)
  - `COGSOverviewData` interface declared but never used

#### Type Errors
- `frontend/src/components/dashboard/FastestRisingCostsChart.tsx`
  - Formatter function type mismatch with Recharts

### 3. Python Package Version Mismatches
**File:** `requirements.txt`
**Issues:**
- `fastapi==0.120.0` in requirements but `0.109.0` installed
- `pydantic==2.10.3` in requirements but `2.12.3` installed
- `supabase==2.10.0` in requirements but `2.3.0` installed

### 4. Large Docker Image Size
**Issue:** `src-api` image is 880MB (could be optimized)
**Recommendation:** Use multi-stage builds and alpine base images

## Summary Statistics
- **TypeScript Errors:** 34
- **Unused Imports:** 15
- **Type Mismatches:** 8
- **Unused Variables:** 11
- **Docker Warnings:** 1
- **Package Version Conflicts:** 3

## Priority Fix Order
1. Remove docker-compose version attribute (1 min)
2. Fix TypeScript unused imports (10 min)
3. Fix type mismatches in pages (20 min)
4. Update Python package versions (5 min)
5. Optimize Docker image size (optional, 30 min)
