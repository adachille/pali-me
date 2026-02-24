import type { ThemeColors } from "@/constants/theme";
import { useThemeColors } from "@/hooks/useThemeColors";
import { Pressable, StyleSheet, Text, View } from "react-native";

type EmptyStateProps = {
  onAddPress: () => void;
  isSearching?: boolean;
};

export function EmptyState({ onAddPress, isSearching = false }: EmptyStateProps) {
  const colors = useThemeColors();
  const styles = createStyles(colors);

  if (isSearching) {
    return (
      <View style={styles.container} testID="empty-state">
        <Text style={styles.title}>No flash cards found</Text>
        <Text style={styles.subtitle}>Try a different search term or add a new flash card.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container} testID="empty-state">
      <Text style={styles.title}>No flash cards yet</Text>
      <Text style={styles.subtitle}>
        Start building your Pali vocabulary library by adding your first flash card.
      </Text>
      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        onPress={onAddPress}
        testID="add-first-item-button"
      >
        <Text style={styles.buttonText}>Add your first flash card</Text>
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
