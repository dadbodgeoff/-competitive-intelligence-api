/**
 * Design System - Spacing Tokens
 * Restaurant Competitive Intelligence Platform
 */

export const spacingUnit = '0.25rem'; // 4px base unit

export const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
  32: '8rem',     // 128px
} as const;

export const componentSpacing = {
  button: {
    default: { x: '1.5rem', y: '0.75rem' },  // 24px 12px
    sm: { x: '1rem', y: '0.5rem' },          // 16px 8px
    lg: { x: '2rem', y: '1rem' },            // 32px 16px
  },
  card: {
    default: '1.5rem',  // 24px
    sm: '1rem',         // 16px
    lg: '2rem',         // 32px
  },
  input: {
    x: '1rem',      // 16px
    y: '0.75rem',   // 12px
  },
  section: {
    mobile: { top: '3rem', bottom: '3rem' },      // 48px
    tablet: { top: '4rem', bottom: '4rem' },      // 64px
    desktop: { top: '5rem', bottom: '5rem' },     // 80px
  },
} as const;

export const gaps = {
  sm: '0.5rem',   // 8px
  md: '1rem',     // 16px
  lg: '1.5rem',   // 24px
  xl: '2rem',     // 32px
} as const;

export const borderRadius = {
  sm: '0.25rem',   // 4px
  default: '0.5rem',   // 8px
  md: '0.75rem',   // 12px
  lg: '1rem',      // 16px
  xl: '1.5rem',    // 24px
  full: '9999px',
} as const;

// Helper function to get spacing value
export function getSpacing(key: keyof typeof spacing): string {
  return spacing[key];
}

// Helper function to get gap value
export function getGap(size: keyof typeof gaps): string {
  return gaps[size];
}
