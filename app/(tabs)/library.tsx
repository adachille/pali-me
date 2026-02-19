import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useSQLiteContext, itemRepository, type Item } from "@/db";
import { ItemList } from "@/components/items";

export default function LibraryScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadItems = useCallback(async () => {
    try {
      const result = searchQuery.trim()
        ? await itemRepository.search(db, searchQuery.trim())
        : await itemRepository.getAll(db);
      setItems(result);
    } catch (error) {
      console.error("Failed to load items:", error);
    } finally {
      setIsLoading(false);
    }
  }, [db, searchQuery]);

  // Reload items when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadItems();
    }, [loadItems])
  );

  // Also reload when search query changes
  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleItemPress = useCallback(
    (item: Item) => {
      router.push(`/item/${item.id}` as const);
    },
    [router]
  );

  const handleAddPress = useCallback(() => {
    router.push("/item/add" as const);
  }, [router]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer} testID="library-screen">
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container} testID="library-screen">
      <ItemList
        items={items}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onItemPress={handleItemPress}
        onAddPress={handleAddPress}
      />
      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={handleAddPress}
        testID="add-item-fab"
      >
        <Text style={styles.fabText}>+</Text>
      </Pressable>
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
