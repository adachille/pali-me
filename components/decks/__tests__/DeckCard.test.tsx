import type { DeckWithCount } from "@/db/repositories/deckRepository";
import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";
import { DeckCard } from "../DeckCard";

const mockDeck: DeckWithCount = {
  id: 2,
  name: "Verbs",
  itemCount: 5,
  createdAt: new Date(),
  studyDirection: "random",
};

const mockAllDeck: DeckWithCount = {
  id: 1,
  name: "All",
  itemCount: 10,
  createdAt: new Date("2024-01-01"),
  studyDirection: "random",
};

describe("DeckCard", () => {
  it("renders deck name", () => {
    render(<DeckCard deck={mockDeck} onPress={jest.fn()} />);

    expect(screen.getByText("Verbs")).toBeTruthy();
  });

  it("renders item count", () => {
    render(<DeckCard deck={mockDeck} onPress={jest.fn()} />);

    expect(screen.getByText("5 items")).toBeTruthy();
  });

  it("renders singular item count correctly", () => {
    const singleItemDeck = { ...mockDeck, itemCount: 1 };
    render(<DeckCard deck={singleItemDeck} onPress={jest.fn()} />);

    expect(screen.getByText("1 item")).toBeTruthy();
  });

  it("renders relative date", () => {
    render(<DeckCard deck={mockDeck} onPress={jest.fn()} />);

    // Should show "Created today" since createdAt is new Date()
    expect(screen.getByText("Created today")).toBeTruthy();
  });

  it("calls onPress with deck when pressed", () => {
    const onPress = jest.fn();
    render(<DeckCard deck={mockDeck} onPress={onPress} />);

    fireEvent.press(screen.getByTestId("deck-card-2"));

    expect(onPress).toHaveBeenCalledWith(mockDeck);
  });

  it('shows pin icon for "All" deck', () => {
    render(<DeckCard deck={mockAllDeck} onPress={jest.fn()} />);

    expect(screen.getByText("📌")).toBeTruthy();
  });

  it("does not show pin icon for regular deck", () => {
    render(<DeckCard deck={mockDeck} onPress={jest.fn()} />);

    expect(screen.queryByText("📌")).toBeNull();
  });
});
