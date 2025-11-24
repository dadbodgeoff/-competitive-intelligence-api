/**
 * Typography Standards
 * Enterprise-grade typography scale
 */

export const TYPOGRAPHY = {
  // Headers
  dashboardHeader: {
    fontSize: '32px',      // 2rem
    fontWeight: 'bold',
    lineHeight: '38px',    // 2.375rem
  },
  
  sectionHeader: {
    fontSize: '24px',      // 1.5rem
    fontWeight: 'bold',
    lineHeight: '30px',    // 1.875rem
  },
  
  statBoxText: {
    fontSize: '18px',      // 1.125rem
    fontWeight: 'medium',
    lineHeight: '22px',    // 1.375rem
  },
  
  regularBody: {
    fontSize: '16px',      // 1rem
    fontWeight: 'regular',
    lineHeight: '24px',    // 1.5rem
  },
  
  caption: {
    fontSize: '12px',      // 0.75rem
    fontWeight: 'regular',
    lineHeight: '16px',    // 1rem
  },
} as const;

// Tailwind class mappings
export const TYPOGRAPHY_CLASSES = {
  dashboardHeader: 'text-[32px] font-bold leading-[38px]',
  sectionHeader: 'text-2xl font-bold leading-[30px]',
  statBoxText: 'text-lg font-medium leading-[22px]',
  regularBody: 'text-base font-normal leading-6',
  caption: 'text-xs font-normal leading-4',
} as const;
