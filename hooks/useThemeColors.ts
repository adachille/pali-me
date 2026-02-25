import { useColorScheme } from "react-native";
import { DarkColors, LightColors, type ThemeColors } from "@/constants/theme";

/**
 * Returns the current theme colors based on the device's color scheme setting.
 * Automatically switches between light and dark palettes.
 */
export function useThemeColors(): ThemeColors {
  const colorScheme = useColorScheme();
  return colorScheme === "dark" ? DarkColors : LightColors;
}
