import { Suspense } from "react";
import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { View, Text, StyleSheet } from "react-native";
import { migrateDbIfNeeded } from "@/db";

function LoadingView() {
  return (
    <View style={styles.loadingContainer}>
      <Text style={styles.loadingText}>Loading database...</Text>
    </View>
  );
}

export default function RootLayout() {
  return (
    <Suspense fallback={<LoadingView />}>
      <SQLiteProvider databaseName="pali.db" onInit={migrateDbIfNeeded}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="item" options={{ headerShown: false }} />
        </Stack>
      </SQLiteProvider>
    </Suspense>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    fontSize: 16,
    color: "#333",
  },
});
