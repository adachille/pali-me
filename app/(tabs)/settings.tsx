import { useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useTheme } from "@/theme";
import type { AppColors, ThemeMode } from "@/theme";

import { exportDatabaseAsJson, importDatabaseFromJson } from "@/db/repositories/exportRepository";

export default function SettingsScreen() {
  const db = useSQLiteContext();
  const { colors, themeMode, setThemeMode } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const themeModes: ThemeMode[] = ["light", "dark", "system"];
  const themeModeLabels: Record<ThemeMode, string> = {
    light: "Light",
    dark: "Dark",
    system: "System",
  };

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

  const handleImport = async () => {
    Alert.alert(
      "Import Data",
      "This will replace all existing data with the imported data. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Import",
          style: "destructive",
          onPress: async () => {
            setIsImporting(true);
            try {
              const result = await importDatabaseFromJson(db);
              if (result) {
                Alert.alert(
                  "Import Successful",
                  `Imported ${result.itemsImported} items, ${result.studyStatesImported} study states, ${result.decksImported} decks.`
                );
              }
            } catch (error) {
              const message = error instanceof Error ? error.message : "Unknown error occurred";
              Alert.alert("Import Failed", message);
            } finally {
              setIsImporting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container} testID="settings-screen">
      <Text style={styles.title}>Settings</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <Text style={styles.sectionDescription}>Choose your preferred color theme.</Text>

        <View style={styles.segmentedControl} testID="theme-toggle-button">
          {themeModes.map((mode, index) => (
            <Pressable
              key={mode}
              style={[
                styles.segment,
                index === themeModes.length - 1 && styles.segmentLast,
                themeMode === mode && styles.segmentSelected,
              ]}
              onPress={() => setThemeMode(mode)}
              testID={`theme-segment-${mode}`}
            >
              <Text style={[styles.segmentText, themeMode === mode && styles.segmentTextSelected]}>
                {themeModeLabels[mode]}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={[styles.section, styles.sectionSpacing]}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        <Text style={styles.sectionDescription}>
          Export or import your flashcards and study progress as a JSON file.
        </Text>

        <View style={styles.buttonRow}>
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
              <Text style={styles.buttonText}>Export</Text>
            )}
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.importButton,
              pressed && styles.importButtonPressed,
              isImporting && styles.buttonDisabled,
            ]}
            onPress={handleImport}
            disabled={isImporting}
            testID="import-button"
          >
            {isImporting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Import</Text>
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function makeStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: colors.background,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 24,
      color: colors.text,
    },
    section: {
      backgroundColor: colors.surface,
      padding: 16,
      borderRadius: 12,
    },
    sectionSpacing: {
      marginTop: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      marginBottom: 8,
      color: colors.text,
    },
    sectionDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 16,
    },
    segmentedControl: {
      flexDirection: "row",
      backgroundColor: colors.surfaceVariant,
      borderRadius: 8,
      padding: 4,
    },
    segment: {
      flex: 1,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 6,
      alignItems: "center",
      borderRightWidth: 1,
      borderRightColor: colors.border,
    },
    segmentLast: {
      borderRightWidth: 0,
    },
    segmentSelected: {
      backgroundColor: colors.primary,
    },
    segmentText: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.textSecondary,
    },
    segmentTextSelected: {
      color: "#fff",
      fontWeight: "600",
    },
    buttonRow: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    button: {
      flex: 1,
      backgroundColor: colors.primary,
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 8,
      alignItems: "center",
      marginHorizontal: 4,
    },
    buttonPressed: {
      backgroundColor: colors.primaryDark,
    },
    importButton: {
      backgroundColor: colors.secondary,
    },
    importButtonPressed: {
      backgroundColor: colors.secondaryDark,
    },
    buttonDisabled: {
      backgroundColor: colors.textTertiary,
    },
    buttonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "600",
    },
  });
}
