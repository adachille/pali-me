// Tests for the learn screen (app/(tabs)/index.tsx)
import React from "react";
import { render, screen, waitFor } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import LearnScreen from "../index";
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
  getFirstAsync: jest.fn().mockResolvedValue(null),
});
jest.mock("expo-sqlite", () => ({
  useSQLiteContext: () => mockDb,
}));

// Wrapper with NavigationContainer for useFocusEffect
function TestWrapper({ children }: { children: React.ReactNode }) {
  return <NavigationContainer>{children}</NavigationContainer>;
}

describe("Learn Screen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("displays without errors", async () => {
    render(<LearnScreen />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByTestId("learn-screen")).toBeTruthy();
    });
  });

  it("shows the lesson map list", async () => {
    render(<LearnScreen />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByTestId("lesson-map-list")).toBeTruthy();
    });
  });

  it("renders lesson 1 with available learn node", async () => {
    render(<LearnScreen />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByTestId("lesson-map-item-1")).toBeTruthy();
    });
  });
});
