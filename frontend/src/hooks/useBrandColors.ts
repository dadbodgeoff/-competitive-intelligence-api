/**
 * Brand Colors Hook
 * Provides easy access to brand standard colors
 */

import { BRAND_COLORS } from '@/design-system/tokens/brand-colors';

export const useBrandColors = () => {
  return {
    // Backgrounds
    bgBase: BRAND_COLORS.background.base,
    bgSurface: BRAND_COLORS.background.surface,
    
    // Text
    textPrimary: BRAND_COLORS.text.primary,
    textSecondary: BRAND_COLORS.text.secondary,
    
    // Interactive
    link: BRAND_COLORS.links,
    
    // CTA
    ctaPrimary: BRAND_COLORS.cta.primary,
    
    // States
    success: BRAND_COLORS.state.success,
    warning: BRAND_COLORS.state.warning,
    error: BRAND_COLORS.state.error,
    
    // Utility functions
    getBgStyle: (surface: boolean = false) => ({
      backgroundColor: surface ? BRAND_COLORS.background.surface : BRAND_COLORS.background.base,
    }),
    
    getTextStyle: (secondary: boolean = false) => ({
      color: secondary ? BRAND_COLORS.text.secondary : BRAND_COLORS.text.primary,
    }),
    
    getCardStyle: () => ({
      backgroundColor: BRAND_COLORS.background.surface,
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      padding: '24px',
    }),
    
    getButtonStyle: (variant: 'primary' | 'warning' | 'success' | 'error' = 'primary') => {
      const colors = {
        primary: BRAND_COLORS.cta.primary,
        warning: BRAND_COLORS.state.warning,
        success: BRAND_COLORS.state.success,
        error: BRAND_COLORS.state.error,
      };
      
      return {
        backgroundColor: colors[variant],
        color: '#ffffff',
      };
    },
  };
};

// Export as constants for non-hook usage
export const BRAND_STYLE = {
  card: {
    backgroundColor: '#1E1E1E',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '24px',
  },
  
  cardMinimal: {
    backgroundColor: '#1E1E1E',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
  },
  
  button: {
    primary: {
      backgroundColor: '#B08968',
      color: '#ffffff',
    },
    warning: {
      backgroundColor: '#9A5C4A',
      color: '#ffffff',
    },
    success: {
      backgroundColor: '#264653',
      color: '#ffffff',
    },
    error: {
      backgroundColor: '#B75553',
      color: '#ffffff',
    },
  },
  
  text: {
    primary: { color: '#E0E0E0' },
    secondary: { color: '#A8B1B9' },
  },
  
  border: {
    default: { borderColor: 'rgba(255, 255, 255, 0.1)' },
  },
} as const;
