# RestaurantIQ Dark Theme Library

Complete dark mode design system for the RestaurantIQ Competitive Intelligence Platform.

## Overview

This theme library provides a comprehensive set of design tokens, utilities, and components that implement the brand specification's dark mode design system.

## Structure

```
theme/
├── globals.css              # CSS variables and base styles
├── tailwind.config.ts       # Tailwind configuration
├── fonts.ts                 # Font loading utilities
├── animations.css           # Animation keyframes
├── utilities.css            # Custom utility classes
├── index.ts                 # Main export file
├── ThemeTest.tsx           # Visual test page
└── README.md               # This file
```

## Installation

The theme is already integrated into the application. No additional installation needed.

## Usage

### Importing Theme Utilities

```typescript
import { 
  colors, 
  spacing, 
  fonts, 
  getFontFamily 
} from '@/design-system/theme';
```

### Using CSS Variables

```css
.my-component {
  background: var(--bg-slate-850);
  color: var(--text-primary);
  border: 1px solid var(--border-default);
}
```

### Using Tailwind Classes

```tsx
<div className="bg-obsidian text-primary border border-default rounded-lg p-6">
  <h2 className="text-2xl font-bold text-gradient-primary">
    Heading
  </h2>
</div>
```

### Using Utility Classes

```tsx
// Buttons
<button className="btn-primary">Primary</button>
<button className="btn-secondary">Secondary</button>
<button className="btn-ghost">Ghost</button>

// Badges
<span className="badge-confidence-high">High</span>
<span className="badge-opportunity">Opportunity</span>

// Cards
<div className="card-elevated p-6">Content</div>
<div className="card-interactive p-6">Hover me</div>

// Hover effects
<div className="hover-lift">Lifts on hover</div>
<div className="hover-glow">Glows on hover</div>

// Animations
<div className="animate-fade-in">Fades in</div>
<div className="animate-slide-up">Slides up</div>
```

## Color Palette

### Brand Colors
- **Obsidian**: `#0B1215` - Primary background
- **Emerald**: `#10b981` - Primary accent
- **Cyan**: `#06b6d4` - Secondary accent

### Semantic Colors
- **Success**: Green tones
- **Error**: Red tones
- **Warning**: Orange/yellow tones
- **Info**: Cyan tones
- **Neutral**: Gray tones

## Typography

### Font Families
- **Sans**: Inter (300, 400, 500, 600, 700, 800)
- **Mono**: JetBrains Mono (400, 500, 600, 700)

### Font Sizes
- `xs`: 0.75rem
- `sm`: 0.875rem
- `base`: 1rem
- `lg`: 1.125rem
- `xl`: 1.25rem
- `2xl`: 1.5rem
- `3xl`: 1.875rem
- `4xl`: 2.25rem
- `5xl`: 3rem

## Spacing Scale

Based on 0.25rem (4px) increments:
- `1`: 0.25rem (4px)
- `2`: 0.5rem (8px)
- `3`: 0.75rem (12px)
- `4`: 1rem (16px)
- `6`: 1.5rem (24px)
- `8`: 2rem (32px)
- `12`: 3rem (48px)
- `16`: 4rem (64px)

## Animations

### Available Animations
- `animate-fade-in`: Fade in effect
- `animate-fade-out`: Fade out effect
- `animate-slide-up`: Slide up from bottom
- `animate-slide-down`: Slide down from top
- `animate-slide-in-right`: Slide in from right
- `animate-slide-in-left`: Slide in from left
- `animate-scale-in`: Scale in effect
- `animate-spin`: Continuous rotation
- `animate-pulse`: Pulsing opacity
- `animate-bounce`: Bouncing effect
- `animate-shimmer`: Shimmer loading effect

### Durations
- `fast`: 150ms
- `normal`: 300ms
- `slow`: 500ms
- `slower`: 700ms

## Shadows

- `shadow-sm`: Small shadow
- `shadow-md`: Medium shadow (default)
- `shadow-lg`: Large shadow
- `shadow-xl`: Extra large shadow
- `shadow-2xl`: 2X large shadow
- `shadow-emerald`: Emerald colored shadow
- `shadow-cyan`: Cyan colored shadow

## Gradients

- `bg-gradient-primary`: Emerald gradient
- `bg-gradient-secondary`: Cyan gradient
- `bg-gradient-accent`: Emerald to cyan
- `bg-gradient-dark`: Dark background gradient
- `bg-gradient-card`: Card background gradient
- `bg-gradient-glow`: Radial glow effect

## Z-Index Layers

- `z-base`: 0
- `z-dropdown`: 1000
- `z-sticky`: 1100
- `z-fixed`: 1200
- `z-modal-backdrop`: 1300
- `z-modal`: 1400
- `z-popover`: 1500
- `z-tooltip`: 1600

## Accessibility

### Focus States
All interactive elements have visible focus states using the emerald accent color.

### Reduced Motion
The theme respects `prefers-reduced-motion` settings and disables animations when requested.

### Color Contrast
All text colors meet WCAG AA standards for contrast against their backgrounds.

### Screen Reader Support
Use the `.sr-only` utility class for screen reader only content.

## Testing

View the theme test page to see all components and utilities in action:

```tsx
import ThemeTest from '@/design-system/theme/ThemeTest';

// Render in your app
<ThemeTest />
```

## Customization

### Extending Colors

Add custom colors in `tailwind.config.ts`:

```typescript
colors: {
  custom: {
    500: '#yourcolor',
  },
}
```

### Adding Utilities

Add custom utilities in `utilities.css`:

```css
@layer utilities {
  .my-utility {
    /* your styles */
  }
}
```

### Custom Animations

Add keyframes in `animations.css`:

```css
@keyframes myAnimation {
  from { /* start */ }
  to { /* end */ }
}
```

## Best Practices

1. **Use CSS Variables**: Prefer CSS variables for dynamic theming
2. **Semantic Classes**: Use semantic utility classes (btn-primary, card-elevated)
3. **Consistent Spacing**: Use the spacing scale for margins and padding
4. **Accessible Colors**: Always check contrast ratios
5. **Performance**: Use `will-change` sparingly for animations
6. **Responsive**: Design mobile-first, enhance for larger screens

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions

## Version

Current version: 1.0.0

## License

Proprietary - Restaurant Competitive Intelligence Platform
