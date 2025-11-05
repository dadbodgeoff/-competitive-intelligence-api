/**
 * shadcn/ui Theme Adapter
 * Converts our design tokens to shadcn's HSL format
 */

import { hexToHSL } from './utils/hsl-converter';
import { brandColors, backgroundColors, textColors } from '../tokens/colors';

/**
 * shadcn theme configuration in HSL format
 */
export const shadcnTheme = {
  // Background colors
  background: hexToHSL(brandColors.obsidian), // #0B1215
  foreground: hexToHSL(textColors.primary), // #f8fafc
  
  // Card colors
  card: hexToHSL(backgroundColors.slate[850]), // #1a2332
  cardForeground: hexToHSL(textColors.primary), // #f8fafc
  
  // Popover colors
  popover: hexToHSL(backgroundColors.slate[800]), // #1e293b
  popoverForeground: hexToHSL(textColors.primary), // #f8fafc
  
  // Primary colors (Emerald)
  primary: hexToHSL(brandColors.emerald[500]), // #10b981
  primaryForeground: '0 0% 100%', // White
  
  // Secondary colors (Cyan)
  secondary: hexToHSL(brandColors.cyan[500]), // #06b6d4
  secondaryForeground: '0 0% 100%', // White
  
  // Muted colors
  muted: hexToHSL(backgroundColors.slate[850]), // #1a2332
  mutedForeground: hexToHSL(textColors.tertiary), // #94a3b8
  
  // Accent colors
  accent: hexToHSL(backgroundColors.slate[850]), // #1a2332
  accentForeground: hexToHSL(brandColors.emerald[500]), // #10b981
  
  // Destructive colors
  destructive: '0 84% 60%', // Red #ef4444
  destructiveForeground: hexToHSL(textColors.primary), // #f8fafc
  
  // Success colors
  success: hexToHSL(brandColors.emerald[500]), // #10b981
  successForeground: '0 0% 100%', // White
  
  // Warning colors
  warning: '38 92% 50%', // Amber #f59e0b
  warningForeground: '26 90% 37%', // Dark amber
  
  // Info colors
  info: hexToHSL(brandColors.cyan[500]), // #06b6d4
  infoForeground: '0 0% 100%', // White
  
  // Border colors
  border: hexToHSL(backgroundColors.slate[850]), // #1a2332 (approximation for rgba)
  input: hexToHSL(backgroundColors.slate[850]), // #1a2332
  ring: hexToHSL(brandColors.emerald[500]), // #10b981
  
  // Chart colors
  chart1: hexToHSL(brandColors.emerald[500]), // #10b981
  chart2: hexToHSL(brandColors.cyan[500]), // #06b6d4
  chart3: '258 90% 66%', // Violet
  chart4: '38 92% 50%', // Amber
  chart5: '0 84% 60%', // Red
  
  // Border radius
  radius: '0.5rem', // 8px
} as const;

/**
 * Generate CSS variables for shadcn theme
 */
export function generateShadcnCSSVariables(): string {
  return `
:root {
  /* Backgrounds */
  --background: ${shadcnTheme.background};
  --foreground: ${shadcnTheme.foreground};
  
  /* Cards */
  --card: ${shadcnTheme.card};
  --card-foreground: ${shadcnTheme.cardForeground};
  
  /* Popovers */
  --popover: ${shadcnTheme.popover};
  --popover-foreground: ${shadcnTheme.popoverForeground};
  
  /* Primary */
  --primary: ${shadcnTheme.primary};
  --primary-foreground: ${shadcnTheme.primaryForeground};
  
  /* Secondary */
  --secondary: ${shadcnTheme.secondary};
  --secondary-foreground: ${shadcnTheme.secondaryForeground};
  
  /* Muted */
  --muted: ${shadcnTheme.muted};
  --muted-foreground: ${shadcnTheme.mutedForeground};
  
  /* Accent */
  --accent: ${shadcnTheme.accent};
  --accent-foreground: ${shadcnTheme.accentForeground};
  
  /* Destructive */
  --destructive: ${shadcnTheme.destructive};
  --destructive-foreground: ${shadcnTheme.destructiveForeground};
  
  /* Success */
  --success: ${shadcnTheme.success};
  --success-foreground: ${shadcnTheme.successForeground};
  
  /* Warning */
  --warning: ${shadcnTheme.warning};
  --warning-foreground: ${shadcnTheme.warningForeground};
  
  /* Info */
  --info: ${shadcnTheme.info};
  --info-foreground: ${shadcnTheme.infoForeground};
  
  /* Borders */
  --border: ${shadcnTheme.border};
  --input: ${shadcnTheme.input};
  --ring: ${shadcnTheme.ring};
  
  /* Charts */
  --chart-1: ${shadcnTheme.chart1};
  --chart-2: ${shadcnTheme.chart2};
  --chart-3: ${shadcnTheme.chart3};
  --chart-4: ${shadcnTheme.chart4};
  --chart-5: ${shadcnTheme.chart5};
  
  /* Border Radius */
  --radius: ${shadcnTheme.radius};
}
`.trim();
}

/**
 * Get shadcn theme as JavaScript object
 */
export function getShadcnThemeObject() {
  return {
    background: `hsl(${shadcnTheme.background})`,
    foreground: `hsl(${shadcnTheme.foreground})`,
    card: `hsl(${shadcnTheme.card})`,
    cardForeground: `hsl(${shadcnTheme.cardForeground})`,
    popover: `hsl(${shadcnTheme.popover})`,
    popoverForeground: `hsl(${shadcnTheme.popoverForeground})`,
    primary: `hsl(${shadcnTheme.primary})`,
    primaryForeground: `hsl(${shadcnTheme.primaryForeground})`,
    secondary: `hsl(${shadcnTheme.secondary})`,
    secondaryForeground: `hsl(${shadcnTheme.secondaryForeground})`,
    muted: `hsl(${shadcnTheme.muted})`,
    mutedForeground: `hsl(${shadcnTheme.mutedForeground})`,
    accent: `hsl(${shadcnTheme.accent})`,
    accentForeground: `hsl(${shadcnTheme.accentForeground})`,
    destructive: `hsl(${shadcnTheme.destructive})`,
    destructiveForeground: `hsl(${shadcnTheme.destructiveForeground})`,
    border: `hsl(${shadcnTheme.border})`,
    input: `hsl(${shadcnTheme.input})`,
    ring: `hsl(${shadcnTheme.ring})`,
  };
}

/**
 * Type definitions for shadcn theme
 */
export type ShadcnTheme = typeof shadcnTheme;
export type ShadcnThemeKey = keyof typeof shadcnTheme;
