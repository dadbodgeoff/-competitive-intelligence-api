/**
 * Responsive Design Helpers
 */

import { breakpoints } from '../../tokens/layout';

export const responsive = {
  sm: `@media (min-width: ${breakpoints.sm})`,
  md: `@media (min-width: ${breakpoints.md})`,
  lg: `@media (min-width: ${breakpoints.lg})`,
  xl: `@media (min-width: ${breakpoints.xl})`,
  '2xl': `@media (min-width: ${breakpoints['2xl']})`,
};

export function getResponsiveValue<T>(
  values: Partial<Record<keyof typeof breakpoints | 'base', T>>,
  currentBreakpoint: keyof typeof breakpoints | 'base'
): T | undefined {
  const order: (keyof typeof breakpoints | 'base')[] = ['base', 'sm', 'md', 'lg', 'xl', '2xl'];
  const currentIndex = order.indexOf(currentBreakpoint);
  
  for (let i = currentIndex; i >= 0; i--) {
    const value = values[order[i]];
    if (value !== undefined) return value;
  }
  
  return undefined;
}

export function getCurrentBreakpoint(): keyof typeof breakpoints | 'base' {
  if (typeof window === 'undefined') return 'base';
  
  const width = window.innerWidth;
  
  if (width >= parseInt(breakpoints['2xl'])) return '2xl';
  if (width >= parseInt(breakpoints.xl)) return 'xl';
  if (width >= parseInt(breakpoints.lg)) return 'lg';
  if (width >= parseInt(breakpoints.md)) return 'md';
  if (width >= parseInt(breakpoints.sm)) return 'sm';
  
  return 'base';
}
