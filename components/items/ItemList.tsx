import { useCallback, useMemo } from "react";
import { FlatList, StyleSheet, TextInput, View, type ListRenderItem } from "react-native";
import type { Item } from "@/db";
import { useTheme } from "@/theme";
import type { AppColors } from "@/theme";
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
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const renderItem: ListRenderItem<Item> = useCallback(
    ({ item }) => <ItemCard item={item} onPress={onItemPress} />,
    [onItemPress]
  );

  const keyExtractor = useCallback((item: Item) => String(item.id), []);

  const isSearching = searchQuery.trim().length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by Pali or meaning..."
          placeholderTextColor={colors.placeholder}
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
        ListEmptyComponent={<EmptyState onAddPress={onAddPress} isSearching={isSearching} />}
        testID="item-list"
      />
    </View>
  );
}

function makeStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    searchContainer: {
      padding: 12,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    searchInput: {
      backgroundColor: colors.background,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 8,
      fontSize: 16,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
    },
    emptyContainer: {
      flex: 1,
    },
  });
}
