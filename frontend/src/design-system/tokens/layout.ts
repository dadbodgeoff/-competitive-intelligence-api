/**
 * Design System - Layout Tokens
 * Restaurant Competitive Intelligence Platform
 */

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

export const contentWidths = {
  prose: '65ch',      // Optimal reading width
  narrow: '600px',    // Narrow content
  content: '768px',   // Normal content
  wide: '1024px',     // Wide content
  full: '1280px',     // Full container
} as const;

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const;

export const containerPadding = {
  mobile: '1rem',      // 16px
  tablet: '1.5rem',    // 24px
  desktop: '2rem',     // 32px
} as const;

// Helper function to get breakpoint
export function getBreakpoint(size: keyof typeof breakpoints): string {
  return breakpoints[size];
}

// Helper function to get z-index
export function getZIndex(layer: keyof typeof zIndex): number {
  return zIndex[layer];
}

// Helper function to get content width
export function getContentWidth(size: keyof typeof contentWidths): string {
  return contentWidths[size];
}
