import { useCallback } from "react";
import { FlatList, StyleSheet, TextInput, View, type ListRenderItem } from "react-native";
import type { Item } from "@/db";
import { ItemCard } from "./ItemCard";
import { EmptyState } from "./EmptyState";

type ItemListProps = {
  items: Item[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onItemPress: (item: Item) => void;
  onAddPress: () => void;
};

export function ItemList({
  items,
  searchQuery,
  onSearchChange,
  onItemPress,
  onAddPress,
}: ItemListProps) {
  const renderItem: ListRenderItem<Item> = useCallback(
    ({ item }) => <ItemCard item={item} onPress={onItemPress} />,
    [onItemPress]
  );

  const keyExtractor = useCallback((item: Item) => String(item.id), []);

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by Pali or meaning..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={onSearchChange}
          autoCapitalize="none"
          autoCorrect={false}
          testID="search-input"
        />
      </View>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={items.length === 0 ? styles.emptyContainer : undefined}
        ListEmptyComponent={<EmptyState onAddPress={onAddPress} />}
        testID="item-list"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
  emptyContainer: {
    flex: 1,
  },
});
