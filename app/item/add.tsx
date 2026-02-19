import { StyleSheet, Text, View } from "react-native";

export default function AddItemScreen() {
  return (
    <View style={styles.container} testID="add-item-screen">
      <Text style={styles.title}>Add Item</Text>
      <Text style={styles.subtitle}>Form will be implemented in Phase 4</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});
