import { ItemList } from "@/components/items";
import { itemRepository, useSQLiteContext, type Item } from "@/db";
import { useTheme } from "@/theme";
import type { AppColors } from "@/theme";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

export default function LibraryScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
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
        <ActivityIndicator size="large" color={colors.primary} />
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

function makeStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
    },
    fab: {
      position: "absolute",
      right: 20,
      bottom: 20,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
      elevation: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
    },
    fabPressed: {
      backgroundColor: colors.primaryDark,
    },
    fabText: {
      fontSize: 28,
      color: colors.background,
      fontWeight: "300",
      marginTop: -2,
    },
  });
}
