import { Pressable, StyleSheet, Text, View } from "react-native";

type DeckEmptyStateProps = {
  isSearching: boolean;
  onCreatePress: () => void;
};

export function DeckEmptyState({ isSearching, onCreatePress }: DeckEmptyStateProps) {
  if (isSearching) {
    return (
      <View style={styles.container} testID="deck-empty-state">
        <Text style={styles.title}>No decks found</Text>
        <Text style={styles.subtitle}>Try a different search term or create a new deck.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container} testID="deck-empty-state">
      <Text style={styles.title}>No custom decks yet</Text>
      <Text style={styles.subtitle}>
        Organize your vocabulary by creating decks for different topics or study goals.
      </Text>
      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        onPress={onCreatePress}
        testID="create-first-deck-button"
      >
        <Text style={styles.buttonText}>Create your first deck</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  button: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonPressed: {
    backgroundColor: "#388E3C",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
