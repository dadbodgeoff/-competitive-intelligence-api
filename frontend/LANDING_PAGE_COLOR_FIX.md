# Landing Page Color Scheme Fix

## Problem
The landing page was using CSS variable syntax like `className="bg-[var(--bg-obsidian)]"` which doesn't work properly with Tailwind CSS. Tailwind needs direct class names, not CSS variables in bracket notation.

## Solution
Replaced all CSS variable references with direct Tailwind classes that match the RestaurantIQ design system.

## Color Mappings Applied

### Background Colors
- `var(--bg-obsidian)` → `obsidian` (custom Tailwind class: #0B1215)
- `var(--bg-slate-900)` → `slate-900` (#0f172a)
- `var(--bg-slate-850)` → `slate-850` (#1a2332)
- `var(--bg-slate-800)` → `slate-800` (#1e293b)

### Brand Colors
- `var(--color-emerald-500)` → `emerald-500` (#10b981)
- `var(--color-emerald-400)` → `emerald-400` (#34d399)
- `var(--color-cyan-500)` → `cyan-500` (#06b6d4)
- `var(--color-cyan-400)` → `cyan-400` (#22d3ee)

### Text Colors
- `var(--text-primary)` → `slate-100` (#f1f5f9)
- `var(--text-secondary)` → `slate-300` (#cbd5e1)
- `var(--text-tertiary)` → `slate-400` (#94a3b8)
- `var(--text-disabled)` → `slate-500` (#64748b)

### Border Colors
- `var(--border-default)` → `white/10` (rgba(255, 255, 255, 0.1))
- `var(--border-accent)` → `emerald-500/30` (rgba(16, 185, 129, 0.3))

## Design System Compliance

The landing page now uses:
- ✅ **Obsidian** (#0B1215) - Dark background
- ✅ **Emerald** (#10b981) - Primary accent for CTAs and success states
- ✅ **Cyan** (#06b6d4) - Secondary accent for highlights
- ✅ **Slate** grays - Text hierarchy (100, 300, 400, 500)
- ✅ **Inter** font family (from design system)
- ✅ **Proper gradients** - Emerald to Cyan for hero text
- ✅ **Consistent spacing** - Using Tailwind's spacing scale

## Components Using Correct Colors

1. **Navbar** - Slate-900 background with emerald hover states
2. **Hero Section** - Obsidian background with emerald/cyan gradient text
3. **CTA Buttons** - Emerald gradient (from shadcn Button component)
4. **Feature Cards** - Slate-850/900 backgrounds with emerald accents
5. **Progress Bar** - Emerald fill on slate-800 background
6. **Badges** - Emerald for success, cyan for info
7. **Pricing Cards** - Emerald borders and accents

## No More Teal!
The incorrect teal color (#00D1B2) has been completely removed. All accents now use the correct RestaurantIQ brand colors (Emerald and Cyan).

## Testing
Run the dev server to see the changes:
```bash
cd frontend
npm run dev
```

The landing page should now display with:
- Dark obsidian background
- Emerald green primary buttons and accents
- Cyan blue secondary highlights
- Proper text contrast with slate colors
