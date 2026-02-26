import { Suspense, useMemo } from "react";
import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { View, Text, StyleSheet } from "react-native";
import { migrateDbIfNeeded } from "@/db";
import { useTheme } from "@/theme";
import type { AppColors } from "@/theme";

function LoadingView() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
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
          <Stack.Screen name="item" />
          <Stack.Screen name="deck" />
        </Stack>
      </SQLiteProvider>
    </Suspense>
  );
}

function makeStyles(colors: AppColors) {
  return StyleSheet.create({
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
    },
    loadingText: {
      fontSize: 16,
      color: colors.text,
    },
  });
}
