/**
 * Design System - Main Export
 * Restaurant Competitive Intelligence Platform
 * 
 * Central export point for the entire design system
 */

// Export all tokens
export * from './tokens';

// Export all utilities
export * from './utils';

// Export all components
export * from './components';

// Export shadcn integration
export * from './shadcn';

// Export design system metadata
export { designSystem } from './tokens';

// Convenience re-exports for most commonly used items

// Tokens
export {
  // Colors
  brandColors,
  semanticColors,
  insightColors,
  confidenceColors,
  
  // Typography
  fontFamilies,
  fontSizes,
  fontWeights,
  
  // Spacing
  spacing,
  gaps,
  borderRadius,
  
  // Shadows & Gradients
  shadows,
  gradients,
  
  // Animations
  durations,
  easings,
  animations,
  
  // Layout
  breakpoints,
  zIndex,
  contentWidths,
} from './tokens';

// Utilities
export {
  cn,
} from './utils';

// Color Helpers
export {
  getInsightClasses,
  getConfidenceClasses,
  getSemanticClasses,
  getRatingClasses,
  getInsightIcon,
  getSemanticIcon,
} from './utils';

// Component re-exports
export {
  InsightCard,
  CompetitorCard,
  AnalysisProgress,
  TierSelector,
  SentimentIndicator,
  FilterPanel,
  ComparisonWidget,
} from './components';
