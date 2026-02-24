import { AddItemsModal, DeckFormModal, DeckItemList } from "@/components/decks";
import { DEFAULT_DECK_ID, deckRepository, useSQLiteContext, type Item } from "@/db";
import type { DeckWithCount } from "@/db/repositories/deckRepository";
import { useFocusEffect } from "@react-navigation/native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function DeckDetailScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [deck, setDeck] = useState<DeckWithCount | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [addItemsModalVisible, setAddItemsModalVisible] = useState(false);

  const loadDeck = useCallback(async () => {
    if (!id) return;

    try {
      const deckId = parseInt(id, 10);
      if (isNaN(deckId)) {
        router.back();
        return;
      }

      const result = await deckRepository.getById(db, deckId);
      if (!result) {
        router.back();
        return;
      }

      setDeck(result);

      const deckItems = await deckRepository.getItemsInDeck(db, deckId);
      setItems(deckItems);
    } catch (error) {
      console.error("Failed to load deck:", error);
      Alert.alert("Error", "Failed to load deck. Returning to deck list.");
      router.back();
    } finally {
      setIsLoading(false);
    }
  }, [db, id, router]);

  useFocusEffect(
    useCallback(() => {
      loadDeck();
    }, [loadDeck])
  );

  const handleDelete = () => {
    if (!deck || deck.id === DEFAULT_DECK_ID) return;

    Alert.alert("Delete Deck", "Delete this deck? Cards will remain in your library.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deckRepository.deleteDeck(db, deck.id);
            router.back();
          } catch (error) {
            console.error("Failed to delete deck:", error);
            Alert.alert("Error", "Failed to delete deck. Please try again.");
          }
        },
      },
    ]);
  };

  const handleItemPress = useCallback(
    (item: Item) => {
      router.push(`/item/${item.id}` as const);
    },
    [router]
  );

  const handleRemoveItem = useCallback(
    async (item: Item) => {
      if (!deck) return;
      await deckRepository.removeItemFromDeck(db, deck.id, item.id);
      loadDeck();
    },
    [db, deck, loadDeck]
  );

  const handleAddItemsPress = useCallback(() => {
    setAddItemsModalVisible(true);
  }, []);

  const isDefaultDeck = deck?.id === DEFAULT_DECK_ID;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer} testID="deck-detail-screen">
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (!deck) {
    return (
      <View style={styles.errorContainer} testID="deck-detail-screen">
        <Text style={styles.errorText}>Deck not found</Text>
      </View>
    );
  }

  const itemCountText = deck.itemCount === 1 ? "1 card" : `${deck.itemCount} cards`;

  return (
    <View style={styles.container} testID="deck-detail-screen">
      <Stack.Screen options={{ title: deck.name }} />
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>{deck.name}</Text>
          {!isDefaultDeck && (
            <Pressable
              style={({ pressed }) => [styles.editButton, pressed && styles.editButtonPressed]}
              onPress={() => setEditModalVisible(true)}
              testID="edit-deck-button"
            >
              <Text style={styles.editButtonText}>✏️</Text>
            </Pressable>
          )}
        </View>
        <Text style={styles.itemCount}>{itemCountText}</Text>
      </View>

      <GestureHandlerRootView style={styles.listContainer}>
        <DeckItemList
          items={items}
          onItemPress={handleItemPress}
          onRemoveItem={handleRemoveItem}
          onAddPress={handleAddItemsPress}
          isDefaultDeck={isDefaultDeck}
        />
      </GestureHandlerRootView>

      {!isDefaultDeck && (
        <Pressable
          style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
          onPress={handleAddItemsPress}
          testID="add-items-fab"
        >
          <Text style={styles.fabText}>+</Text>
        </Pressable>
      )}

      <DeckFormModal
        visible={editModalVisible}
        initialName={deck.name}
        deckId={deck.id}
        onSave={loadDeck}
        onClose={() => setEditModalVisible(false)}
        onDelete={handleDelete}
      />

      <AddItemsModal
        visible={addItemsModalVisible}
        deckId={deck.id}
        onClose={() => setAddItemsModalVisible(false)}
        onItemsAdded={loadDeck}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  errorText: {
    fontSize: 16,
    color: "#666",
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  editButton: {
    padding: 8,
  },
  editButtonPressed: {
    opacity: 0.7,
  },
  editButtonText: {
    fontSize: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  itemCount: {
    fontSize: 16,
    color: "#666",
  },
  listContainer: {
    flex: 1,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabPressed: {
    backgroundColor: "#388E3C",
  },
  fabText: {
    fontSize: 28,
    color: "#fff",
    fontWeight: "300",
    marginTop: -2,
  },
});
