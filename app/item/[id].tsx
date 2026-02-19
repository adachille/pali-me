import { StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function EditItemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={styles.container} testID="edit-item-screen">
      <Text style={styles.title}>Edit Item</Text>
      <Text style={styles.subtitle}>Editing item {id}</Text>
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
