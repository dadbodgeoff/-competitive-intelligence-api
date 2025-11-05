# Design Token Repository - Complete

**Status:** ✅ Complete  
**Date:** October 29, 2025  
**Location:** `frontend/src/design-system/`

---

## What Was Built

A complete design token repository that serves as the single source of truth for all design values in the application. This system allows you to import and use design tokens anywhere in your React components.

---

## File Structure Created

```
frontend/src/design-system/
├── tokens/
│   ├── colors.ts          ✅ All color definitions
│   ├── typography.ts      ✅ Font families, sizes, weights
│   ├── spacing.ts         ✅ Spacing scale and component spacing
│   ├── shadows.ts         ✅ Shadows and gradients
│   ├── animations.ts      ✅ Animation configurations
│   ├── layout.ts          ✅ Breakpoints, z-index, widths
│   └── index.ts           ✅ Token exports
├── utils/
│   ├── classNames.ts      ✅ Class name utilities (cn function)
│   ├── colorHelpers.ts    ✅ Color helper functions
│   └── index.ts           ✅ Utility exports
├── index.ts               ✅ Main export point
└── README.md              ✅ Documentation

Total: 12 files created
```

---

## Key Features

### 1. Complete Color System

**File:** `tokens/colors.ts`

Includes:
- Brand colors (Obsidian, Emerald, Cyan)
- Background colors (dark mode palette)
- Text colors (primary, secondary, tertiary)
- Border colors (with transparency)
- Semantic colors (success, error, warning, info, neutral)
- Insight colors (opportunity, threat, watch)
- Confidence colors (high, medium, low)
- Chart colors (6-color palette)
- Star rating colors

**Helper Functions:**
- `getInsightColor(type)` - Get colors for insight type
- `getConfidenceColor(level)` - Get colors for confidence level
- `getSemanticColor(type)` - Get colors for semantic type

### 2. Typography System

**File:** `tokens/typography.ts`

Includes:
- Font families (Inter, JetBrains Mono)
- Font sizes (xs to 5xl)
- Font weights (300-800)
- Line heights (tight, snug, normal, relaxed)
- Letter spacing
- Complete heading styles (h1-h6)
- Responsive heading sizes

**Helper Functions:**
- `getHeadingStyle(level)` - Get complete heading style object

### 3. Spacing System

**File:** `tokens/spacing.ts`

Includes:
- Base spacing scale (0-32)
- Component-specific spacing (buttons, cards, inputs)
- Gap sizes (sm, md, lg, xl)
- Border radius scale

**Helper Functions:**
- `getSpacing(key)` - Get spacing value
- `getGap(size)` - Get gap value

### 4. Shadows & Gradients

**File:** `tokens/shadows.ts`

Includes:
- Shadow scale (sm to 2xl)
- Colored shadows (emerald, cyan)
- Overlay colors (light, medium, heavy)
- Gradient definitions (primary, secondary, accent, card, glow)

**Helper Functions:**
- `getShadow(size)` - Get shadow value
- `getGradient(type)` - Get gradient value

### 5. Animation System

**File:** `tokens/animations.ts`

Includes:
- Duration scale (fast, normal, slow, slower)
- Easing functions (in, out, inOut, spring)
- Animation definitions (fadeIn, slideUp, spin, pulse, etc.)
- Transition presets

**Helper Functions:**
- `getAnimation(name, options)` - Get animation string
- `getTransition(type)` - Get transition value

### 6. Layout System

**File:** `tokens/layout.ts`

Includes:
- Breakpoints (sm to 2xl)
- Content widths (prose, narrow, content, wide, full)
- Z-index layers (dropdown, modal, tooltip, etc.)
- Container padding

**Helper Functions:**
- `getBreakpoint(size)` - Get breakpoint value
- `getZIndex(layer)` - Get z-index value
- `getContentWidth(size)` - Get content width

### 7. Utility Functions

**File:** `utils/classNames.ts`

- `cn(...inputs)` - Merge class names with Tailwind conflict resolution
- `conditionalClass(condition, trueClass, falseClass)` - Conditional classes
- `variantClass(variant, variantMap, baseClass)` - Variant-based classes

**File:** `utils/colorHelpers.ts`

- `getInsightClasses(type)` - Get Tailwind classes for insight type
- `getConfidenceClasses(level)` - Get Tailwind classes for confidence level
- `getSemanticClasses(type)` - Get Tailwind classes for semantic type
- `getRatingClasses(rating)` - Get classes for star ratings
- `getInsightIcon(type)` - Get emoji icon for insight type
- `getSemanticIcon(type)` - Get emoji icon for semantic type

---

## Usage Examples

### Example 1: Using Colors in Components

```typescript
import { brandColors, semanticColors } from '@/design-system';

function MyButton() {
  return (
    <button style={{
      backgroundColor: brandColors.emerald[500],
      color: textColors.primary,
    }}>
      Click Me
    </button>
  );
}
```

### Example 2: Using Color Helpers

```typescript
import { getInsightClasses, getInsightIcon } from '@/design-system';

function InsightBadge({ type }: { type: 'opportunity' | 'threat' | 'watch' }) {
  const { classes } = getInsightClasses(type);
  const icon = getInsightIcon(type);
  
  return (
    <span className={classes}>
      {icon} {type}
    </span>
  );
}
```

### Example 3: Using the cn Utility

```typescript
import { cn } from '@/design-system';

function Card({ className, isActive }: { className?: string; isActive?: boolean }) {
  return (
    <div className={cn(
      'rounded-lg p-4 border',
      isActive && 'border-emerald-500',
      className
    )}>
      Content
    </div>
  );
}
```

### Example 4: Using Typography

```typescript
import { fontFamilies, fontSizes, getHeadingStyle } from '@/design-system';

function Heading() {
  const h1Style = getHeadingStyle('h1');
  
  return (
    <h1 style={h1Style}>
      Welcome
    </h1>
  );
}
```

### Example 5: Using Spacing

```typescript
import { spacing, gaps } from '@/design-system';

function Layout() {
  return (
    <div style={{
      padding: spacing[6],
      gap: gaps.lg,
    }}>
      Content
    </div>
  );
}
```

---

## TypeScript Support

All tokens are fully typed:

```typescript
import type {
  InsightType,
  ConfidenceLevel,
  SemanticType,
  HeadingLevel,
  SpacingSize,
  ShadowSize,
  AnimationName,
  BreakpointSize,
} from '@/design-system';

// TypeScript will enforce correct values
const type: InsightType = 'opportunity'; // ✅
const type: InsightType = 'invalid'; // ❌ TypeScript error
```

---

## Integration with Existing Code

### Update Imports

**Before:**
```typescript
import { cn } from '@/lib/utils';
```

**After:**
```typescript
import { cn } from '@/design-system';
```

### Use Token Values

**Before:**
```typescript
<div className="bg-green-500 text-white" />
```

**After:**
```typescript
import { getInsightClasses } from '@/design-system';
const { classes } = getInsightClasses('opportunity');
<div className={classes} />
```

---

## Next Steps

Now that the token repository is complete, the other agent can build the theme library:

1. ✅ **Design Tokens** - Complete (this document)
2. ⏳ **Theme Library** - In progress (other agent)
   - `theme/globals.css` - CSS variables
   - `theme/tailwind.config.ts` - Tailwind configuration
   - `theme/fonts.ts` - Font loading
   - `theme/animations.css` - Animation keyframes
   - `theme/utilities.css` - Custom utilities

3. 🔜 **Component Migration** - After theme library
   - Update existing components to use new tokens
   - Apply new styling
   - Test accessibility

---

## Benefits of This Approach

✅ **Single Source of Truth** - All design values in one place  
✅ **Type Safety** - Full TypeScript support  
✅ **Easy Updates** - Change once, update everywhere  
✅ **Consistency** - Enforces design system usage  
✅ **Developer Experience** - Autocomplete and IntelliSense  
✅ **Maintainability** - Clear structure and documentation  
✅ **Scalability** - Easy to extend and modify  
✅ **Reusability** - Import anywhere in the app  

---

## Testing the Tokens

You can test the tokens immediately:

```typescript
// In any component file
import {
  brandColors,
  spacing,
  shadows,
  getInsightClasses,
  cn,
} from '@/design-system';

console.log('Brand Colors:', brandColors);
console.log('Spacing:', spacing);
console.log('Shadows:', shadows);
console.log('Insight Classes:', getInsightClasses('opportunity'));
```

---

## Documentation

Full documentation is available in:
- `frontend/src/design-system/README.md` - Complete usage guide
- `frontend/BRAND_INTEGRATION_ANALYSIS.md` - Integration strategy
- `frontend/THEME_LIBRARY_BUILD_PROMPT.md` - Theme library instructions

---

## Summary

The design token repository is **complete and ready to use**. It provides:

- 6 token files (colors, typography, spacing, shadows, animations, layout)
- 2 utility files (classNames, colorHelpers)
- Full TypeScript support
- Helper functions for common patterns
- Comprehensive documentation

You can now:
1. Import tokens in any component
2. Use helper functions for styling
3. Build the theme library (CSS/Tailwind)
4. Start migrating components

**The foundation is solid. Ready to build on top of it!** 🚀
