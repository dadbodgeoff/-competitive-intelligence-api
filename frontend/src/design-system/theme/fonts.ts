/**
 * Font Configuration and Utilities
 * Manages font loading and provides utilities for font management
 */

export const fonts = {
  sans: {
    family: 'Inter',
    weights: [300, 400, 500, 600, 700, 800],
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap',
    fallback: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'sans-serif'],
  },
  mono: {
    family: 'JetBrains Mono',
    weights: [400, 500, 600, 700],
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap',
    fallback: ['Fira Code', 'Consolas', 'Monaco', 'monospace'],
  },
};

/**
 * Get Google Fonts import URLs
 * @returns Array of Google Fonts URLs to import
 */
export function getFontImportLinks(): string[] {
  return [
    fonts.sans.googleFontsUrl,
    fonts.mono.googleFontsUrl,
  ];
}

/**
 * Get preconnect links for Google Fonts
 * @returns Array of preconnect URLs for performance optimization
 */
export function getFontPreconnectLinks(): string[] {
  return [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
  ];
}

/**
 * Get full font family string with fallbacks
 * @param fontType - 'sans' or 'mono'
 * @returns Complete font-family CSS value
 */
export function getFontFamily(fontType: 'sans' | 'mono'): string {
  const font = fonts[fontType];
  return `'${font.family}', ${font.fallback.join(', ')}`;
}

/**
 * Generate font-face CSS for local font files (if needed)
 * @param fontType - 'sans' or 'mono'
 * @returns CSS string for @font-face declarations
 */
export function generateFontFaceCSS(fontType: 'sans' | 'mono'): string {
  const font = fonts[fontType];
  return font.weights
    .map(
      (weight) => `
@font-face {
  font-family: '${font.family}';
  font-weight: ${weight};
  font-display: swap;
  src: local('${font.family}');
}
    `.trim()
    )
    .join('\n\n');
}

/**
 * Check if fonts are loaded
 * @returns Promise that resolves when fonts are loaded
 */
export async function waitForFontsLoaded(): Promise<void> {
  if (typeof document === 'undefined') return;

  try {
    await Promise.all([
      document.fonts.load(`400 1rem ${fonts.sans.family}`),
      document.fonts.load(`400 1rem ${fonts.mono.family}`),
    ]);
  } catch (error) {
    console.warn('Font loading failed:', error);
  }
}

/**
 * Font size scale (matches CSS variables)
 */
export const fontSizes = {
  xs: '0.75rem',
  sm: '0.875rem',
  base: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
  '4xl': '2.25rem',
  '5xl': '3rem',
} as const;

/**
 * Font weight scale
 */
export const fontWeights = {
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
} as const;

/**
 * Line height scale
 */
export const lineHeights = {
  tight: 1.25,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625,
} as const;

export type FontSize = keyof typeof fontSizes;
export type FontWeight = keyof typeof fontWeights;
export type LineHeight = keyof typeof lineHeights;
