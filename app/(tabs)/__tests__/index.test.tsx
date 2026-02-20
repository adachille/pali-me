// Tests for the home screen (app/(tabs)/index.tsx)
import React from "react";
import { render, screen, waitFor } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import HomeScreen from "../index";
import { createMockSQLiteContext, createMockRouter } from "@/test-utils";

// Mock expo-router
const mockRouter = createMockRouter();
jest.mock("expo-router", () => ({
  useRouter: () => mockRouter,
  useLocalSearchParams: () => ({}),
}));

// Mock expo-sqlite
const mockDb = createMockSQLiteContext({
  getAllAsync: jest.fn().mockResolvedValue([
    {
      id: 1,
      name: "All",
      created_at: "2024-01-01T00:00:00.000Z",
      item_count: 5,
    },
  ]),
  getFirstAsync: jest.fn().mockResolvedValue(null),
});
jest.mock("expo-sqlite", () => ({
  useSQLiteContext: () => mockDb,
}));

// Wrapper with NavigationContainer for useFocusEffect
function TestWrapper({ children }: { children: React.ReactNode }) {
  return <NavigationContainer>{children}</NavigationContainer>;
}

describe("Home Screen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("displays without errors", async () => {
    render(<HomeScreen />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByTestId("home-screen")).toBeTruthy();
    });
  });

  it("has the home-screen testID", async () => {
    render(<HomeScreen />, { wrapper: TestWrapper });

    await waitFor(() => {
      const homeScreen = screen.getByTestId("home-screen");
      expect(homeScreen).toBeTruthy();
    });
  });

  it("shows the deck list", async () => {
    render(<HomeScreen />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByTestId("deck-list")).toBeTruthy();
    });
  });

  it("shows the create deck FAB", async () => {
    render(<HomeScreen />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByTestId("create-deck-fab")).toBeTruthy();
    });
  });

  it("shows the search input", async () => {
    render(<HomeScreen />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByTestId("deck-search-input")).toBeTruthy();
    });
  });
});
