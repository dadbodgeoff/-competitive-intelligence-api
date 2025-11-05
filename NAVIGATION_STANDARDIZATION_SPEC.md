# Navigation & Branding Standardization Spec

## Objective
Standardize navigation across all pages with consistent branding (RestaurantIQ), breadcrumbs, and module navigation.

## Brand Name
**RestaurantIQ** (replacing "Restaurant CI" throughout)

## Standard Navigation Pattern

Every page should have:
1. **Top Navigation Bar** with:
   - RestaurantIQ logo/brand (left)
   - Breadcrumb trail (center)
   - User email (right)

2. **Breadcrumb Structure**:
   - Dashboard → Module → Sub-page
   - Example: Dashboard → Invoices → Invoice #1234
   - Example: Dashboard → Analysis → New Analysis

3. **Quick Actions** (below header):
   - Back to Dashboard button
   - Back to Module Home button (if in sub-page)

## Modules to Update

### 1. Analysis Module
- `/analysis/new` - New Analysis
- `/analysis/saved` - Saved Analyses  
- `/analysis/:id/progress` - Analysis Progress
- `/analysis/:id/results` - Analysis Results

### 2. Invoice Module
- `/invoices` - Invoice List
- `/invoices/upload` - Upload Invoice
- `/invoices/:id` - Invoice Detail

### 3. Menu Module
- `/menu/dashboard` - Menu Dashboard
- `/menu/upload` - Upload Menu
- `/menu/:id/recipe` - Menu Item Recipe
- `/menu/parsing/:id` - Menu Parsing Progress

### 4. Menu Comparison Module
- `/menu-comparison` - New Comparison
- `/menu-comparison/saved` - Saved Comparisons
- `/menu-comparison/:id/select` - Competitor Selection
- `/menu-comparison/:id/results` - Comparison Results

### 5. Analytics Module
- `/analytics` - Price Analytics Dashboard

## Implementation Plan

1. Create `<PageHeader>` component with:
   - Brand logo
   - Breadcrumbs
   - User info
   - Quick action buttons

2. Update each page to use `<PageHeader>`

3. Global find/replace:
   - "Restaurant CI" → "RestaurantIQ"
   - Ensure consistent styling

## Design Tokens
- Brand: RestaurantIQ
- Primary color: Emerald (already established)
- Background: Obsidian dark theme
- Consistent card styling with hover states

Would you like me to proceed with implementation?
