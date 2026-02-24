import { createMockSQLiteContext } from "@/test-utils";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import React from "react";
import { AddItemsModal } from "../AddItemsModal";

// Mock expo-sqlite
const mockDb = createMockSQLiteContext();
jest.mock("expo-sqlite", () => ({
  useSQLiteContext: () => mockDb,
}));

// Mock deckRepository
const mockGetItemsNotInDeck = jest.fn();
const mockAddItemsToDeck = jest.fn();
jest.mock("@/db", () => ({
  ...jest.requireActual("@/db"),
  deckRepository: {
    getItemsNotInDeck: (...args: unknown[]) => mockGetItemsNotInDeck(...args),
    addItemsToDeck: (...args: unknown[]) => mockAddItemsToDeck(...args),
  },
  useSQLiteContext: () => mockDb,
}));

const mockItems = [
  {
    id: 1,
    pali: "dhamma",
    meaning: "teaching, truth",
    type: "word",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    pali: "sangha",
    meaning: "community",
    type: "word",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 3,
    pali: "pa-",
    meaning: "forth, forward",
    type: "prefix",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe("AddItemsModal", () => {
  const defaultProps = {
    visible: true,
    deckId: 2,
    onClose: jest.fn(),
    onItemsAdded: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetItemsNotInDeck.mockResolvedValue(mockItems);
    mockAddItemsToDeck.mockResolvedValue(undefined);
  });

  it("renders when visible", async () => {
    render(<AddItemsModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId("add-items-modal")).toBeTruthy();
    });
  });

  it("shows the title", async () => {
    render(<AddItemsModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("Add Cards to Deck")).toBeTruthy();
    });
  });

  it("shows the search input", async () => {
    render(<AddItemsModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId("add-items-search")).toBeTruthy();
    });
  });

  it("loads and displays available items", async () => {
    render(<AddItemsModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("dhamma")).toBeTruthy();
      expect(screen.getByText("sangha")).toBeTruthy();
    });
  });

  it("calls getItemsNotInDeck with correct deckId", async () => {
    render(<AddItemsModal {...defaultProps} />);

    await waitFor(() => {
      expect(mockGetItemsNotInDeck).toHaveBeenCalledWith(mockDb, 2);
    });
  });

  it("shows cancel button", async () => {
    render(<AddItemsModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId("close-add-items-modal")).toBeTruthy();
      expect(screen.getByText("Cancel")).toBeTruthy();
    });
  });

  it("calls onClose when cancel is pressed", async () => {
    const onClose = jest.fn();
    render(<AddItemsModal {...defaultProps} onClose={onClose} />);

    await waitFor(() => {
      expect(screen.getByTestId("close-add-items-modal")).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId("close-add-items-modal"));

    expect(onClose).toHaveBeenCalled();
  });

  it("shows disabled add button initially", async () => {
    render(<AddItemsModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId("add-selected-button")).toBeTruthy();
      expect(screen.getByText("Add Selected")).toBeTruthy();
    });
  });

  it("toggles item selection when pressed", async () => {
    render(<AddItemsModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId("selectable-item-1")).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId("selectable-item-1"));

    await waitFor(() => {
      expect(screen.getByText("Add Selected (1)")).toBeTruthy();
    });
  });

  it("allows selecting multiple items", async () => {
    render(<AddItemsModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId("selectable-item-1")).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId("selectable-item-1"));
    fireEvent.press(screen.getByTestId("selectable-item-2"));

    await waitFor(() => {
      expect(screen.getByText("Add Selected (2)")).toBeTruthy();
    });
  });

  it("deselects item when pressed again", async () => {
    render(<AddItemsModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId("selectable-item-1")).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId("selectable-item-1"));

    await waitFor(() => {
      expect(screen.getByText("Add Selected (1)")).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId("selectable-item-1"));

    await waitFor(() => {
      expect(screen.getByText("Add Selected")).toBeTruthy();
    });
  });

  it("filters items based on search query", async () => {
    render(<AddItemsModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId("add-items-search")).toBeTruthy();
    });

    fireEvent.changeText(screen.getByTestId("add-items-search"), "dhamma");

    await waitFor(() => {
      expect(screen.getByText("dhamma")).toBeTruthy();
      expect(screen.queryByText("sangha")).toBeNull();
    });
  });

  it("shows empty message when all items are in deck", async () => {
    mockGetItemsNotInDeck.mockResolvedValue([]);
    render(<AddItemsModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("All cards already in deck")).toBeTruthy();
    });
  });

  it("shows no matching cards message when search has no results", async () => {
    render(<AddItemsModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId("add-items-search")).toBeTruthy();
    });

    fireEvent.changeText(screen.getByTestId("add-items-search"), "xyz123nonexistent");

    await waitFor(() => {
      expect(screen.getByText("No matching cards")).toBeTruthy();
    });
  });

  it("calls addItemsToDeck when add button is pressed", async () => {
    render(<AddItemsModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId("selectable-item-1")).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId("selectable-item-1"));
    fireEvent.press(screen.getByTestId("selectable-item-2"));

    await waitFor(() => {
      expect(screen.getByText("Add Selected (2)")).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId("add-selected-button"));

    await waitFor(() => {
      expect(mockAddItemsToDeck).toHaveBeenCalledWith(mockDb, 2, [1, 2]);
    });
  });

  it("calls onItemsAdded and onClose after successful add", async () => {
    const onItemsAdded = jest.fn();
    const onClose = jest.fn();
    render(<AddItemsModal {...defaultProps} onItemsAdded={onItemsAdded} onClose={onClose} />);

    await waitFor(() => {
      expect(screen.getByTestId("selectable-item-1")).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId("selectable-item-1"));
    fireEvent.press(screen.getByTestId("add-selected-button"));

    await waitFor(() => {
      expect(onItemsAdded).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });

  it("displays item types with badges", async () => {
    render(<AddItemsModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getAllByText("word").length).toBe(2);
      expect(screen.getByText("prefix")).toBeTruthy();
    });
  });
});

describe("AddItemsModal - Error States", () => {
  const defaultProps = {
    visible: true,
    deckId: 2,
    onClose: jest.fn(),
    onItemsAdded: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows error state when loading fails", async () => {
    mockGetItemsNotInDeck.mockRejectedValue(new Error("Database error"));
    render(<AddItemsModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("Failed to load items")).toBeTruthy();
      expect(screen.getByTestId("retry-load-items")).toBeTruthy();
    });
  });

  it("retries loading when retry button is pressed", async () => {
    mockGetItemsNotInDeck.mockRejectedValueOnce(new Error("Database error"));
    render(<AddItemsModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId("retry-load-items")).toBeTruthy();
    });

    mockGetItemsNotInDeck.mockResolvedValueOnce(mockItems);
    fireEvent.press(screen.getByTestId("retry-load-items"));

    await waitFor(() => {
      expect(screen.getByText("dhamma")).toBeTruthy();
    });
  });
});
