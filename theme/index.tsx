import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useColorScheme, type ColorSchemeName } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const THEME_STORAGE_KEY = "@theme_mode";

export type ThemeMode = "light" | "dark" | "system";

const lightColors = {
  background: "#ffffff",
  surface: "#f5f5f5",
  surfaceVariant: "#f0f0f0",
  border: "#e0e0e0",
  borderSubtle: "#cccccc",
  text: "#333333",
  textSecondary: "#666666",
  textTertiary: "#999999",
  primary: "#4CAF50",
  primaryDark: "#388E3C",
  primaryLight: "#A5D6A7",
  primarySurface: "#E8F5E9",
  secondary: "#2196F3",
  secondaryDark: "#1976D2",
  error: "#f44336",
  errorSurface: "#ffebee",
  tabBarActive: "#007AFF",
  placeholder: "#999999",
};

const darkColors = {
  background: "#121212",
  surface: "#1E1E1E",
  surfaceVariant: "#2C2C2C",
  border: "#333333",
  borderSubtle: "#444444",
  text: "#F0F0F0",
  textSecondary: "#AAAAAA",
  textTertiary: "#666666",
  primary: "#4CAF50",
  primaryDark: "#388E3C",
  primaryLight: "#A5D6A7",
  primarySurface: "#1B3A1F",
  secondary: "#42A5F5",
  secondaryDark: "#1E88E5",
  error: "#EF5350",
  errorSurface: "#3B1515",
  tabBarActive: "#60A5FA",
  placeholder: "#555555",
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
