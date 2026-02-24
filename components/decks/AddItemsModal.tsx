import { deckRepository, useSQLiteContext, type Item } from "@/db";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ListRenderItem,
} from "react-native";

type AddItemsModalProps = {
  visible: boolean;
  deckId: number;
  onClose: () => void;
  onItemsAdded: () => void;
};

const TYPE_COLORS: Record<string, string> = {
  word: "#4CAF50",
  prefix: "#2196F3",
  suffix: "#9C27B0",
  root: "#FF9800",
  particle: "#607D8B",
};

function SelectableItemCard({
  item,
  isSelected,
  onToggle,
}: {
  item: Item;
  isSelected: boolean;
  onToggle: (item: Item) => void;
}) {
  const badgeColor = TYPE_COLORS[item.type] ?? "#999";

  return (
    <Pressable
      style={({ pressed }) => [
        styles.itemCard,
        isSelected && styles.itemCardSelected,
        pressed && styles.itemCardPressed,
      ]}
      onPress={() => onToggle(item)}
      testID={`selectable-item-${item.id}`}
    >
      <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
        {isSelected && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <View style={styles.itemContent}>
        <Text style={styles.pali}>{item.pali}</Text>
        <Text style={styles.meaning} numberOfLines={1}>
          {item.meaning}
        </Text>
      </View>
      <View style={[styles.badge, { backgroundColor: badgeColor }]}>
        <Text style={styles.badgeText}>{item.type}</Text>
      </View>
    </Pressable>
  );
}

export function AddItemsModal({ visible, deckId, onClose, onItemsAdded }: AddItemsModalProps) {
  const db = useSQLiteContext();
  const [availableItems, setAvailableItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const loadAvailableItems = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadError(false);
      const items = await deckRepository.getItemsNotInDeck(db, deckId);
      setAvailableItems(items);
      setFilteredItems(items);
    } catch (error) {
      console.error("Failed to load available items:", error);
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  }, [db, deckId]);

  useEffect(() => {
    if (visible) {
      loadAvailableItems();
      setSelectedIds(new Set());
      setSearchQuery("");
    }
  }, [visible, loadAvailableItems]);

  useEffect(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      setFilteredItems(availableItems);
    } else {
      setFilteredItems(
        availableItems.filter(
          (item) =>
            item.pali.toLowerCase().includes(query) || item.meaning.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, availableItems]);

  const toggleItem = useCallback((item: Item) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(item.id)) {
        next.delete(item.id);
      } else {
        next.add(item.id);
      }
      return next;
    });
  }, []);

  const handleAddSelected = async () => {
    if (selectedIds.size === 0) return;

    setIsSaving(true);
    try {
      await deckRepository.addItemsToDeck(db, deckId, Array.from(selectedIds));
      onItemsAdded();
      onClose();
    } catch (error) {
      console.error("Failed to add items:", error);
      Alert.alert("Error", "Failed to add items. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const renderItem: ListRenderItem<Item> = useCallback(
    ({ item }) => (
      <SelectableItemCard item={item} isSelected={selectedIds.has(item.id)} onToggle={toggleItem} />
    ),
    [selectedIds, toggleItem]
  );

  const keyExtractor = useCallback((item: Item) => String(item.id), []);

  const selectedCount = selectedIds.size;
  const addButtonText = selectedCount > 0 ? `Add Selected (${selectedCount})` : "Add Selected";

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container} testID="add-items-modal">
        <View style={styles.header}>
          <Text style={styles.title}>Add Cards to Deck</Text>
          <Pressable
            style={({ pressed }) => [styles.closeButton, pressed && styles.closeButtonPressed]}
            onPress={onClose}
            testID="close-add-items-modal"
          >
            <Text style={styles.closeButtonText}>Cancel</Text>
          </Pressable>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search cards..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
            testID="add-items-search"
          />
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
          </View>
        ) : loadError ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Failed to load items</Text>
            <Text style={styles.emptySubtitle}>Please try again</Text>
            <Pressable
              style={({ pressed }) => [styles.retryButton, pressed && styles.retryButtonPressed]}
              onPress={loadAvailableItems}
              testID="retry-load-items"
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </Pressable>
          </View>
        ) : filteredItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>
              {searchQuery.trim() ? "No matching cards" : "All cards already in deck"}
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery.trim()
                ? "Try a different search term"
                : "Add more cards to your library first"}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredItems}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            testID="available-items-list"
          />
        )}

        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [
              styles.addButton,
              selectedCount === 0 && styles.addButtonDisabled,
              pressed && selectedCount > 0 && styles.addButtonPressed,
            ]}
            onPress={handleAddSelected}
            disabled={selectedCount === 0 || isSaving}
            testID="add-selected-button"
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text
                style={[styles.addButtonText, selectedCount === 0 && styles.addButtonTextDisabled]}
              >
                {addButtonText}
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    paddingTop: 60,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  closeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  closeButtonPressed: {
    opacity: 0.7,
  },
  closeButtonText: {
    fontSize: 16,
    color: "#4CAF50",
    fontWeight: "500",
  },
  searchContainer: {
    padding: 12,
    backgroundColor: "#f5f5f5",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  searchInput: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  itemCardSelected: {
    backgroundColor: "#E8F5E9",
  },
  itemCardPressed: {
    backgroundColor: "#f5f5f5",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#ccc",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxSelected: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  checkmark: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  itemContent: {
    flex: 1,
    marginRight: 12,
  },
  pali: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  meaning: {
    fontSize: 13,
    color: "#666",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 11,
    color: "#fff",
    fontWeight: "500",
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingBottom: 32,
  },
  addButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonDisabled: {
    backgroundColor: "#e0e0e0",
  },
  addButtonPressed: {
    backgroundColor: "#388E3C",
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  addButtonTextDisabled: {
    color: "#999",
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: "#4CAF50",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonPressed: {
    backgroundColor: "#388E3C",
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
});
