/**
 * Brand Style Utilities
 * Helper functions for applying brand-compliant styles
 */

import { CSSProperties } from 'react';

/**
 * Brand Color Palette
 */
export const BRAND = {
  // Backgrounds
  bg: {
    base: '#121212',
    surface: '#1E1E1E',
  },
  
  // Text
  text: {
    primary: '#E0E0E0',
    secondary: '#A8B1B9',
  },
  
  // Interactive
  link: '#4A6572',
  
  // CTA
  cta: '#B08968',
  
  // States
  success: '#264653',
  warning: '#9A5C4A',
  error: '#B75553',
  
  // Borders
  border: 'rgba(255, 255, 255, 0.1)',
} as const;

/**
 * Spacing Standards (in px)
 */
export const SPACING = {
  card: 24,        // Card padding
  grid: 24,        // Grid gutters
  section: 24,     // Section spacing
  content: 32,     // Content horizontal padding
  form: 16,        // Form field spacing
} as const;

/**
 * Border Radius Standards (in px)
 */
export const RADIUS = {
  card: 12,
  button: 8,
  input: 8,
} as const;

/**
 * Typography Standards
 */
export const TYPOGRAPHY = {
  dashboardHeader: {
    fontSize: '32px',
    lineHeight: '38px',
    fontWeight: 'bold',
  },
  sectionHeader: {
    fontSize: '24px',
    lineHeight: '30px',
    fontWeight: 'bold',
  },
  statBox: {
    fontSize: '18px',
    lineHeight: '22px',
    fontWeight: '500',
  },
  body: {
    fontSize: '16px',
    lineHeight: '24px',
  },
  caption: {
    fontSize: '12px',
    lineHeight: '16px',
  },
} as const;

/**
 * Pre-built style objects for common patterns
 */
export const brandStyles = {
  // Card styles
  card: (): CSSProperties => ({
    backgroundColor: BRAND.bg.surface,
    border: `1px solid ${BRAND.border}`,
    borderRadius: `${RADIUS.card}px`,
    padding: `${SPACING.card}px`,
  }),
  
  cardMinimal: (): CSSProperties => ({
    backgroundColor: BRAND.bg.surface,
    border: `1px solid ${BRAND.border}`,
    borderRadius: `${RADIUS.card}px`,
  }),
  
  // Button styles
  buttonPrimary: (): CSSProperties => ({
    backgroundColor: BRAND.cta,
    color: '#ffffff',
    borderRadius: `${RADIUS.button}px`,
  }),
  
  buttonWarning: (): CSSProperties => ({
    backgroundColor: BRAND.warning,
    color: '#ffffff',
    borderRadius: `${RADIUS.button}px`,
  }),
  
  buttonSuccess: (): CSSProperties => ({
    backgroundColor: BRAND.success,
    color: '#ffffff',
    borderRadius: `${RADIUS.button}px`,
  }),
  
  buttonError: (): CSSProperties => ({
    backgroundColor: BRAND.error,
    color: '#ffffff',
    borderRadius: `${RADIUS.button}px`,
  }),
  
  // Text styles
  textPrimary: (): CSSProperties => ({
    color: BRAND.text.primary,
  }),
  
  textSecondary: (): CSSProperties => ({
    color: BRAND.text.secondary,
  }),
  
  // Typography styles
  h1: (): CSSProperties => ({
    ...TYPOGRAPHY.dashboardHeader,
    color: BRAND.text.primary,
  }),
  
  h2: (): CSSProperties => ({
    ...TYPOGRAPHY.sectionHeader,
    color: BRAND.text.primary,
  }),
  
  // Border styles
  border: (): CSSProperties => ({
    borderColor: BRAND.border,
  }),
  
  // Background styles
  bgBase: (): CSSProperties => ({
    backgroundColor: BRAND.bg.base,
  }),
  
  bgSurface: (): CSSProperties => ({
    backgroundColor: BRAND.bg.surface,
  }),
  
  // Modal styles
  modal: (): CSSProperties => ({
    backgroundColor: BRAND.bg.surface,
    border: `1px solid ${BRAND.border}`,
    borderRadius: `${RADIUS.card}px`,
  }),
  
  modalOverlay: (): CSSProperties => ({
    backgroundColor: 'rgba(18, 18, 18, 0.9)',
  }),
} as const;

/**
 * Tailwind class helpers for brand standards
 */
export const brandClasses = {
  // Spacing
  cardPadding: 'p-6',           // 24px
  gridGap: 'gap-6',             // 24px
  sectionSpacing: 'mb-6',       // 24px
  contentPadding: 'px-8 py-6',  // 32px horizontal, 24px vertical
  
  // Border radius
  cardRadius: 'rounded-xl',     // 12px
  buttonRadius: 'rounded-lg',   // 8px
  
  // Typography
  h1: 'text-[32px] font-bold leading-[38px]',
  h2: 'text-2xl font-bold leading-[30px]',
  h3: 'text-lg font-medium leading-[22px]',
  body: 'text-base leading-6',
  caption: 'text-xs leading-4',
} as const;

/**
 * Helper to merge brand styles with custom styles
 */
export const mergeBrandStyles = (
  brandStyle: CSSProperties,
  customStyle?: CSSProperties
): CSSProperties => {
  return { ...brandStyle, ...customStyle };
};
