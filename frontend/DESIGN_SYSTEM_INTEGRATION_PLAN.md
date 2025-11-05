# Design System Integration Plan

**Status:** Ready to Execute  
**Estimated Time:** 2-3 hours  
**Risk Level:** Low (non-breaking changes)

---

## Current State

✅ **Design tokens** - Complete (colors, typography, spacing, etc.)  
✅ **Components** - 7 restaurant-specific components built  
✅ **Theme library** - Complete (CSS variables, Tailwind config, fonts)  
✅ **100% Brand Compliance** - All fixes applied  

**Current Frontend Stack:**
- React 18 + TypeScript
- Vite build system
- Tailwind CSS 3.3
- Existing shadcn/ui components
- Current styling: Light mode with generic colors

---

## Integration Strategy

### Phase 1: Foundation (30 min)
**Goal:** Set up theme without breaking existing app

**Steps:**
1. Update `index.css` to import design system theme
2. Update `tailwind.config.js` to use design system config
3. Add font preconnect links to `index.html`
4. Test that app still runs

**Risk:** Low - additive changes only

---

### Phase 2: Verify Theme (15 min)
**Goal:** Confirm theme is loaded correctly

**Steps:**
1. Create test page to verify colors, fonts, spacing
2. Check browser DevTools for CSS variables
3. Verify fonts are loading
4. Test dark mode styling

**Risk:** None - just verification

---

### Phase 3: Component Migration (1-2 hours)
**Goal:** Replace existing components with design system components

**Priority Order:**
1. **InsightCard** (replace EnhancedInsightCard) - 20 min
2. **CompetitorCard** (replace cards in CompetitorsTable) - 20 min
3. **AnalysisProgress** (replace AnalysisProgressTracker) - 15 min
4. Update remaining components to use design tokens - 30-60 min

**Risk:** Medium - requires testing each component

---

### Phase 4: Polish & Test (30 min)
**Goal:** Ensure everything works correctly

**Steps:**
1. Cross-browser testing (Chrome, Firefox, Safari)
2. Mobile responsive check
3. Accessibility audit (keyboard navigation, screen readers)
4. Performance check (bundle size, load time)

**Risk:** Low - just verification

---

## Detailed Steps

### PHASE 1: Foundation Setup

#### Step 1.1: Update index.css

**File:** `frontend/src/index.css`

**Current:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    /* ... old variables */
  }
}
```

**Replace with:**
```css
/* Import design system theme */
@import './design-system/theme/globals.css';
@import './design-system/theme/utilities.css';
```

**Why:** This loads all design system CSS variables and utilities

---

#### Step 1.2: Update tailwind.config.js

**File:** `frontend/tailwind.config.js`

**Current:**
```javascript
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        /* ... */
      },
    },
  },
  plugins: [],
}
```

**Replace with:**
```javascript
import config from './src/design-system/theme/tailwind.config';
export default config;
```

**Why:** Uses design system Tailwind configuration

---

#### Step 1.3: Add Font Links

**File:** `frontend/index.html`

**Add to `<head>` section:**
```html
<head>
  <!-- Existing meta tags -->
  
  <!-- Font preconnect for performance -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  
  <!-- Font import -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
```

**Why:** Loads Inter and JetBrains Mono fonts

---

#### Step 1.4: Test App Runs

```bash
cd frontend
npm run dev
```

**Expected:** App runs without errors, dark mode visible

---

### PHASE 2: Verify Theme

#### Step 2.1: Create Test Page

**File:** `frontend/src/pages/ThemeTest.tsx` (or copy from design-system/theme/ThemeTest.tsx)

```typescript
import { brandColors, spacing, shadows } from '@/design-system';

export function ThemeTest() {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-4xl font-bold">Theme Test</h1>
      
      {/* Color Test */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Colors</h2>
        <div className="flex gap-4">
          <div className="w-20 h-20 bg-obsidian border border-white/10 rounded" />
          <div className="w-20 h-20 bg-emerald-500 rounded" />
          <div className="w-20 h-20 bg-cyan-500 rounded" />
        </div>
      </div>
      
      {/* Typography Test */}
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Typography</h2>
        <p className="font-sans">Inter Font - The quick brown fox</p>
        <p className="font-mono">JetBrains Mono - The quick brown fox</p>
      </div>
      
      {/* Component Test */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Components</h2>
        <button className="btn-primary">Primary Button</button>
        <div className="card-elevated p-4">Card Component</div>
      </div>
    </div>
  );
}
```

**Navigate to:** `http://localhost:5173/theme-test`

**Verify:**
- ✅ Dark background (Obsidian)
- ✅ Emerald and Cyan colors visible
- ✅ Inter font loaded
- ✅ Components styled correctly

---

#### Step 2.2: Check DevTools

**Open Browser DevTools → Elements → Computed Styles**

**Verify CSS variables exist:**
```
--bg-obsidian: #0B1215
--color-emerald-500: #10b981
--color-cyan-500: #06b6d4
--font-sans: 'Inter', ...
```

---

### PHASE 3: Component Migration

#### Step 3.1: Replace EnhancedInsightCard

**File:** `frontend/src/components/analysis/EnhancedInsightsGrid.tsx`

**Before:**
```typescript
import { EnhancedInsightCard } from './EnhancedInsightCard';

{insights.map(insight => (
  <EnhancedInsightCard key={insight.id} groupedInsight={insight} />
))}
```

**After:**
```typescript
import { InsightCard } from '@/design-system/components';

{insights.map(insight => (
  <InsightCard
    key={insight.id}
    title={insight.mainInsight.title}
    description={insight.mainInsight.description}
    type={insight.mainInsight.type}
    confidence={insight.mainInsight.confidence}
    proofQuote={insight.mainInsight.proof_quote}
    competitorName={insight.mainInsight.competitor_name}
    mentionCount={insight.mainInsight.mention_count}
  />
))}
```

**Test:** Verify insights display correctly

---

#### Step 3.2: Replace CompetitorsTable Cards

**File:** `frontend/src/components/analysis/CompetitorsTable.tsx`

**Before:**
```typescript
<Card className="hover:shadow-md">
  <CardHeader>
    <CardTitle>{competitor.name}</CardTitle>
    <Badge>{competitor.rating}</Badge>
  </CardHeader>
  {/* ... */}
</Card>
```

**After:**
```typescript
import { CompetitorCard } from '@/design-system/components';

<CompetitorCard
  name={competitor.name}
  rating={competitor.rating}
  reviewCount={competitor.review_count}
  distance={competitor.distance_miles}
  address={competitor.address}
  onViewDetails={() => handleViewDetails(competitor.id)}
/>
```

**Test:** Verify competitor cards display correctly

---

#### Step 3.3: Replace AnalysisProgressTracker

**File:** `frontend/src/components/analysis/AnalysisProgressTracker.tsx`

**Before:**
```typescript
// Custom progress implementation
```

**After:**
```typescript
import { AnalysisProgress } from '@/design-system/components';

<AnalysisProgress
  steps={[
    { label: 'Fetching data...', status: 'complete', duration: 2.3 },
    { label: 'Analyzing...', status: 'active' },
    { label: 'Generating insights...', status: 'pending' },
  ]}
  totalDuration={estimatedTime}
/>
```

**Test:** Verify progress tracker works

---

#### Step 3.4: Update Remaining Components

**Update these files to use design tokens:**

1. `frontend/src/components/ui/button.tsx`
   - Use `brandColors.emerald[500]` instead of hardcoded colors
   
2. `frontend/src/components/ui/card.tsx`
   - Use `backgroundColors.slate[850]` for card backgrounds
   
3. `frontend/src/components/ui/badge.tsx`
   - Use `getConfidenceClasses()` helper

**Pattern:**
```typescript
import { brandColors, spacing, cn } from '@/design-system';

// Instead of:
className="bg-green-500"

// Use:
style={{ backgroundColor: brandColors.emerald[500] }}
// or
className="bg-emerald-500"
```

---

### PHASE 4: Polish & Test

#### Step 4.1: Cross-Browser Testing

**Test in:**
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari (if on Mac)

**Check:**
- Colors render correctly
- Fonts load
- Animations work
- No console errors

---

#### Step 4.2: Mobile Responsive

**Test breakpoints:**
- 📱 Mobile (375px, 414px)
- 📱 Tablet (768px, 1024px)
- 💻 Desktop (1280px, 1920px)

**Use DevTools responsive mode**

---

#### Step 4.3: Accessibility Audit

**Keyboard Navigation:**
- Tab through all interactive elements
- Enter/Space to activate buttons
- Escape to close modals

**Screen Reader:**
- Use browser screen reader extension
- Verify ARIA labels are present
- Check focus indicators are visible

---

#### Step 4.4: Performance Check

```bash
npm run build
```

**Check bundle size:**
- Should be similar or smaller than before
- Design system is tree-shakeable

**Lighthouse audit:**
- Performance: 90+
- Accessibility: 95+
- Best Practices: 90+

---

## Rollback Plan

If issues occur:

1. **Revert index.css:**
   ```bash
   git checkout frontend/src/index.css
   ```

2. **Revert tailwind.config.js:**
   ```bash
   git checkout frontend/tailwind.config.js
   ```

3. **Revert component changes:**
   ```bash
   git checkout frontend/src/components/
   ```

4. **Restart dev server:**
   ```bash
   npm run dev
   ```

---

## Success Criteria

✅ App runs without errors  
✅ Dark mode (Obsidian) is default  
✅ Emerald/Cyan colors visible  
✅ Inter font loaded  
✅ All components render correctly  
✅ Responsive design works  
✅ Accessibility maintained  
✅ Performance not degraded  

---

## Post-Integration Tasks

1. **Delete old files:**
   - `frontend/src/components/analysis/EnhancedInsightCard.tsx` (if fully replaced)
   - Old theme files (if any)

2. **Update documentation:**
   - Component usage examples
   - Design system guidelines

3. **Team training:**
   - Show team how to use design system
   - Share component examples

---

## Timeline

**Total: 2-3 hours**

- Phase 1 (Foundation): 30 min
- Phase 2 (Verify): 15 min
- Phase 3 (Components): 1-2 hours
- Phase 4 (Polish): 30 min

**Can be done incrementally:**
- Day 1: Phases 1-2 (foundation + verify)
- Day 2: Phase 3 (component migration)
- Day 3: Phase 4 (polish + test)

---

## Ready to Execute?

**Prerequisites:**
- ✅ Design system complete
- ✅ Theme library at 100% compliance
- ✅ Components built and tested
- ✅ Integration plan reviewed

**Next Step:** Execute Phase 1 (Foundation Setup)

**Command to start:**
```bash
# Backup current state
git checkout -b design-system-integration

# Begin Phase 1
# (Follow steps above)
```
