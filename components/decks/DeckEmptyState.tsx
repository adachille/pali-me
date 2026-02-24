import type { ThemeColors } from "@/constants/theme";
import { useThemeColors } from "@/hooks/useThemeColors";
import { Pressable, StyleSheet, Text, View } from "react-native";

type DeckEmptyStateProps = {
  isSearching: boolean;
  onCreatePress: () => void;
};

export function DeckEmptyState({ isSearching, onCreatePress }: DeckEmptyStateProps) {
  const colors = useThemeColors();
  const styles = createStyles(colors);

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

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 32,
    },
    title: {
      fontSize: 20,
      fontWeight: "600",
      color: colors.textPrimary,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: "center",
      marginBottom: 24,
      lineHeight: 24,
    },
    button: {
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
    },
    buttonPressed: {
      backgroundColor: colors.primaryPressed,
    },
    buttonText: {
      color: colors.textOnPrimary,
      fontSize: 16,
      fontWeight: "600",
    },
  });
}
