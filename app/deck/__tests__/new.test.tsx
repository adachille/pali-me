import { createMockRouter, createMockSQLiteContext } from "@/test-utils";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import React from "react";
import NewDeckScreen from "../new";

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

// Mock deckRepository
const mockCreate = jest.fn();
jest.mock("@/db", () => ({
  deckRepository: {
    create: (...args: unknown[]) => mockCreate(...args),
  },
  useSQLiteContext: () => mockDb,
}));

import { Alert } from "react-native";

// Mock Alert
const mockAlert = jest.spyOn(Alert, "alert").mockImplementation(jest.fn());

describe("NewDeckScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreate.mockResolvedValue({ id: 5, name: "Test Deck" });
  });

  it("renders without errors", () => {
    render(<NewDeckScreen />);

    expect(screen.getByTestId("new-deck-screen")).toBeTruthy();
  });

  it("shows the deck name input", () => {
    render(<NewDeckScreen />);

    expect(screen.getByTestId("deck-name-input")).toBeTruthy();
  });

  it("shows the label", () => {
    render(<NewDeckScreen />);

    expect(screen.getByText("Deck Name")).toBeTruthy();
  });

  it("shows placeholder text", () => {
    render(<NewDeckScreen />);

    expect(screen.getByPlaceholderText("e.g., Verbs, Daily Study")).toBeTruthy();
  });

  it("shows character count hint", () => {
    render(<NewDeckScreen />);

    expect(screen.getByText("0/50 characters")).toBeTruthy();
  });

  it("updates character count as user types", () => {
    render(<NewDeckScreen />);

    fireEvent.changeText(screen.getByTestId("deck-name-input"), "Test");

    expect(screen.getByText("4/50 characters")).toBeTruthy();
  });

  it("shows cancel and save buttons", () => {
    render(<NewDeckScreen />);

    expect(screen.getByTestId("cancel-button")).toBeTruthy();
    expect(screen.getByTestId("save-button")).toBeTruthy();
    expect(screen.getByText("Cancel")).toBeTruthy();
    expect(screen.getByText("Create Deck")).toBeTruthy();
  });

  it("navigates back when cancel is pressed with empty input", () => {
    render(<NewDeckScreen />);

    fireEvent.press(screen.getByTestId("cancel-button"));

    expect(mockRouter.back).toHaveBeenCalled();
  });

  it("shows confirmation alert when cancel is pressed with text entered", () => {
    render(<NewDeckScreen />);

    fireEvent.changeText(screen.getByTestId("deck-name-input"), "My Deck");
    fireEvent.press(screen.getByTestId("cancel-button"));

    expect(mockAlert).toHaveBeenCalledWith(
      "Discard changes?",
      "Your deck will not be saved.",
      expect.any(Array)
    );
  });

  it("shows error for empty deck name", async () => {
    render(<NewDeckScreen />);

    fireEvent.press(screen.getByTestId("save-button"));

    await waitFor(() => {
      expect(screen.getByText("Deck name is required")).toBeTruthy();
    });
  });

  it("shows error for whitespace-only deck name", async () => {
    render(<NewDeckScreen />);

    fireEvent.changeText(screen.getByTestId("deck-name-input"), "   ");
    fireEvent.press(screen.getByTestId("save-button"));

    await waitFor(() => {
      expect(screen.getByText("Deck name is required")).toBeTruthy();
    });
  });

  it('shows error for reserved name "All"', async () => {
    render(<NewDeckScreen />);

    fireEvent.changeText(screen.getByTestId("deck-name-input"), "All");
    fireEvent.press(screen.getByTestId("save-button"));

    await waitFor(() => {
      expect(screen.getByText('Cannot use reserved name "All"')).toBeTruthy();
    });
  });

  it('shows error for reserved name "all" (case insensitive)', async () => {
    render(<NewDeckScreen />);

    fireEvent.changeText(screen.getByTestId("deck-name-input"), "all");
    fireEvent.press(screen.getByTestId("save-button"));

    await waitFor(() => {
      expect(screen.getByText('Cannot use reserved name "All"')).toBeTruthy();
    });
  });

  it("clears error when user types", async () => {
    render(<NewDeckScreen />);

    fireEvent.press(screen.getByTestId("save-button"));

    await waitFor(() => {
      expect(screen.getByText("Deck name is required")).toBeTruthy();
    });

    fireEvent.changeText(screen.getByTestId("deck-name-input"), "V");

    await waitFor(() => {
      expect(screen.queryByText("Deck name is required")).toBeNull();
    });
  });

  it("creates deck with valid name", async () => {
    render(<NewDeckScreen />);

    fireEvent.changeText(screen.getByTestId("deck-name-input"), "Verbs");
    fireEvent.press(screen.getByTestId("save-button"));

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith(mockDb, "Verbs");
    });
  });

  it("trims whitespace from deck name", async () => {
    render(<NewDeckScreen />);

    fireEvent.changeText(screen.getByTestId("deck-name-input"), "  Verbs  ");
    fireEvent.press(screen.getByTestId("save-button"));

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith(mockDb, "Verbs");
    });
  });

  it("navigates to deck detail after successful creation", async () => {
    mockCreate.mockResolvedValue({ id: 5, name: "Verbs" });
    render(<NewDeckScreen />);

    fireEvent.changeText(screen.getByTestId("deck-name-input"), "Verbs");
    fireEvent.press(screen.getByTestId("save-button"));

    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith("/deck/5");
    });
  });

  it("shows error message when creation fails", async () => {
    mockCreate.mockRejectedValue(new Error("Deck already exists"));
    render(<NewDeckScreen />);

    fireEvent.changeText(screen.getByTestId("deck-name-input"), "Existing Deck");
    fireEvent.press(screen.getByTestId("save-button"));

    await waitFor(() => {
      expect(screen.getByText("Deck already exists")).toBeTruthy();
    });
  });

  it("shows generic error message for unknown errors", async () => {
    mockCreate.mockRejectedValue("Some error");
    render(<NewDeckScreen />);

    fireEvent.changeText(screen.getByTestId("deck-name-input"), "Test Deck");
    fireEvent.press(screen.getByTestId("save-button"));

    await waitFor(() => {
      expect(screen.getByText("Failed to create deck")).toBeTruthy();
    });
  });
});
