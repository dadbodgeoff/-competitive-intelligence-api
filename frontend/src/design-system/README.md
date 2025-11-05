# Design System

Restaurant Competitive Intelligence Platform Design System v1.0

## Overview

This design system implements the brand specification with a dark mode-first approach, featuring Obsidian backgrounds with Emerald and Cyan accents.

## Structure

```
design-system/
├── tokens/              # Design tokens (colors, typography, spacing, etc.)
│   ├── colors.ts       # All color definitions
│   ├── typography.ts   # Font families, sizes, weights
│   ├── spacing.ts      # Spacing scale and component spacing
│   ├── shadows.ts      # Shadows and gradients
│   ├── animations.ts   # Animation configurations
│   ├── layout.ts       # Breakpoints, z-index, widths
│   └── index.ts        # Token exports
├── utils/              # Utility functions
│   ├── classNames.ts   # Class name utilities (cn function)
│   ├── colorHelpers.ts # Color helper functions
│   └── index.ts        # Utility exports
├── theme/              # Theme configuration (CSS, Tailwind)
│   ├── globals.css     # CSS variables and base styles
│   ├── tailwind.config.ts # Tailwind configuration
│   ├── fonts.ts        # Font loading utilities
│   ├── animations.css  # Animation keyframes
│   └── utilities.css   # Custom utility classes
└── index.ts            # Main export point
```

## Usage

### Importing Tokens

```typescript
import { brandColors, spacing, shadows } from '@/design-system';

// Use in components
const buttonStyle = {
  backgroundColor: brandColors.emerald[500],
  padding: spacing[4],
  boxShadow: shadows.emerald,
};
```

### Using Color Helpers

```typescript
import { getInsightClasses, getConfidenceClasses } from '@/design-system';

// Get Tailwind classes for insight type
const { classes, colors } = getInsightClasses('opportunity');
// classes: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'

// Get classes for confidence level
const confidenceClasses = getConfidenceClasses('high');
```

### Using the cn Utility

```typescript
import { cn } from '@/design-system';

// Merge class names with conflict resolution
<div className={cn(
  'base-class',
  isActive && 'active-class',
  className
)} />
```

### Accessing Typography

```typescript
import { fontFamilies, fontSizes, getHeadingStyle } from '@/design-system';

// Use font families
const textStyle = {
  fontFamily: fontFamilies.sans,
  fontSize: fontSizes.lg,
};

// Get complete heading style
const h1Style = getHeadingStyle('h1');
```

### Using Animations

```typescript
import { getAnimation, durations, easings } from '@/design-system';

// Get animation string
const fadeIn = getAnimation('fadeIn');
// Result: 'fadeIn 0.6s ease-out'

// Custom duration
const slowFade = getAnimation('fadeIn', { duration: '1s' });
```

## Key Design Tokens

### Colors

**Brand Colors:**
- Obsidian: `#0B1215` (primary background)
- Emerald: `#10b981` (primary actions, success)
- Cyan: `#06b6d4` (secondary actions, info)

**Semantic Colors:**
- Success: Emerald tones
- Error: Red tones
- Warning: Amber tones
- Info: Cyan tones

**Insight Types:**
- Opportunity: Emerald
- Threat: Red
- Watch: Amber

**Confidence Levels:**
- High: Emerald
- Medium: Amber
- Low: Slate gray

### Typography

**Font Families:**
- Sans: Inter (primary)
- Mono: JetBrains Mono (code/data)

**Font Sizes:**
- xs: 12px
- sm: 14px
- base: 16px
- lg: 18px
- xl: 20px
- 2xl: 24px
- 3xl: 32px
- 4xl: 40px
- 5xl: 56px

### Spacing

**Base Unit:** 4px (0.25rem)

**Scale:** 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32

### Shadows

- sm, md, lg, xl, 2xl (standard elevation)
- emerald, cyan (colored shadows for accents)

### Breakpoints

- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px
- 2xl: 1536px

## Best Practices

### 1. Always Use Tokens

❌ Don't hardcode values:
```typescript
<div style={{ color: '#10b981' }} />
```

✅ Use tokens:
```typescript
import { brandColors } from '@/design-system';
<div style={{ color: brandColors.emerald[500] }} />
```

### 2. Use Helper Functions

❌ Don't manually construct classes:
```typescript
<Badge className="bg-emerald-500/10 border-emerald-500/30 text-emerald-400" />
```

✅ Use helpers:
```typescript
import { getInsightClasses } from '@/design-system';
const { classes } = getInsightClasses('opportunity');
<Badge className={classes} />
```

### 3. Use the cn Utility

❌ Don't concatenate strings:
```typescript
<div className={`base ${isActive ? 'active' : ''} ${className}`} />
```

✅ Use cn:
```typescript
import { cn } from '@/design-system';
<div className={cn('base', isActive && 'active', className)} />
```

### 4. Responsive Design

Use mobile-first approach with breakpoints:
```typescript
<div className="text-base md:text-lg lg:text-xl" />
```

### 5. Accessibility

- Always verify color contrast ratios
- Use semantic HTML
- Include ARIA labels
- Support keyboard navigation
- Respect reduced motion preferences

## TypeScript Support

All tokens are fully typed for TypeScript:

```typescript
import type { InsightType, ConfidenceLevel, SemanticType } from '@/design-system';

function MyComponent({ type }: { type: InsightType }) {
  // TypeScript knows type can only be 'opportunity' | 'threat' | 'watch'
  const { classes } = getInsightClasses(type);
}
```

## Theme Integration

The design system integrates with:
- **Tailwind CSS** - via `tailwind.config.ts`
- **CSS Variables** - via `globals.css`
- **React Components** - via token imports

## Updates

When updating the design system:

1. Update tokens in `tokens/` directory
2. Update theme files in `theme/` directory
3. Update this README
4. Run tests to ensure no breaking changes
5. Update version in `tokens/index.ts`

## Support

For questions or issues with the design system, refer to:
- Brand specification document
- `BRAND_INTEGRATION_ANALYSIS.md`
- Component documentation

---

**Version:** 1.0.0  
**Last Updated:** October 29, 2025
