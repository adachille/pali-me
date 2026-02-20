import { deckRepository, useSQLiteContext } from "@/db";
import type { DeckWithCount } from "@/db/repositories/deckRepository";
import { useFocusEffect } from "@react-navigation/native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function DeckDetailScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [deck, setDeck] = useState<DeckWithCount | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
    } catch (error) {
      console.error("Failed to load deck:", error);
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

  const itemCountText = deck.itemCount === 1 ? "1 item" : `${deck.itemCount} items`;

  return (
    <View style={styles.container} testID="deck-detail-screen">
      <Stack.Screen options={{ title: deck.name }} />
      <View style={styles.header}>
        <Text style={styles.title}>{deck.name}</Text>
        <Text style={styles.itemCount}>{itemCountText}</Text>
      </View>
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>Deck items will appear here</Text>
        <Text style={styles.placeholderSubtext}>Full implementation in Phase 5</Text>
      </View>
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  itemCount: {
    fontSize: 16,
    color: "#666",
  },
  placeholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  placeholderText: {
    fontSize: 18,
    color: "#999",
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: "#bbb",
  },
});
