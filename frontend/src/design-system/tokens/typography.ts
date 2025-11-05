/**
 * Design System - Typography Tokens
 * Restaurant Competitive Intelligence Platform
 */

export const fontFamilies = {
  sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
  mono: "'JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', monospace",
} as const;

export const fontSizes = {
  xs: '0.75rem',    // 12px
  sm: '0.875rem',   // 14px
  base: '1rem',     // 16px
  lg: '1.125rem',   // 18px
  xl: '1.25rem',    // 20px
  '2xl': '1.5rem',  // 24px
  '3xl': '2rem',    // 32px
  '4xl': '2.5rem',  // 40px
  '5xl': '3.5rem',  // 56px
} as const;

export const fontWeights = {
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
} as const;

export const lineHeights = {
  tight: 1.1,
  snug: 1.3,
  normal: 1.6,
  relaxed: 1.7,
} as const;

export const letterSpacing = {
  tighter: '-0.02em',
  tight: '-0.01em',
  normal: '0',
  wide: '0.05em',
} as const;

export const headingStyles = {
  h1: {
    fontSize: '3.5rem',      // 56px
    fontWeight: 800,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
    color: '#ffffff',
  },
  h2: {
    fontSize: '2.5rem',      // 40px
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.01em',
    color: '#f8fafc',
  },
  h3: {
    fontSize: '2rem',        // 32px
    fontWeight: 700,
    lineHeight: 1.3,
    letterSpacing: '0',
    color: '#f1f5f9',
  },
  h4: {
    fontSize: '1.5rem',      // 24px
    fontWeight: 600,
    lineHeight: 1.4,
    letterSpacing: '0',
    color: '#e2e8f0',
  },
  h5: {
    fontSize: '1.25rem',     // 20px
    fontWeight: 600,
    lineHeight: 1.5,
    color: '#cbd5e1',
  },
  h6: {
    fontSize: '1rem',        // 16px
    fontWeight: 600,
    lineHeight: 1.5,
    color: '#cbd5e1',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
} as const;

export const responsiveHeadingSizes = {
  mobile: {
    h1: '2.5rem',   // 40px
    h2: '2rem',     // 32px
    h3: '1.5rem',   // 24px
    h4: '1.25rem',  // 20px
  },
  tablet: {
    h1: '3rem',     // 48px
    h2: '2.25rem',  // 36px
    h3: '1.75rem',  // 28px
    h4: '1.25rem',  // 20px
  },
  desktop: {
    h1: '3.5rem',   // 56px
    h2: '2.5rem',   // 40px
    h3: '2rem',     // 32px
    h4: '1.5rem',   // 24px
  },
} as const;

// Helper function to get heading style
export function getHeadingStyle(level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6') {
  return headingStyles[level];
}
