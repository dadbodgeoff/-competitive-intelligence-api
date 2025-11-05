/**
 * HSL Converter Utility
 * Converts hex colors to HSL format for shadcn/ui compatibility
 */

/**
 * Convert hex color to HSL format
 * @param hex - Hex color string (e.g., "#10b981")
 * @returns HSL string in shadcn format (e.g., "160 84% 39%")
 */
export function hexToHSL(hex: string): string {
  // Remove # if present
  hex = hex.replace('#', '');

  // Convert hex to RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  // Convert to degrees and percentages
  const hDeg = Math.round(h * 360);
  const sPercent = Math.round(s * 100);
  const lPercent = Math.round(l * 100);

  // Return in shadcn format (no commas, space-separated)
  return `${hDeg} ${sPercent}% ${lPercent}%`;
}

/**
 * Convert RGB color to HSL format
 * @param r - Red value (0-255)
 * @param g - Green value (0-255)
 * @param b - Blue value (0-255)
 * @returns HSL string in shadcn format
 */
export function rgbToHSL(r: number, g: number, b: number): string {
  const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  return hexToHSL(hex);
}

/**
 * Convert RGBA color to HSL format (ignores alpha)
 * @param rgba - RGBA string (e.g., "rgba(16, 185, 129, 0.1)")
 * @returns HSL string in shadcn format
 */
export function rgbaToHSL(rgba: string): string {
  const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) {
    throw new Error(`Invalid RGBA format: ${rgba}`);
  }
  
  const [, r, g, b] = match;
  return rgbToHSL(parseInt(r), parseInt(g), parseInt(b));
}

/**
 * Get alpha value from RGBA string
 * @param rgba - RGBA string (e.g., "rgba(16, 185, 129, 0.1)")
 * @returns Alpha value (0-1)
 */
export function getAlpha(rgba: string): number {
  const match = rgba.match(/rgba?\([^,]+,[^,]+,[^,]+,\s*([\d.]+)\)/);
  return match ? parseFloat(match[1]) : 1;
}

/**
 * Convert color with alpha to HSL with opacity
 * @param color - Hex or RGBA color
 * @returns Object with HSL and alpha values
 */
export function colorToHSLWithAlpha(color: string): { hsl: string; alpha: number } {
  if (color.startsWith('rgba')) {
    return {
      hsl: rgbaToHSL(color),
      alpha: getAlpha(color),
    };
  }
  
  return {
    hsl: hexToHSL(color),
    alpha: 1,
  };
}

/**
 * Batch convert multiple hex colors to HSL
 * @param colors - Object with color names and hex values
 * @returns Object with color names and HSL values
 */
export function batchHexToHSL(colors: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {};
  
  for (const [name, hex] of Object.entries(colors)) {
    result[name] = hexToHSL(hex);
  }
  
  return result;
}
