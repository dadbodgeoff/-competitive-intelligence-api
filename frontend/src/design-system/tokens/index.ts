/**
 * Design System - Token Exports
 * Restaurant Competitive Intelligence Platform
 * 
 * Central export point for all design tokens
 */

// Export all color tokens
export * from './colors';

// Export typography tokens
export * from './typography';

// Export spacing tokens
export * from './spacing';

// Export shadow and gradient tokens
export * from './shadows';

// Export animation tokens
export * from './animations';

// Export layout tokens
export * from './layout';

// Design system metadata
export const designSystem = {
  name: 'RestaurantIQ Design System',
  version: '1.0.0',
  theme: 'dark',
  primaryColor: '#10b981',
  backgroundColor: '#0B1215',
  fontFamily: 'Inter',
} as const;

// Type exports for TypeScript consumers
export type InsightType = 'opportunity' | 'threat' | 'watch';
export type ConfidenceLevel = 'high' | 'medium' | 'low';
export type SemanticType = 'success' | 'error' | 'warning' | 'info' | 'neutral';
export type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
export type SpacingSize = keyof typeof import('./spacing').SPACING;
export type ShadowSize = keyof typeof import('./shadows').shadows;
export type AnimationName = keyof typeof import('./animations').animations;
export type BreakpointSize = keyof typeof import('./layout').breakpoints;
