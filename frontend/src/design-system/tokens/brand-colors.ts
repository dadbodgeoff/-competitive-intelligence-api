/**
 * Brand Color Standards
 * Exact color codes from brand guidelines
 */

export const BRAND_COLORS = {
  // Backgrounds
  background: {
    base: '#121212',        // Main dark background
    surface: '#1E1E1E',     // Cards/Surfaces/Panels
  },
  
  // Text
  text: {
    primary: '#E0E0E0',     // Default text color
    secondary: '#A8B1B9',   // Subtext, placeholders
  },
  
  // Interactive
  links: '#4A6572',         // Links and buttons hover state
  
  // CTA & States
  cta: {
    primary: '#B08968',     // Main call-to-action
  },
  
  state: {
    success: '#264653',     // Success alerts and highlights
    warning: '#9A5C4A',     // Warnings and cautionary messages
    error: '#B75553',       // Errors and critical alerts
  },
} as const;

// Export individual colors for convenience
export const BG_BASE = BRAND_COLORS.background.base;
export const BG_SURFACE = BRAND_COLORS.background.surface;
export const TEXT_PRIMARY = BRAND_COLORS.text.primary;
export const TEXT_SECONDARY = BRAND_COLORS.text.secondary;
export const LINK_COLOR = BRAND_COLORS.links;
export const CTA_PRIMARY = BRAND_COLORS.cta.primary;
export const SUCCESS_COLOR = BRAND_COLORS.state.success;
export const WARNING_COLOR = BRAND_COLORS.state.warning;
export const ERROR_COLOR = BRAND_COLORS.state.error;
