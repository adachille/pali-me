import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { DeckList } from "../DeckList";
import type { DeckWithCount } from "@/db/repositories/deckRepository";

const mockDecks: DeckWithCount[] = [
  {
    id: 1,
    name: "All",
    itemCount: 10,
    createdAt: new Date("2024-01-01"),
    studyDirection: "random",
  },
  {
    id: 2,
    name: "Verbs",
    itemCount: 5,
    createdAt: new Date("2024-01-02"),
    studyDirection: "random",
  },
];

const defaultProps = {
  decks: mockDecks,
  searchQuery: "",
  sortOption: "name_asc" as const,
  onSearchChange: jest.fn(),
  onSortChange: jest.fn(),
  onDeckPress: jest.fn(),
  onCreatePress: jest.fn(),
};

describe("DeckList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders search input", () => {
    render(<DeckList {...defaultProps} />);

    expect(screen.getByTestId("deck-search-input")).toBeTruthy();
  });

  it("renders deck cards", () => {
    render(<DeckList {...defaultProps} />);

    expect(screen.getByText("All")).toBeTruthy();
    expect(screen.getByText("Verbs")).toBeTruthy();
  });

  it("calls onSearchChange when typing in search input", () => {
    render(<DeckList {...defaultProps} />);

    fireEvent.changeText(screen.getByTestId("deck-search-input"), "verb");

    expect(defaultProps.onSearchChange).toHaveBeenCalledWith("verb");
  });

  it("calls onDeckPress when deck card is pressed", () => {
    render(<DeckList {...defaultProps} />);

    fireEvent.press(screen.getByTestId("deck-card-2"));

    expect(defaultProps.onDeckPress).toHaveBeenCalledWith(mockDecks[1]);
  });

  it("renders empty state when no decks", () => {
    render(<DeckList {...defaultProps} decks={[]} />);

    expect(screen.getByText("No custom decks yet")).toBeTruthy();
  });

  it("renders search empty state when searching with no results", () => {
    render(<DeckList {...defaultProps} decks={[]} searchQuery="xyz" />);

    expect(screen.getByText("No decks found")).toBeTruthy();
  });

  it("calls onCreatePress from empty state", () => {
    render(<DeckList {...defaultProps} decks={[]} />);

    fireEvent.press(screen.getByText("Create your first deck"));

    expect(defaultProps.onCreatePress).toHaveBeenCalled();
  });
});
