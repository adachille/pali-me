import { Pressable, StyleSheet, Text, View } from "react-native";

type EmptyStateProps = {
  onAddPress: () => void;
};

export function EmptyState({ onAddPress }: EmptyStateProps) {
  return (
    <View style={styles.container} testID="empty-state">
      <Text style={styles.title}>No items yet</Text>
      <Text style={styles.subtitle}>
        Start building your Pali vocabulary library by adding your first item.
      </Text>
      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        onPress={onAddPress}
        testID="add-first-item-button"
      >
        <Text style={styles.buttonText}>Add your first item</Text>
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
