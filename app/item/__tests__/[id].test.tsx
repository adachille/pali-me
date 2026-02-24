import { createMockRouter, createMockSQLiteContext } from "@/test-utils";
import { render, screen, waitFor } from "@testing-library/react-native";
import React from "react";
import EditItemScreen from "../[id]";

// Mock expo-router
const mockRouter = createMockRouter();
jest.mock("expo-router", () => ({
  useRouter: () => mockRouter,
  useLocalSearchParams: () => ({ id: "1" }),
}));

// Mock expo-sqlite
const mockDb = createMockSQLiteContext();
jest.mock("expo-sqlite", () => ({
  useSQLiteContext: () => mockDb,
}));

describe("EditItemScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without errors", async () => {
    mockDb.getFirstAsync.mockResolvedValue({
      id: 1,
      type: "word",
      pali: "dhamma",
      meaning: "teaching",
      notes: null,
      created_at: "2024-01-01T00:00:00.000Z",
    });

    render(<EditItemScreen />);

    await waitFor(() => {
      expect(screen.getByTestId("edit-item-screen")).toBeTruthy();
    });
  });

  it("shows loading state initially", () => {
    mockDb.getFirstAsync.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<EditItemScreen />);

    expect(screen.getByTestId("edit-item-screen")).toBeTruthy();
  });

  it("shows form when item is loaded", async () => {
    mockDb.getFirstAsync.mockResolvedValue({
      id: 1,
      type: "word",
      pali: "dhamma",
      meaning: "teaching",
      notes: null,
      created_at: "2024-01-01T00:00:00.000Z",
    });

    render(<EditItemScreen />);

    await waitFor(() => {
      expect(screen.getByTestId("pali-input")).toBeTruthy();
    });
  });

  it("shows Save Changes button", async () => {
    mockDb.getFirstAsync.mockResolvedValue({
      id: 1,
      type: "word",
      pali: "dhamma",
      meaning: "teaching",
      notes: null,
      created_at: "2024-01-01T00:00:00.000Z",
    });

    render(<EditItemScreen />);

    await waitFor(() => {
      expect(screen.getByText("Save Changes")).toBeTruthy();
    });
  });

  it("shows delete button", async () => {
    mockDb.getFirstAsync.mockResolvedValue({
      id: 1,
      type: "word",
      pali: "dhamma",
      meaning: "teaching",
      notes: null,
      created_at: "2024-01-01T00:00:00.000Z",
    });

    render(<EditItemScreen />);

    await waitFor(() => {
      expect(screen.getByTestId("delete-button")).toBeTruthy();
    });
  });

  it("shows error when item not found", async () => {
    mockDb.getFirstAsync.mockResolvedValue(null);

    render(<EditItemScreen />);

    await waitFor(() => {
      expect(screen.getByText("Card not found")).toBeTruthy();
    });
  });
});
