# Theme Library Build Instructions

**Project:** Restaurant Competitive Intelligence Platform  
**Task:** Build Complete Theme Library for Brand Spec Integration  
**Location:** `frontend/src/design-system/theme/`

---

## Overview

Build a complete theme library that implements the brand specification's dark mode design system. This library will provide CSS variables, Tailwind configuration, font loading, and utility functions for the entire application.

---

## File Structure to Create

```
frontend/src/design-system/theme/
├── globals.css              # Complete CSS variables and base styles
├── tailwind.config.ts       # Full Tailwind configuration
├── fonts.ts                 # Font loading utilities
├── animations.css           # Animation keyframes
├── utilities.css            # Custom utility classes
└── index.ts                 # Export all theme utilities
```

---

## Task 1: Create globals.css

**Location:** `frontend/src/design-system/theme/globals.css`

**Requirements:**
1. Import Google Fonts (Inter and JetBrains Mono)
2. Define ALL CSS variables from brand spec
3. Set up base styles for body, html
4. Include Tailwind directives
5. Add accessibility styles (focus states, reduced motion)

**CSS Variables to Include:**

### Colors
- Brand colors: obsidian, emerald (400/500/600), cyan (400/500/600)
- Background colors: obsidian, slate (900/850/800), modal overlay, sidebar
- Text colors: primary, secondary, tertiary, disabled, headings (h1-h6)
- Link colors: default, hover, visited, active, muted
- Border colors: default, input, divider, focus, hover, accent
- Semantic colors: success, error, warning, info, neutral (bg/border/text/icon for each)

### Interactive Elements
- Button colors: primary (bg/hover/active/disabled), secondary, ghost
- Form element colors: input (bg/focus/text/border/placeholder), dropdown, checkbox, toggle, radio
- Navigation colors: item (inactive/active/hover), bg-active, indicator, badge

### Data Visualization
- Chart colors: 6 colors for sequential data
- Progress colors: bg, fill, text
- Badge/tag colors: confidence levels (high/medium/low), insight types (opportunity/threat/watch)
- Star ratings: filled, empty, half

### Shadows & Overlays
- Shadow scale: sm, md, lg, xl, 2xl
- Colored shadows: emerald, cyan
- Overlay colors: light, medium, heavy, gradient

### Gradients
- Primary, secondary, accent, dark, card, glow

### Spacing
- Space scale: 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32

### Typography
- Font families: sans, mono
- Font sizes: xs through 5xl
- Font weights: 300-800
- Line heights: tight, snug, normal, relaxed

### Layout
- Width scale: prose, narrow, content, wide, full
- Z-index layers: base, dropdown, sticky, fixed, modal-backdrop, modal, popover, tooltip

### Transitions
- Duration: fast, normal, slow, slower
- Easing: in, out, in-out, spring

**Base Styles Required:**
```css
body {
  background: var(--bg-obsidian);
  color: var(--text-primary);
  font-family: var(--font-sans);
  font-size: 1rem;
  line-height: 1.6;
  antialiased;
}

html {
  scroll-behavior: smooth;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Task 2: Create tailwind.config.ts

**Location:** `frontend/src/design-system/theme/tailwind.config.ts`

**Requirements:**
1. Export TypeScript Tailwind config
2. Extend default theme with brand colors
3. Add custom font families
4. Define custom spacing, shadows, animations
5. Include all brand spec specifications

**Key Sections:**

### Colors to Add
```typescript
colors: {
  obsidian: {
    DEFAULT: '#0B1215',
    50: '#3A4D55',
    100: '#344449',
    // ... full scale
  },
  emerald: {
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
  },
  cyan: {
    400: '#22d3ee',
    500: '#06b6d4',
    600: '#0891b2',
  },
  slate: {
    // Custom slate scale for dark mode
  }
}
```

### Font Families
```typescript
fontFamily: {
  sans: ['Inter', ...defaultTheme.fontFamily.sans],
  mono: ['JetBrains Mono', 'Fira Code', ...defaultTheme.fontFamily.mono],
}
```

### Custom Shadows
```typescript
boxShadow: {
  'emerald': '0 8px 16px rgba(16, 185, 129, 0.25)',
  'cyan': '0 8px 16px rgba(6, 182, 212, 0.25)',
  // ... dark mode shadows
}
```

### Animations
```typescript
animation: {
  'fade-in': 'fadeIn 0.6s ease-out',
  'slide-up': 'slideUp 0.6s ease-out',
  'slide-in-right': 'slideInRight 0.6s ease-out',
  'spin': 'spin 1s linear infinite',
  'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
}
```

### Keyframes
```typescript
keyframes: {
  fadeIn: {
    '0%': { opacity: '0' },
    '100%': { opacity: '1' },
  },
  slideUp: {
    '0%': { opacity: '0', transform: 'translateY(20px)' },
    '100%': { opacity: '1', transform: 'translateY(0)' },
  },
  // ... all animations from brand spec
}
```

---

## Task 3: Create animations.css

**Location:** `frontend/src/design-system/theme/animations.css`

**Requirements:**
Define all keyframe animations from brand spec:
- fadeIn, fadeOut
- slideUp, slideDown, slideInRight, slideInLeft
- scaleIn
- spin, pulse, bounce
- shimmer (for skeleton screens)

**Example Structure:**
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* ... all other animations */
```

---

## Task 4: Create utilities.css

**Location:** `frontend/src/design-system/theme/utilities.css`

**Requirements:**
Custom utility classes for common patterns:

```css
@layer utilities {
  /* Text utilities */
  .text-balance {
    text-wrap: balance;
  }
  
  /* Hover effects */
  .hover-lift {
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .hover-lift:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  }
  
  .hover-glow:hover {
    box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
  }
  
  /* Gradient backgrounds */
  .bg-gradient-primary {
    background: linear-gradient(135deg, #10b981, #059669);
  }
  
  .bg-gradient-card {
    background: linear-gradient(135deg, #1a2332, #141c1f);
  }
  
  /* Screen reader only */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
  
  /* Backdrop blur */
  .backdrop-blur-glass {
    backdrop-filter: blur(12px);
    background: rgba(15, 23, 42, 0.8);
  }
}
```

---

## Task 5: Create fonts.ts

**Location:** `frontend/src/design-system/theme/fonts.ts`

**Requirements:**
TypeScript utilities for font loading and management

```typescript
export const fonts = {
  sans: {
    family: 'Inter',
    weights: [300, 400, 500, 600, 700, 800],
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap',
  },
  mono: {
    family: 'JetBrains Mono',
    weights: [400, 500, 600, 700],
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap',
  },
};

export function getFontImportLinks(): string[] {
  return [
    fonts.sans.googleFontsUrl,
    fonts.mono.googleFontsUrl,
  ];
}

export function getFontPreconnectLinks(): string[] {
  return [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
  ];
}
```

---

## Task 6: Create index.ts

**Location:** `frontend/src/design-system/theme/index.ts`

**Requirements:**
Export all theme utilities for easy importing

```typescript
// Export font utilities
export * from './fonts';

// Export Tailwind config
export { default as tailwindConfig } from './tailwind.config';

// Re-export CSS files (for documentation)
export const themeFiles = {
  globals: './globals.css',
  animations: './animations.css',
  utilities: './utilities.css',
};

// Theme metadata
export const themeMetadata = {
  name: 'Restaurant CI Dark',
  version: '1.0.0',
  primaryColor: '#10b981',
  backgroundColor: '#0B1215',
  mode: 'dark',
};
```

---

## Integration Instructions

After building all files, update the main application:

### 1. Update frontend/src/index.css

Replace current content with:
```css
/* Import theme styles */
@import './design-system/theme/globals.css';
@import './design-system/theme/animations.css';
@import './design-system/theme/utilities.css';
```

### 2. Update frontend/tailwind.config.js

Replace with:
```javascript
import config from './src/design-system/theme/tailwind.config';
export default config;
```

### 3. Update frontend/index.html

Add font preconnect and import:
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

## Testing Checklist

After building the theme library:

- [ ] All CSS variables are defined
- [ ] Tailwind config compiles without errors
- [ ] Fonts load correctly
- [ ] Animations work smoothly
- [ ] Dark mode colors display correctly
- [ ] No console errors
- [ ] Accessibility features work (focus states, reduced motion)
- [ ] All gradients render properly
- [ ] Shadows display correctly

---

## Reference

All specifications come from the brand spec document. Key values:

**Primary Colors:**
- Obsidian: #0B1215
- Emerald: #10b981
- Cyan: #06b6d4

**Typography:**
- Base size: 16px (mobile), 18px (desktop)
- Font: Inter (sans), JetBrains Mono (mono)
- Scale: 0.75rem to 3.5rem

**Spacing:**
- Base unit: 0.25rem (4px)
- Scale: 1, 2, 3, 4, 6, 8, 12, 16, 20, 24, 32

---

## Success Criteria

Theme library is complete when:
1. All files created and properly structured
2. CSS variables match brand spec exactly
3. Tailwind config extends theme correctly
4. Fonts load without errors
5. Animations are smooth and performant
6. No TypeScript errors
7. Integration instructions work
8. Test page renders with new theme

---

**Start with globals.css (most critical), then tailwind.config.ts, then the rest.**
