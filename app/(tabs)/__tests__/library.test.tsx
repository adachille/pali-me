// Tests for the library screen (app/(tabs)/library.tsx)
import React from "react";
import { render, screen, waitFor } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import LibraryScreen from "../library";
import { createMockSQLiteContext, createMockRouter } from "@/test-utils";

// Mock expo-router
const mockRouter = createMockRouter();
jest.mock("expo-router", () => ({
  useRouter: () => mockRouter,
  useLocalSearchParams: () => ({}),
}));

// Mock expo-sqlite
const mockDb = createMockSQLiteContext({
  getAllAsync: jest.fn().mockResolvedValue([]),
});
jest.mock("expo-sqlite", () => ({
  useSQLiteContext: () => mockDb,
}));

// Wrapper with NavigationContainer for useFocusEffect
function TestWrapper({ children }: { children: React.ReactNode }) {
  return <NavigationContainer>{children}</NavigationContainer>;
}

describe("Library Screen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("displays without errors", async () => {
    render(<LibraryScreen />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByTestId("library-screen")).toBeTruthy();
    });
  });

  it("has the library-screen testID", async () => {
    render(<LibraryScreen />, { wrapper: TestWrapper });

    await waitFor(() => {
      const libraryScreen = screen.getByTestId("library-screen");
      expect(libraryScreen).toBeTruthy();
    });
  });

  it("shows empty state when no items exist", async () => {
    render(<LibraryScreen />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByTestId("empty-state")).toBeTruthy();
    });
  });

  it("shows FAB button to add items", async () => {
    render(<LibraryScreen />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByTestId("add-item-fab")).toBeTruthy();
    });
  });
});
