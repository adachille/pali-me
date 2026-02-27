import { Suspense, useMemo } from "react";
import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { StatusBar } from "expo-status-bar";
import { View, Text, StyleSheet } from "react-native";
import { migrateDbIfNeeded } from "@/db";
import { useTheme, ThemeProvider } from "@/theme";
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

function RootLayoutContent() {
  const { colorScheme } = useTheme();
  return (
    <>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <Suspense fallback={<LoadingView />}>
        <SQLiteProvider databaseName="pali.db" onInit={migrateDbIfNeeded}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="item" />
            <Stack.Screen name="deck" />
          </Stack>
        </SQLiteProvider>
      </Suspense>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutContent />
    </ThemeProvider>
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
