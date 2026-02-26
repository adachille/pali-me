import { DeckList } from "@/components/decks";
import { deckRepository, useSQLiteContext } from "@/db";
import type { DeckWithCount, SortOption } from "@/db/repositories/deckRepository";
import { useTheme } from "@/theme";
import type { AppColors } from "@/theme";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
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
      router.push(`/study/${deck.id}` as `/study/${string}`);
    },
    [router]
  );

  const handleStudyPress = useCallback(
    (deck: DeckWithCount) => {
      router.push(`/study/${deck.id}` as `/study/${string}`);
    },
    [router]
  );

  const handleEditPress = useCallback(
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
        <ActivityIndicator size="large" color={colors.primary} />
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
        onStudyPress={handleStudyPress}
        onEditPress={handleEditPress}
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
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
      padding: 32,
    },
    errorTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 8,
    },
    errorSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: "center",
      marginBottom: 16,
    },
    retryButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 10,
      borderRadius: 8,
    },
    retryButtonPressed: {
      backgroundColor: colors.primaryDark,
    },
    retryButtonText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.background,
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
