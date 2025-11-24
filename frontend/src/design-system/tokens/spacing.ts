/**
 * Enterprise Spacing Standards
 * Following 8px grid system with brand-specific standards
 */

export const SPACING = {
  // Card & Box Standards
  cardPadding: '24px',           // 24px padding inside cards
  cardBorderRadius: '12px',      // 12px border radius for modern look
  cardMinWidth: '320px',         // Minimum 320px wide
  cardMinHeight: '180px',        // Minimum 180px tall
  
  // Grid & Gutters
  gridGutter: '24px',            // 24px gutters between columns/cards
  
  // Layout Spacing
  sidebarWidth: '240px',         // 240-280px sidebar width
  sidebarGap: '32px',            // 32px gap from sidebar to content
  headerHeight: '64px',          // 64px header height
  
  // Content Padding
  contentPaddingX: '32px',       // 32px left/right padding
  contentPaddingY: '24px',       // 24px top/bottom padding
  
  // Element Spacing
  boxSpacing: '24px',            // 24px between boxes (vertical/horizontal)
  formFieldSpacing: '16px',      // 16px between form fields
  innerContentSpacing: '16px',   // 16-20px spacing inside boxes
  
  // Max Widths
  contentMaxWidth: '1200px',     // Max width for content area
} as const;

// Tailwind class mappings
export const SPACING_CLASSES = {
  cardPadding: 'p-6',            // 24px
  cardRadius: 'rounded-xl',      // 12px
  gridGap: 'gap-6',              // 24px
  sectionSpacing: 'space-y-6',   // 24px vertical
  contentPadding: 'px-8 py-6',   // 32px horizontal, 24px vertical
  boxGap: 'gap-6',               // 24px
  formGap: 'space-y-4',          // 16px
} as const;
