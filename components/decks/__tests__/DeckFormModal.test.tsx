import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react-native";
import { DeckFormModal } from "../DeckFormModal";
import { deckRepository } from "@/db";

// Mock SQLite context
jest.mock("expo-sqlite", () => ({
  useSQLiteContext: () => ({
    getAllAsync: jest.fn(),
    getFirstAsync: jest.fn(),
    runAsync: jest.fn(),
  }),
}));

// Mock deckRepository
jest.mock("@/db", () => ({
  ...jest.requireActual("@/db"),
  deckRepository: {
    nameExists: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  useSQLiteContext: () => ({
    getAllAsync: jest.fn(),
    getFirstAsync: jest.fn(),
    runAsync: jest.fn(),
  }),
}));

const defaultProps = {
  visible: true,
  onSave: jest.fn(),
  onClose: jest.fn(),
};

describe("DeckFormModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (deckRepository.nameExists as jest.Mock).mockResolvedValue(false);
    (deckRepository.create as jest.Mock).mockResolvedValue({ id: 2, name: "Test Deck" });
    (deckRepository.update as jest.Mock).mockResolvedValue({ id: 2, name: "Updated Deck" });
  });

  describe("create mode", () => {
    it("renders with create title", () => {
      render(<DeckFormModal {...defaultProps} />);

      expect(screen.getByText("New Deck")).toBeTruthy();
    });

    it("renders name input", () => {
      render(<DeckFormModal {...defaultProps} />);

      expect(screen.getByTestId("deck-name-input")).toBeTruthy();
    });

    it("renders Create button", () => {
      render(<DeckFormModal {...defaultProps} />);

      expect(screen.getByText("Create")).toBeTruthy();
    });

    it("shows error for empty name", async () => {
      render(<DeckFormModal {...defaultProps} />);

      fireEvent.press(screen.getByTestId("deck-form-save"));

      await waitFor(() => {
        expect(screen.getByText("Deck name is required")).toBeTruthy();
      });
    });

    it('shows error for reserved name "All"', async () => {
      render(<DeckFormModal {...defaultProps} />);

      fireEvent.changeText(screen.getByTestId("deck-name-input"), "All");
      fireEvent.press(screen.getByTestId("deck-form-save"));

      await waitFor(() => {
        expect(screen.getByText('Cannot use reserved name "All"')).toBeTruthy();
      });
    });

    it("creates deck on valid submission", async () => {
      render(<DeckFormModal {...defaultProps} />);

      fireEvent.changeText(screen.getByTestId("deck-name-input"), "New Deck");
      fireEvent.press(screen.getByTestId("deck-form-save"));

      await waitFor(() => {
        expect(deckRepository.create).toHaveBeenCalled();
        expect(defaultProps.onSave).toHaveBeenCalled();
        expect(defaultProps.onClose).toHaveBeenCalled();
      });
    });

    it("calls onClose when cancel is pressed", () => {
      render(<DeckFormModal {...defaultProps} />);

      fireEvent.press(screen.getByTestId("deck-form-cancel"));

      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  describe("edit mode", () => {
    const editProps = {
      ...defaultProps,
      deckId: 2,
      initialName: "Verbs",
    };

    it("renders with rename title", () => {
      render(<DeckFormModal {...editProps} />);

      expect(screen.getByText("Rename Deck")).toBeTruthy();
    });

    it("pre-fills input with initial name", () => {
      render(<DeckFormModal {...editProps} />);

      expect(screen.getByDisplayValue("Verbs")).toBeTruthy();
    });

    it("renders Save button", () => {
      render(<DeckFormModal {...editProps} />);

      expect(screen.getByText("Save")).toBeTruthy();
    });

    it("updates deck on valid submission", async () => {
      render(<DeckFormModal {...editProps} />);

      fireEvent.changeText(screen.getByTestId("deck-name-input"), "Updated Name");
      fireEvent.press(screen.getByTestId("deck-form-save"));

      await waitFor(() => {
        expect(deckRepository.update).toHaveBeenCalled();
        expect(defaultProps.onSave).toHaveBeenCalled();
      });
    });

    it("renders delete button when onDelete is provided", () => {
      const onDelete = jest.fn();
      render(<DeckFormModal {...editProps} onDelete={onDelete} />);

      expect(screen.getByText("Delete Deck")).toBeTruthy();
    });

    it("calls onDelete when delete button is pressed", () => {
      const onDelete = jest.fn();
      render(<DeckFormModal {...editProps} onDelete={onDelete} />);

      fireEvent.press(screen.getByTestId("deck-form-delete"));

      expect(onDelete).toHaveBeenCalled();
    });

    it("does not render delete button when onDelete is not provided", () => {
      render(<DeckFormModal {...editProps} />);

      expect(screen.queryByText("Delete Deck")).toBeNull();
    });
  });

  describe("character counter", () => {
    it("shows character count", () => {
      render(<DeckFormModal {...defaultProps} />);

      expect(screen.getByText("0/50 characters")).toBeTruthy();
    });

    it("updates character count as user types", () => {
      render(<DeckFormModal {...defaultProps} />);

      fireEvent.changeText(screen.getByTestId("deck-name-input"), "Hello");

      expect(screen.getByText("5/50 characters")).toBeTruthy();
    });
  });
});
