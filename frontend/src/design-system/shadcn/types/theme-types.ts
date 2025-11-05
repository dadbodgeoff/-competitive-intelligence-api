/**
 * Theme-related type definitions
 */

export type ThemeMode = "light" | "dark"

export interface ThemeColors {
  background: string
  foreground: string
  primary: string
  secondary: string
  accent: string
  muted: string
  destructive: string
  border: string
}

export interface ThemeConfig {
  mode: ThemeMode
  colors: ThemeColors
  radius: string
}

export type ColorFormat = "hex" | "rgb" | "hsl"

export interface ColorValue {
  hex: string
  rgb: string
  hsl: string
}
