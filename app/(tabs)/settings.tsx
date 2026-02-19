import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useSQLiteContext } from "expo-sqlite";

import { exportDatabaseAsJson } from "@/db/repositories/exportRepository";

export default function SettingsScreen() {
  const db = useSQLiteContext();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportDatabaseAsJson(db);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error occurred";
      Alert.alert("Export Failed", message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <View style={styles.container} testID="settings-screen">
      <Text style={styles.title}>Settings</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        <Text style={styles.sectionDescription}>
          Export your flashcards and study progress as a JSON file.
        </Text>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
            isExporting && styles.buttonDisabled,
          ]}
          onPress={handleExport}
          disabled={isExporting}
          testID="export-button"
        >
          {isExporting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Export Data as JSON</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
  },
  section: {
    backgroundColor: "#f5f5f5",
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#4CAF50",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonPressed: {
    backgroundColor: "#388E3C",
  },
  buttonDisabled: {
    backgroundColor: "#9E9E9E",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
