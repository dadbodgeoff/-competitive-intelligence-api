/**
 * Theme Library - RestaurantIQ Dark Mode Design System
 * Central export point for all theme utilities and configurations
 */

// Export font utilities
export * from './fonts';

// Export Tailwind config
export { default as tailwindConfig } from './tailwind.config';

// Re-export CSS files (for documentation and reference)
export const themeFiles = {
  globals: './globals.css',
  animations: './animations.css',
  utilities: './utilities.css',
} as const;

/**
 * Theme metadata
 */
export const themeMetadata = {
  name: 'RestaurantIQ Dark',
  version: '1.0.0',
  primaryColor: '#10b981',
  backgroundColor: '#0B1215',
  mode: 'dark',
  description: 'Dark mode design system for Restaurant Competitive Intelligence Platform',
} as const;

/**
 * Color palette (matches CSS variables)
 */
export const colors = {
  brand: {
    obsidian: '#0B1215',
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
  },
  semantic: {
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#06b6d4',
    neutral: '#94a3b8',
  },
} as const;

/**
 * Spacing scale (matches CSS variables)
 */
export const spacing = {
  0: '0',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  32: '8rem',
} as const;

/**
 * Breakpoints for responsive design
 */
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

/**
 * Z-index layers
 */
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
} as const;

/**
 * Transition durations
 */
export const transitions = {
  fast: '150ms',
  normal: '300ms',
  slow: '500ms',
  slower: '700ms',
} as const;

/**
 * Easing functions
 */
export const easings = {
  in: 'cubic-bezier(0.4, 0, 1, 1)',
  out: 'cubic-bezier(0, 0, 0.2, 1)',
  inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
} as const;

/**
 * Shadow scale
 */
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.4)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.6)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
  emerald: '0 8px 16px rgba(16, 185, 129, 0.25)',
  cyan: '0 8px 16px rgba(6, 182, 212, 0.25)',
} as const;

/**
 * Type exports
 */
export type ThemeColor = keyof typeof colors.brand | keyof typeof colors.semantic;
export type ThemeSpacing = keyof typeof spacing;
export type ThemeBreakpoint = keyof typeof breakpoints;
export type ThemeZIndex = keyof typeof zIndex;
export type ThemeTransition = keyof typeof transitions;
export type ThemeEasing = keyof typeof easings;
export type ThemeShadow = keyof typeof shadows;
