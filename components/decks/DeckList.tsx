import { useCallback, useMemo } from "react";
import { FlatList, StyleSheet, TextInput, View, type ListRenderItem } from "react-native";
import type { DeckWithCount, SortOption } from "@/db/repositories/deckRepository";
import { useTheme } from "@/theme";
import type { AppColors } from "@/theme";
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
  onStudyPress?: (deck: DeckWithCount) => void;
  onEditPress?: (deck: DeckWithCount) => void;
  onCreatePress: () => void;
};

export function DeckList({
  decks,
  searchQuery,
  sortOption,
  onSearchChange,
  onSortChange,
  onDeckPress,
  onStudyPress,
  onEditPress,
  onCreatePress,
}: DeckListProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const renderItem: ListRenderItem<DeckWithCount> = useCallback(
    ({ item }) => (
      <DeckCard
        deck={item}
        onPress={onDeckPress}
        onStudyPress={onStudyPress}
        onEditPress={onEditPress}
      />
    ),
    [onDeckPress, onStudyPress, onEditPress]
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
            placeholderTextColor={colors.placeholder}
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

function makeStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      padding: 12,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: 12,
    },
    searchContainer: {
      flex: 1,
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
