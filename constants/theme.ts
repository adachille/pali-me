/**
 * Global theme definition for Pali-Me.
 * Provides light and dark color palettes used across the app's UI.
 */

export const LightColors = {
  // Backgrounds
  background: "#ffffff",
  surface: "#f5f5f5",
  surfaceVariant: "#e8e8e8",

  // Borders
  border: "#e0e0e0",

  // Text
  textPrimary: "#333333",
  textSecondary: "#666666",
  textHint: "#999999",
  textOnPrimary: "#ffffff",

  // Primary brand color (green)
  primary: "#4CAF50",
  primaryPressed: "#388E3C",
  primaryLight: "#E8F5E9",
  primaryDisabled: "#a5d6a7",

  // Secondary / import button color (blue)
  secondary: "#2196F3",
  secondaryPressed: "#1976D2",

  // Error / destructive
  error: "#f44336",
  errorBackground: "#ffebee",

  // Disabled
  disabled: "#9E9E9E",

  // Shadow
  shadow: "#000000",

  // Navigation
  tabBarActive: "#007AFF",

  // Item type badge colors
  itemTypeWord: "#4CAF50",
  itemTypePrefix: "#2196F3",
  itemTypeSuffix: "#9C27B0",
  itemTypeRoot: "#FF9800",
  itemTypeParticle: "#607D8B",

  // Overlay
  overlay: "rgba(0, 0, 0, 0.5)",
} as const;

export const DarkColors = {
  // Backgrounds
  background: "#121212",
  surface: "#1e1e1e",
  surfaceVariant: "#2d2d2d",

  // Borders
  border: "#3a3a3a",

  // Text
  textPrimary: "#f0f0f0",
  textSecondary: "#aaaaaa",
  textHint: "#666666",
  textOnPrimary: "#ffffff",

  // Primary brand color (green — same in dark mode)
  primary: "#4CAF50",
  primaryPressed: "#388E3C",
  primaryLight: "#1a3a1a",
  primaryDisabled: "#2d5c2d",

  // Secondary / import button color (blue — same in dark mode)
  secondary: "#2196F3",
  secondaryPressed: "#1976D2",

  // Error / destructive
  error: "#ef5350",
  errorBackground: "#3b1111",

  // Disabled
  disabled: "#555555",

  // Shadow
  shadow: "#000000",

  // Navigation
  tabBarActive: "#4CAF50",

  // Item type badge colors
  itemTypeWord: "#4CAF50",
  itemTypePrefix: "#2196F3",
  itemTypeSuffix: "#9C27B0",
  itemTypeRoot: "#FF9800",
  itemTypeParticle: "#607D8B",

  // Overlay
  overlay: "rgba(0, 0, 0, 0.7)",
} as const;

export type ThemeColors = typeof LightColors;
