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

  it('renders "All cards" label for default deck', () => {
    render(<DeckCard deck={mockAllDeck} onPress={jest.fn()} />);

    expect(screen.getByText("All cards")).toBeTruthy();
  });

  it("does not show pin icon for regular deck", () => {
    render(<DeckCard deck={mockDeck} onPress={jest.fn()} />);

    expect(screen.queryByText("📌")).toBeNull();
  });

  it("renders edit action button when handler provided", () => {
    render(
      <DeckCard deck={mockDeck} onPress={jest.fn()} onEditPress={jest.fn()} />
    );

    expect(screen.getByTestId("deck-edit-2")).toBeTruthy();
  });

  it("does not render study action button", () => {
    render(<DeckCard deck={mockDeck} onPress={jest.fn()} onEditPress={jest.fn()} />);

    expect(screen.queryByTestId("deck-study-2")).toBeNull();
  });

  it("calls onEditPress when edit button is pressed", () => {
    const onEditPress = jest.fn();
    render(
      <DeckCard
        deck={mockDeck}
        onPress={jest.fn()}
        onEditPress={onEditPress}
      />
    );

    fireEvent.press(screen.getByTestId("deck-edit-2"));

    expect(onEditPress).toHaveBeenCalledWith(mockDeck);
  });

  it('does not render edit button for default "All" deck', () => {
    render(
      <DeckCard
        deck={mockAllDeck}
        onPress={jest.fn()}
        onEditPress={jest.fn()}
      />
    );

    expect(screen.queryByTestId("deck-edit-1")).toBeNull();
  });

  it("shows item count in meta row when edit action is present", () => {
    render(<DeckCard deck={mockDeck} onPress={jest.fn()} onEditPress={jest.fn()} />);

    // Item count should be visible in meta row
    expect(screen.getByText("5 items")).toBeTruthy();
    // Badge should not be visible
    expect(screen.queryByText("·")).toBeTruthy();
  });
});
