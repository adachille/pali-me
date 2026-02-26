import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme";
import type { AppColors } from "@/theme";

type EmptyStateProps = {
  onAddPress: () => void;
  isSearching?: boolean;
};

export function EmptyState({ onAddPress, isSearching = false }: EmptyStateProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

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

function makeStyles(colors: AppColors) {
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
      color: colors.text,
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
      backgroundColor: colors.primaryDark,
    },
    buttonText: {
      color: colors.background,
      fontSize: 16,
      fontWeight: "600",
    },
  });
}
