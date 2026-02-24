import { createMockRouter, createMockSQLiteContext } from "@/test-utils";
import { NavigationContainer } from "@react-navigation/native";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import React from "react";
import DeckDetailScreen from "../[id]";

// Mock expo-router
const mockRouter = createMockRouter();
jest.mock("expo-router", () => ({
  useRouter: () => mockRouter,
  useLocalSearchParams: () => ({ id: "2" }),
  Stack: {
    Screen: () => null,
  },
}));

// Mock expo-sqlite
const mockDb = createMockSQLiteContext();
jest.mock("expo-sqlite", () => ({
  useSQLiteContext: () => mockDb,
}));

// Mock deckRepository
const mockGetById = jest.fn();
const mockGetItemsInDeck = jest.fn();
const mockDeleteDeck = jest.fn();
const mockRemoveItemFromDeck = jest.fn();

jest.mock("@/db", () => ({
  DEFAULT_DECK_ID: 1,
  deckRepository: {
    getById: (...args: unknown[]) => mockGetById(...args),
    getItemsInDeck: (...args: unknown[]) => mockGetItemsInDeck(...args),
    deleteDeck: (...args: unknown[]) => mockDeleteDeck(...args),
    removeItemFromDeck: (...args: unknown[]) => mockRemoveItemFromDeck(...args),
  },
  useSQLiteContext: () => mockDb,
}));

// Mock deck components
jest.mock("@/components/decks", () => {
  const { View, Pressable, Text } = jest.requireActual("react-native");
  return {
    AddItemsModal: ({ visible }: { visible: boolean }) =>
      visible ? <View testID="add-items-modal" /> : null,
    DeckFormModal: ({ visible }: { visible: boolean }) =>
      visible ? <View testID="deck-form-modal" /> : null,
    DeckItemList: ({
      items,
      onItemPress,
      onAddPress,
    }: {
      items: { id: number; pali: string }[];
      onItemPress: (item: { id: number }) => void;
      onAddPress: () => void;
    }) => (
      <View testID="deck-item-list">
        {items.map((item: { id: number; pali: string }) => (
          <Pressable key={item.id} testID={`item-${item.id}`} onPress={() => onItemPress(item)}>
            <Text>{item.pali}</Text>
          </Pressable>
        ))}
        <Pressable testID="add-items-trigger" onPress={onAddPress}>
          <Text>Add</Text>
        </Pressable>
      </View>
    ),
  };
});

// Mock react-native-gesture-handler
jest.mock("react-native-gesture-handler", () => {
  const { View } = jest.requireActual("react-native");
  return {
    GestureHandlerRootView: ({ children }: { children: React.ReactNode }) => (
      <View>{children}</View>
    ),
  };
});

const mockDeck = {
  id: 2,
  name: "Verbs",
  itemCount: 2,
  createdAt: new Date(),
};

const mockItems = [
  {
    id: 1,
    pali: "gacchati",
    meaning: "goes",
    type: "word",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    pali: "passati",
    meaning: "sees",
    type: "word",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

function TestWrapper({ children }: { children: React.ReactNode }) {
  return <NavigationContainer>{children}</NavigationContainer>;
}

describe("DeckDetailScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetById.mockResolvedValue(mockDeck);
    mockGetItemsInDeck.mockResolvedValue(mockItems);
  });

  it("renders without errors", async () => {
    render(<DeckDetailScreen />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByTestId("deck-detail-screen")).toBeTruthy();
    });
  });

  it("displays the deck name", async () => {
    render(<DeckDetailScreen />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByText("Verbs")).toBeTruthy();
    });
  });

  it("displays the item count", async () => {
    render(<DeckDetailScreen />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByText("2 cards")).toBeTruthy();
    });
  });

  it("displays singular card count correctly", async () => {
    mockGetById.mockResolvedValue({ ...mockDeck, itemCount: 1 });
    render(<DeckDetailScreen />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByText("1 card")).toBeTruthy();
    });
  });

  it("loads deck data on mount", async () => {
    render(<DeckDetailScreen />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(mockGetById).toHaveBeenCalledWith(mockDb, 2);
      expect(mockGetItemsInDeck).toHaveBeenCalledWith(mockDb, 2);
    });
  });

  it("shows the deck item list", async () => {
    render(<DeckDetailScreen />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByTestId("deck-item-list")).toBeTruthy();
    });
  });

  it("shows the edit button for non-default deck", async () => {
    render(<DeckDetailScreen />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByTestId("edit-deck-button")).toBeTruthy();
    });
  });

  it("shows the add items FAB for non-default deck", async () => {
    render(<DeckDetailScreen />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByTestId("add-items-fab")).toBeTruthy();
    });
  });

  it("opens add items modal when FAB is pressed", async () => {
    render(<DeckDetailScreen />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByTestId("add-items-fab")).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId("add-items-fab"));

    await waitFor(() => {
      expect(screen.getByTestId("add-items-modal")).toBeTruthy();
    });
  });

  it("opens edit modal when edit button is pressed", async () => {
    render(<DeckDetailScreen />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByTestId("edit-deck-button")).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId("edit-deck-button"));

    await waitFor(() => {
      expect(screen.getByTestId("deck-form-modal")).toBeTruthy();
    });
  });

  it("navigates to item screen when item is pressed", async () => {
    render(<DeckDetailScreen />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByTestId("item-1")).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId("item-1"));

    expect(mockRouter.push).toHaveBeenCalledWith("/item/1");
  });

  it("navigates back when deck not found", async () => {
    mockGetById.mockResolvedValue(null);
    render(<DeckDetailScreen />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(mockRouter.back).toHaveBeenCalled();
    });
  });

  it("navigates back when loading fails", async () => {
    mockGetById.mockRejectedValue(new Error("Database error"));
    render(<DeckDetailScreen />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(mockRouter.back).toHaveBeenCalled();
    });
  });
});
