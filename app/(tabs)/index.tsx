import { DeckList } from "@/components/decks";
import { deckRepository, useSQLiteContext } from "@/db";
import type { DeckWithCount, SortOption } from "@/db/repositories/deckRepository";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const [decks, setDecks] = useState<DeckWithCount[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("name_asc");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const loadDecks = useCallback(async () => {
    try {
      setLoadError(false);
      const result = searchQuery.trim()
        ? await deckRepository.search(db, searchQuery.trim(), sortOption)
        : await deckRepository.getAll(db, sortOption);
      setDecks(result);
    } catch (error) {
      console.error("Failed to load decks:", error);
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  }, [db, searchQuery, sortOption]);

  // Reload decks when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadDecks();
    }, [loadDecks])
  );

  // Also reload when search query or sort option changes
  useEffect(() => {
    loadDecks();
  }, [loadDecks]);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleSortChange = useCallback((sort: SortOption) => {
    setSortOption(sort);
  }, []);

  const handleDeckPress = useCallback(
    (deck: DeckWithCount) => {
      router.push(`/deck/${deck.id}`);
    },
    [router]
  );

  const handleCreatePress = useCallback(() => {
    router.push("/deck/new");
  }, [router]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer} testID="home-screen">
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (loadError) {
    return (
      <View style={styles.errorContainer} testID="home-screen">
        <Text style={styles.errorTitle}>Failed to load decks</Text>
        <Text style={styles.errorSubtitle}>Please try again</Text>
        <Pressable
          style={({ pressed }) => [styles.retryButton, pressed && styles.retryButtonPressed]}
          onPress={loadDecks}
          testID="retry-load-decks"
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container} testID="home-screen">
      <DeckList
        decks={decks}
        searchQuery={searchQuery}
        sortOption={sortOption}
        onSearchChange={handleSearchChange}
        onSortChange={handleSortChange}
        onDeckPress={handleDeckPress}
        onCreatePress={handleCreatePress}
      />
      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={handleCreatePress}
        testID="create-deck-fab"
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 32,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
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
