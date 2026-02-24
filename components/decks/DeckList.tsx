import { useCallback } from "react";
import { FlatList, StyleSheet, TextInput, View, type ListRenderItem } from "react-native";
import type { DeckWithCount, SortOption } from "@/db/repositories/deckRepository";
import { DeckCard } from "./DeckCard";
import { DeckEmptyState } from "./DeckEmptyState";
import { DeckSortPicker } from "./DeckSortPicker";

type DeckListProps = {
  decks: DeckWithCount[];
  searchQuery: string;
  sortOption: SortOption;
  onSearchChange: (query: string) => void;
  onSortChange: (sort: SortOption) => void;
  onDeckPress: (deck: DeckWithCount) => void;
  onCreatePress: () => void;
};

export function DeckList({
  decks,
  searchQuery,
  sortOption,
  onSearchChange,
  onSortChange,
  onDeckPress,
  onCreatePress,
}: DeckListProps) {
  const renderItem: ListRenderItem<DeckWithCount> = useCallback(
    ({ item }) => <DeckCard deck={item} onPress={onDeckPress} />,
    [onDeckPress]
  );

  const keyExtractor = useCallback((item: DeckWithCount) => String(item.id), []);

  const isSearching = searchQuery.trim().length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search decks..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={onSearchChange}
            autoCapitalize="none"
            autoCorrect={false}
            testID="deck-search-input"
          />
        </View>
        <DeckSortPicker value={sortOption} onChange={onSortChange} />
      </View>
      <FlatList
        data={decks}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={decks.length === 0 ? styles.emptyContainer : undefined}
        ListEmptyComponent={
          <DeckEmptyState isSearching={isSearching} onCreatePress={onCreatePress} />
        }
        testID="deck-list"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f5f5f5",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    gap: 12,
  },
  searchContainer: {
    flex: 1,
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
  emptyContainer: {
    flex: 1,
  },
});
