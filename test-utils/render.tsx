// Custom render utilities for testing pali-me components
import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react-native";

/**
 * Custom render function that wraps components with necessary providers
 * Extend this as the app grows to include theme providers, state management, etc.
 */
interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  // Add custom options here as needed
}

export function renderWithProviders(ui: ReactElement, options?: CustomRenderOptions) {
  // Currently just passes through, but can be extended with providers
  // Example: <ThemeProvider><NavigationContainer>{ui}</NavigationContainer></ThemeProvider>
  return render(ui, options);
}

// Re-export everything from React Testing Library
export * from "@testing-library/react-native";

// Export the custom render as the default
export { renderWithProviders as render };
