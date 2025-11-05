# Design System Integration Guide

**Complete Guide to Integrating the Design System**  
**Date:** October 29, 2025

---

## Overview

You now have a complete design system with:
- ✅ Design tokens (colors, typography, spacing, etc.)
- ✅ Utility functions (cn, color helpers)
- ✅ 7 restaurant-specific components
- ⏳ Theme library (being built by other agent)

This guide shows you how to integrate everything into your existing application.

---

## Phase 1: Import Design System (Ready Now)

### Step 1: Update Import Paths

You can start using the design system immediately by updating imports:

**Before:**
```typescript
import { cn } from '@/lib/utils';
```

**After:**
```typescript
import { cn } from '@/design-system';
```

### Step 2: Use Design Tokens

Replace hardcoded values with tokens:

**Before:**
```typescript
<div style={{ color: '#10b981', padding: '24px' }} />
```

**After:**
```typescript
import { brandColors, spacing } from '@/design-system';

<div style={{ color: brandColors.emerald[500], padding: spacing[6] }} />
```

### Step 3: Use Helper Functions

Replace manual class construction with helpers:

**Before:**
```typescript
const getTypeColor = (type: string) => {
  switch (type) {
    case 'opportunity': return 'bg-green-100 text-green-800';
    case 'threat': return 'bg-red-100 text-red-800';
    // ...
  }
};
```

**After:**
```typescript
import { getInsightClasses } from '@/design-system';

const { classes } = getInsightClasses(type);
```

---

## Phase 2: Replace Existing Components

### Component Migration Map

| Current Component | Replace With | Status |
|-------------------|--------------|--------|
| `EnhancedInsightCard.tsx` | `InsightCard` | ✅ Ready |
| `CompetitorsTable.tsx` (cards) | `CompetitorCard` | ✅ Ready |
| `AnalysisProgressTracker.tsx` | `AnalysisProgress` | ✅ Ready |
| Tier selection UI | `TierSelector` | ✅ Ready |
| Sentiment badges | `SentimentIndicator` | ✅ Ready |
| Filter UI | `FilterPanel` | ✅ Ready |
| Comparison views | `ComparisonWidget` | ✅ Ready |

### Example: Replace EnhancedInsightCard

**File:** `frontend/src/components/analysis/EnhancedInsightsGrid.tsx`

**Before:**
```typescript
import { EnhancedInsightCard } from './EnhancedInsightCard';

{groupedInsights.map((insight) => (
  <EnhancedInsightCard
    key={insight.mainInsight.id}
    groupedInsight={insight}
    isExpanded={expandedId === insight.mainInsight.id}
    onToggle={() => handleToggle(insight.mainInsight.id)}
  />
))}
```

**After:**
```typescript
import { InsightCard } from '@/design-system';

{groupedInsights.map((insight) => (
  <InsightCard
    key={insight.mainInsight.id}
    title={insight.mainInsight.title}
    description={insight.mainInsight.description}
    type={insight.mainInsight.type}
    confidence={insight.mainInsight.confidence}
    proofQuote={insight.mainInsight.proof_quote}
    competitorName={insight.mainInsight.competitor_name}
    mentionCount={insight.mainInsight.mention_count}
    onExpand={() => handleToggle(insight.mainInsight.id)}
  />
))}
```

### Example: Replace CompetitorsTable Cards

**File:** `frontend/src/components/analysis/CompetitorsTable.tsx`

**Before:**
```typescript
<Card key={competitor.id} className="hover:shadow-md transition-shadow">
  <CardHeader className="pb-3">
    <div className="flex items-start justify-between">
      <CardTitle className="text-lg leading-tight">
        {competitor.name}
      </CardTitle>
      <Badge className={getRatingColor(competitor.rating)}>
        ⭐ {competitor.rating.toFixed(1)}
      </Badge>
    </div>
  </CardHeader>
  {/* ... more code */}
</Card>
```

**After:**
```typescript
import { CompetitorCard } from '@/design-system';

<CompetitorCard
  key={competitor.id}
  name={competitor.name}
  rating={competitor.rating}
  reviewCount={competitor.review_count}
  distance={competitor.distance_miles}
  address={competitor.address}
  onViewDetails={() => handleViewDetails(competitor.id)}
/>
```

---

## Phase 3: Update Styling (After Theme Library)

Once the theme library is complete, update global styles:

### Step 1: Update index.css

**File:** `frontend/src/index.css`

Replace current content with:
```css
/* Import design system theme */
@import './design-system/theme/globals.css';
@import './design-system/theme/animations.css';
@import './design-system/theme/utilities.css';
```

### Step 2: Update Tailwind Config

**File:** `frontend/tailwind.config.js`

Replace with:
```javascript
import config from './src/design-system/theme/tailwind.config';
export default config;
```

### Step 3: Update index.html

**File:** `frontend/index.html`

Add font imports in `<head>`:
```html
<head>
  <!-- Font preconnect -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  
  <!-- Font import -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
```

---

## Phase 4: Component-by-Component Migration

### Priority Order (Recommended)

**Week 1: Core UI Components**
1. Update Button component with new styling
2. Update Card component with gradient backgrounds
3. Update Badge component with new colors
4. Update Input components with dark mode styling

**Week 2: Analysis Components**
1. Replace EnhancedInsightCard with InsightCard
2. Replace CompetitorsTable cards with CompetitorCard
3. Replace AnalysisProgressTracker with AnalysisProgress

**Week 3: Feature Components**
1. Add TierSelector to subscription flow
2. Add SentimentIndicator to review displays
3. Add FilterPanel to analysis pages
4. Add ComparisonWidget to competitor views

**Week 4: Polish & Testing**
1. Update all remaining components
2. Test responsive design
3. Accessibility audit
4. Performance optimization

---

## Quick Start Examples

### Example 1: Simple Component Update

**File:** `frontend/src/pages/AnalysisPage.tsx`

```typescript
import { InsightCard, CompetitorCard } from '@/design-system';

function AnalysisPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold text-slate-100 mb-8">
        Analysis Results
      </h1>
      
      {/* Insights Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-200 mb-6">
          Key Insights
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {insights.map(insight => (
            <InsightCard
              key={insight.id}
              title={insight.title}
              description={insight.description}
              type={insight.type}
              confidence={insight.confidence}
              proofQuote={insight.proof_quote}
              competitorName={insight.competitor_name}
              mentionCount={insight.mention_count}
            />
          ))}
        </div>
      </section>
      
      {/* Competitors Section */}
      <section>
        <h2 className="text-2xl font-semibold text-slate-200 mb-6">
          Competitors
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {competitors.map(competitor => (
            <CompetitorCard
              key={competitor.id}
              name={competitor.name}
              rating={competitor.rating}
              reviewCount={competitor.review_count}
              distance={competitor.distance_miles}
              address={competitor.address}
              onViewDetails={() => navigate(`/competitor/${competitor.id}`)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
```

### Example 2: Using Design Tokens

**File:** `frontend/src/components/custom/CustomCard.tsx`

```typescript
import { cn, brandColors, spacing, shadows } from '@/design-system';

function CustomCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'rounded-lg border transition-all duration-300',
        className
      )}
      style={{
        backgroundColor: brandColors.obsidian,
        padding: spacing[6],
        boxShadow: shadows.md,
        borderColor: 'rgba(255, 255, 255, 0.1)',
      }}
    >
      {children}
    </div>
  );
}
```

### Example 3: Using Color Helpers

**File:** `frontend/src/components/analysis/InsightBadge.tsx`

```typescript
import { getInsightClasses, getInsightIcon } from '@/design-system';

function InsightBadge({ type }: { type: 'opportunity' | 'threat' | 'watch' }) {
  const { classes } = getInsightClasses(type);
  const icon = getInsightIcon(type);
  
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${classes}`}>
      <span>{icon}</span>
      <span className="capitalize">{type}</span>
    </span>
  );
}
```

---

## Testing Checklist

After each component migration:

- [ ] Component renders correctly
- [ ] All props work as expected
- [ ] Hover effects work
- [ ] Click handlers work
- [ ] Responsive design works (mobile, tablet, desktop)
- [ ] Accessibility (keyboard navigation, screen readers)
- [ ] No console errors
- [ ] TypeScript types are correct
- [ ] Performance is acceptable

---

## Common Issues & Solutions

### Issue 1: Import Errors

**Problem:** `Cannot find module '@/design-system'`

**Solution:** Ensure TypeScript path alias is configured:

```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Issue 2: Styling Not Applied

**Problem:** Components don't have dark mode styling

**Solution:** Wait for theme library completion, or manually add dark mode classes:

```typescript
<div className="bg-slate-900 text-slate-100">
  {/* content */}
</div>
```

### Issue 3: Type Errors

**Problem:** TypeScript errors on component props

**Solution:** Import types explicitly:

```typescript
import type { InsightCardProps } from '@/design-system/components';
```

### Issue 4: Missing Icons

**Problem:** Lucide icons not rendering

**Solution:** Ensure lucide-react is installed:

```bash
npm install lucide-react
```

---

## Performance Considerations

### Code Splitting

Import components individually for better tree-shaking:

```typescript
// Good - tree-shakeable
import { InsightCard } from '@/design-system/components/InsightCard';

// Also good - barrel export is optimized
import { InsightCard } from '@/design-system';
```

### Lazy Loading

For large component lists, use React.lazy:

```typescript
import { lazy, Suspense } from 'react';

const InsightCard = lazy(() => import('@/design-system/components/InsightCard'));

function InsightsList() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      {insights.map(insight => (
        <InsightCard key={insight.id} {...insight} />
      ))}
    </Suspense>
  );
}
```

---

## Rollback Plan

If you need to rollback:

1. Keep old components in place during migration
2. Use feature flags to toggle between old/new
3. Git branch strategy: `feature/design-system-migration`
4. Can rollback individual components independently

```typescript
// Feature flag approach
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { InsightCard as NewInsightCard } from '@/design-system';
import { EnhancedInsightCard as OldInsightCard } from '@/components/analysis';

function InsightDisplay(props) {
  const useNewDesign = useFeatureFlag('new-design-system');
  
  return useNewDesign ? (
    <NewInsightCard {...props} />
  ) : (
    <OldInsightCard {...props} />
  );
}
```

---

## Next Steps

1. ✅ **Design tokens created** - Ready to use
2. ✅ **Components created** - Ready to use
3. ⏳ **Theme library** - Being built by other agent
4. 🔜 **Start migration** - Begin with one component
5. 🔜 **Test thoroughly** - Ensure quality
6. 🔜 **Deploy gradually** - Roll out incrementally

---

## Support & Resources

**Documentation:**
- `frontend/src/design-system/README.md` - Design system overview
- `frontend/src/design-system/components/README.md` - Component docs
- `frontend/BRAND_INTEGRATION_ANALYSIS.md` - Integration strategy
- `frontend/DESIGN_TOKENS_COMPLETE.md` - Token documentation
- `frontend/DESIGN_SYSTEM_COMPONENTS_COMPLETE.md` - Component documentation

**Examples:**
- See usage examples in component README
- Check integration examples in this guide
- Review brand spec for design patterns

---

## Summary

You have everything you need to start integrating the design system:

✅ **Design Tokens** - Colors, typography, spacing, etc.  
✅ **Utilities** - cn function, color helpers  
✅ **Components** - 7 production-ready components  
✅ **Documentation** - Comprehensive guides  
✅ **TypeScript** - Full type safety  
✅ **Examples** - Real-world usage patterns  

**Start with one component, test thoroughly, then expand gradually.**

Good luck with the integration! 🚀
