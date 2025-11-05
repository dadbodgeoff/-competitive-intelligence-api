/**
 * Design System - Shadow Tokens
 * Restaurant Competitive Intelligence Platform
 */

export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
  md: '0 4px 6px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.3), 0 4px 6px rgba(0, 0, 0, 0.2)',
  xl: '0 20px 25px rgba(0, 0, 0, 0.3), 0 8px 10px rgba(0, 0, 0, 0.2)',
  '2xl': '0 25px 50px rgba(0, 0, 0, 0.4)',
  emerald: '0 8px 16px rgba(16, 185, 129, 0.25)',
  cyan: '0 8px 16px rgba(6, 182, 212, 0.25)',
  none: 'none',
} as const;

export const overlays = {
  light: 'rgba(11, 18, 21, 0.5)',
  medium: 'rgba(11, 18, 21, 0.75)',
  heavy: 'rgba(11, 18, 21, 0.9)',
  gradient: 'linear-gradient(180deg, transparent, rgba(11, 18, 21, 0.8))',
} as const;

export const gradients = {
  primary: 'linear-gradient(135deg, #10b981, #059669)',
  secondary: 'linear-gradient(135deg, #06b6d4, #0891b2)',
  accent: 'linear-gradient(135deg, #10b981, #06b6d4)',
  dark: 'linear-gradient(180deg, #0f172a, #0B1215)',
  card: 'linear-gradient(135deg, #1a2332, #141c1f)',
  glow: 'radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.15), transparent 70%)',
} as const;

// Helper function to get shadow
export function getShadow(size: keyof typeof shadows): string {
  return shadows[size];
}

// Helper function to get gradient
export function getGradient(type: keyof typeof gradients): string {
  return gradients[type];
}
