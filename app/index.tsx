import { Text, View, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import { useSQLiteContext, type DeckRow } from "@/db";

export default function Index() {
  const db = useSQLiteContext();
  const [dbStatus, setDbStatus] = useState<string>("Checking database...");
  const [defaultDeck, setDefaultDeck] = useState<DeckRow | null>(null);

  useEffect(() => {
    async function checkDatabase() {
      try {
        // Check tables exist
        const tables = await db.getAllAsync<{ name: string }>(
          "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
        );

        // Get default deck
        const deck = await db.getFirstAsync<DeckRow>(
          "SELECT * FROM decks WHERE id = 'all'"
        );

        setDefaultDeck(deck);
        setDbStatus(`Database initialized successfully!\nTables: ${tables.map((t) => t.name).join(", ")}`);
      } catch (error) {
        setDbStatus(`Database error: ${error}`);
      }
    }

    checkDatabase();
  }, [db]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pali Learning App</Text>
      <Text style={styles.status}>{dbStatus}</Text>
      {defaultDeck && (
        <View style={styles.deckInfo}>
          <Text style={styles.subtitle}>Default Deck:</Text>
          <Text>ID: {defaultDeck.id}</Text>
          <Text>Name: {defaultDeck.name}</Text>
          <Text>Created: {defaultDeck.created_at}</Text>
        </View>
      )}
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
    marginBottom: 20,
  },
  status: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  deckInfo: {
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
});
