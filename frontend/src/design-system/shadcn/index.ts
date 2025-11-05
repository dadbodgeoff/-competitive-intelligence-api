/**
 * shadcn/ui Integration Layer
 * Central export point for shadcn integration
 */

// Export theme adapter
export * from './theme-adapter';

// Export utilities
export * from './utils';

// Export components
export * from './components';

// Export forms
export * from './forms';

// Export hooks
export * from './hooks';

// Export types
export * from './types';

// Re-export commonly used items
export {
  shadcnTheme,
  generateShadcnCSSVariables,
  getShadcnThemeObject,
} from './theme-adapter';

export {
  hexToHSL,
  rgbToHSL,
  rgbaToHSL,
  batchHexToHSL,
  colorToHSLWithAlpha,
} from './utils/hsl-converter';

export { cn } from './utils/class-merger';
