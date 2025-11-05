/**
 * Design System - Color Tokens
 * Restaurant Competitive Intelligence Platform
 * 
 * All color definitions from brand specification
 */

export const brandColors = {
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
} as const;

export const backgroundColors = {
  obsidian: '#0B1215',
  slate: {
    900: '#0f172a',
    850: '#1a2332',
    800: '#1e293b',
  },
  modalOverlay: 'rgba(11, 18, 21, 0.85)',
  sidebar: '#0f1419',
} as const;

export const textColors = {
  primary: '#f8fafc',
  secondary: '#cbd5e1',
  tertiary: '#94a3b8',
  disabled: '#64748b',
  headings: {
    h1: '#ffffff',
    h2: '#f8fafc',
    h3: '#f1f5f9',
    h4: '#e2e8f0',
  },
  link: {
    default: '#06b6d4',
    hover: '#22d3ee',
    visited: '#0891b2',
    active: '#0e7490',
  },
  muted: '#64748b',
} as const;

export const borderColors = {
  default: 'rgba(255, 255, 255, 0.1)',
  input: 'rgba(255, 255, 255, 0.15)',
  divider: 'rgba(255, 255, 255, 0.08)',
  focus: '#10b981',
  hover: 'rgba(255, 255, 255, 0.2)',
  accent: 'rgba(16, 185, 129, 0.3)',
} as const;

export const semanticColors = {
  success: {
    bg: 'rgba(16, 185, 129, 0.1)',
    border: 'rgba(16, 185, 129, 0.3)',
    text: '#34d399',
    icon: '#10b981',
  },
  error: {
    bg: 'rgba(239, 68, 68, 0.1)',
    border: 'rgba(239, 68, 68, 0.3)',
    text: '#f87171',
    icon: '#ef4444',
  },
  warning: {
    bg: 'rgba(251, 191, 36, 0.1)',
    border: 'rgba(251, 191, 36, 0.3)',
    text: '#fbbf24',
    icon: '#f59e0b',
  },
  info: {
    bg: 'rgba(6, 182, 212, 0.1)',
    border: 'rgba(6, 182, 212, 0.3)',
    text: '#22d3ee',
    icon: '#06b6d4',
  },
  neutral: {
    bg: 'rgba(148, 163, 184, 0.1)',
    border: 'rgba(148, 163, 184, 0.2)',
    text: '#94a3b8',
    icon: '#64748b',
  },
} as const;

export const insightColors = {
  opportunity: {
    bg: 'rgba(16, 185, 129, 0.15)',
    border: 'rgba(16, 185, 129, 0.3)',
    text: '#34d399',
    icon: '#10b981',
  },
  threat: {
    bg: 'rgba(239, 68, 68, 0.15)',
    border: 'rgba(239, 68, 68, 0.3)',
    text: '#f87171',
    icon: '#ef4444',
  },
  watch: {
    bg: 'rgba(251, 191, 36, 0.15)',
    border: 'rgba(251, 191, 36, 0.3)',
    text: '#fbbf24',
    icon: '#f59e0b',
  },
} as const;

export const confidenceColors = {
  high: {
    bg: 'rgba(16, 185, 129, 0.15)',
    text: '#34d399',
    border: 'rgba(16, 185, 129, 0.3)',
  },
  medium: {
    bg: 'rgba(251, 191, 36, 0.15)',
    text: '#fbbf24',
    border: 'rgba(251, 191, 36, 0.3)',
  },
  low: {
    bg: 'rgba(148, 163, 184, 0.15)',
    text: '#94a3b8',
    border: 'rgba(148, 163, 184, 0.3)',
  },
} as const;

export const chartColors = {
  1: '#10b981', // Emerald
  2: '#06b6d4', // Cyan
  3: '#8b5cf6', // Violet
  4: '#f59e0b', // Amber
  5: '#ef4444', // Red
  6: '#ec4899', // Pink
} as const;

export const starRatingColors = {
  filled: '#fbbf24',
  empty: '#475569',
  half: 'linear-gradient(90deg, #fbbf24 50%, #475569 50%)',
} as const;

// Helper function to get insight color by type
export function getInsightColor(type: 'opportunity' | 'threat' | 'watch') {
  return insightColors[type];
}

// Helper function to get confidence color by level
export function getConfidenceColor(level: 'high' | 'medium' | 'low') {
  return confidenceColors[level];
}

// Helper function to get semantic color by type
export function getSemanticColor(type: 'success' | 'error' | 'warning' | 'info' | 'neutral') {
  return semanticColors[type];
}
