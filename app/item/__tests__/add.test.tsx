import React from "react";
import { render, screen } from "@testing-library/react-native";
import AddItemScreen from "../add";
import { createMockSQLiteContext, createMockRouter } from "@/test-utils";

// Mock expo-router
const mockRouter = createMockRouter();
jest.mock("expo-router", () => ({
  useRouter: () => mockRouter,
}));

// Mock expo-sqlite
const mockDb = createMockSQLiteContext();
jest.mock("expo-sqlite", () => ({
  useSQLiteContext: () => mockDb,
}));

describe("AddItemScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without errors", () => {
    render(<AddItemScreen />);

    expect(screen.getByTestId("add-item-screen")).toBeTruthy();
  });

  it("renders the item form", () => {
    render(<AddItemScreen />);

    expect(screen.getByTestId("pali-input")).toBeTruthy();
    expect(screen.getByTestId("meaning-input")).toBeTruthy();
  });

  it("shows Add Item button", () => {
    render(<AddItemScreen />);

    expect(screen.getByText("Add Item")).toBeTruthy();
  });
});
