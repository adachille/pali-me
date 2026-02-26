import type { Item } from "@/db";
import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";
import { DeckItemList } from "../DeckItemList";

// Mock react-native-gesture-handler
jest.mock("react-native-gesture-handler", () => {
  const { View } = jest.requireActual("react-native");
  return {
    GestureHandlerRootView: View,
    GestureDetector: ({ children }: { children: React.ReactNode }) => children,
    Gesture: {
      Pan: () => ({
        activeOffsetX: () => ({
          onUpdate: () => ({
            onEnd: () => ({}),
          }),
        }),
      }),
    },
  };
});

// Mock react-native-reanimated
jest.mock("react-native-reanimated", () => {
  const { View } = jest.requireActual("react-native");
  const React = jest.requireActual("react");
  const AnimatedView = React.forwardRef((props: object, ref: React.Ref<unknown>) =>
    React.createElement(View, { ...props, ref })
  );
  AnimatedView.displayName = "AnimatedView";
  const Animated = {
    View: AnimatedView,
  };
  return {
    __esModule: true,
    default: Animated,
    useSharedValue: () => ({ value: 0 }),
    useAnimatedStyle: () => ({}),
    withSpring: (val: number) => val,
    withTiming: (val: number) => val,
    runOnJS: (fn: () => void) => fn,
  };
});

const mockItems: Item[] = [
  {
    id: 1,
    pali: "dhamma",
    meaning: "teaching, truth, law",
    type: "word",
    createdAt: new Date(),
    notes: null,
  },
  {
    id: 2,
    pali: "buddha",
    meaning: "awakened one",
    type: "word",
    createdAt: new Date(),
    notes: null,
  },
];

describe("DeckItemList", () => {
  const defaultProps = {
    items: mockItems,
    onItemPress: jest.fn(),
    onRemoveItem: jest.fn(),
    onAddPress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the item list", () => {
    render(<DeckItemList {...defaultProps} />);

    expect(screen.getByTestId("deck-item-list")).toBeTruthy();
  });

  it("renders all items", () => {
    render(<DeckItemList {...defaultProps} />);

    expect(screen.getByText("dhamma")).toBeTruthy();
    expect(screen.getByText("buddha")).toBeTruthy();
  });

  it("renders item meanings", () => {
    render(<DeckItemList {...defaultProps} />);

    expect(screen.getByText("teaching, truth, law")).toBeTruthy();
    expect(screen.getByText("awakened one")).toBeTruthy();
  });

  it("renders item type badges", () => {
    render(<DeckItemList {...defaultProps} />);

    const wordBadges = screen.getAllByText("word");
    expect(wordBadges.length).toBe(2);
  });

  it("calls onItemPress when item is pressed", () => {
    const onItemPress = jest.fn();
    render(<DeckItemList {...defaultProps} onItemPress={onItemPress} />);

    fireEvent.press(screen.getByTestId("deck-item-1"));

    expect(onItemPress).toHaveBeenCalledWith(mockItems[0]);
  });

  it("shows empty state when no items", () => {
    render(<DeckItemList {...defaultProps} items={[]} />);

    expect(screen.getByTestId("deck-empty-items")).toBeTruthy();
    expect(screen.getByText("No cards in this deck")).toBeTruthy();
  });

  it("shows add button in empty state for non-default deck", () => {
    render(<DeckItemList {...defaultProps} items={[]} isDefaultDeck={false} />);

    expect(screen.getByTestId("add-items-button")).toBeTruthy();
    expect(screen.getByText("Add Cards")).toBeTruthy();
  });

  it("calls onAddPress when add button is pressed in empty state", () => {
    const onAddPress = jest.fn();
    render(<DeckItemList {...defaultProps} items={[]} onAddPress={onAddPress} />);

    fireEvent.press(screen.getByTestId("add-items-button"));

    expect(onAddPress).toHaveBeenCalled();
  });

  it("shows different empty message for default deck", () => {
    render(<DeckItemList {...defaultProps} items={[]} isDefaultDeck={true} />);

    expect(screen.getByText("No cards in your library")).toBeTruthy();
    expect(screen.queryByTestId("add-items-button")).toBeNull();
  });

  it("renders items with different types correctly", () => {
    const mixedItems: Item[] = [
      { ...mockItems[0], type: "prefix" },
      { ...mockItems[1], type: "suffix" },
    ];
    render(<DeckItemList {...defaultProps} items={mixedItems} />);

    expect(screen.getByText("prefix")).toBeTruthy();
    expect(screen.getByText("suffix")).toBeTruthy();
  });
});
