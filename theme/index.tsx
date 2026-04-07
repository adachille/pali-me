import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useColorScheme, type ColorSchemeName } from "react-native";

const THEME_STORAGE_KEY = "@theme_mode";

export type ThemeMode = "light" | "dark" | "system";

const lightColors = {
  background: "rgba(255, 255, 255, 1)",
  surface: "rgba(245, 245, 245, 1)",
  surfaceVariant: "rgba(240, 240, 240, 1)",
  border: "rgba(224, 224, 224, 1)",
  borderSubtle: "rgba(204, 204, 204, 1)",
  text: "rgba(51, 51, 51, 1)",
  textSecondary: "rgba(102, 102, 102, 1)",
  textTertiary: "rgba(153, 153, 153, 1)",
  primary: "rgba(76, 175, 80, 1)",
  primaryDark: "rgba(56, 142, 60, 1)",
  primaryLight: "rgba(165, 214, 167, 1)",
  primarySurface: "rgba(232, 245, 233, 1)",
  primaryAlpha25: "rgba(76, 175, 80, 0.25)",
  primaryDarkAlpha25: "rgba(56, 142, 60, 0.25)",
  error: "rgba(244, 67, 54, 1)",
  errorSurface: "rgba(255, 235, 238, 1)",
  gold: "rgba(242, 202, 70, 1)",
  goldDark: "rgba(245, 127, 23, 1)",
  tabBarActive: "rgba(76, 175, 80, 1)",
  placeholder: "rgba(153, 153, 153, 1)",
};

const darkColors = {
  background: "rgba(18, 18, 18, 1)",
  surface: "rgba(30, 30, 30, 1)",
  surfaceVariant: "rgba(44, 44, 44, 1)",
  border: "rgba(51, 51, 51, 1)",
  borderSubtle: "rgba(68, 68, 68, 1)",
  text: "rgba(240, 240, 240, 1)",
  textSecondary: "rgba(170, 170, 170, 1)",
  textTertiary: "rgba(102, 102, 102, 1)",
  primary: "rgba(76, 175, 80, 1)",
  primaryDark: "rgba(56, 142, 60, 1)",
  primaryLight: "rgba(165, 214, 167, 1)",
  primarySurface: "rgba(27, 58, 31, 1)",
  primaryAlpha25: "rgba(76, 175, 80, 0.25)",
  primaryDarkAlpha25: "rgba(56, 142, 60, 0.25)",
  error: "rgba(239, 83, 80, 1)",
  errorSurface: "rgba(59, 21, 21, 1)",
  gold: "rgba(255, 179, 0, 1)",
  goldDark: "rgba(255, 143, 0, 1)",
  tabBarActive: "rgba(76, 175, 80, 1)",
  placeholder: "rgba(85, 85, 85, 1)",
};

export type AppColors = typeof lightColors;

interface ThemeContextValue {
  colors: AppColors;
  colorScheme: ColorSchemeName;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }): ReactNode {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>("system");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((stored) => {
      if (stored === "light" || stored === "dark" || stored === "system") {
        setThemeModeState(stored);
      }
      setIsLoaded(true);
    });
  }, []);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
  }, []);

  const effectiveColorScheme = themeMode === "system" ? systemColorScheme : themeMode;
  const colors = effectiveColorScheme === "dark" ? darkColors : lightColors;

  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider
      value={{
        colors,
        colorScheme: effectiveColorScheme,
        themeMode,
        setThemeMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): {
  colors: AppColors;
  colorScheme: ColorSchemeName;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
} {
  const context = useContext(ThemeContext);
  if (context) {
    return context;
  }
  // Fallback for when ThemeProvider is not available (e.g., tests)
  const colorScheme = useColorScheme();
  const colors = colorScheme === "dark" ? darkColors : lightColors;
  return {
    colors,
    colorScheme,
    themeMode: "system",
    setThemeMode: () => {},
  };
}
