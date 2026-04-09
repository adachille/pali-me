import { Icon } from "@/src/components/common/Icon";
import type { AppColors, ThemeMode } from "@/src/theme";
import { useTheme } from "@/src/theme";
import { showAlert, showConfirm } from "@/src/utils/alert";
import { useSQLiteContext } from "expo-sqlite";
import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import {
  exportDatabaseAsJson,
  importDatabaseFromJson,
} from "@/src/db/repositories/exportRepository";

export default function SettingsScreen() {
  const db = useSQLiteContext();
  const { colors, themeMode, setThemeMode } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const themeModes: ThemeMode[] = ["light", "dark", "system"];

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportDatabaseAsJson(db);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error occurred";
      showAlert("Export Failed", message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    const confirmed = await showConfirm(
      "Import Data",
      "This will replace all existing data with the imported data. Are you sure?",
      "Import",
      "destructive"
    );
    if (!confirmed) return;

    setIsImporting(true);
    try {
      const result = await importDatabaseFromJson(db);
      if (result) {
        showAlert(
          "Import Successful",
          `Imported ${result.itemsImported} items, ${result.studyStatesImported} study states, ${result.decksImported} decks.`
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error occurred";
      showAlert("Import Failed", message);
    } finally {
      setIsImporting(false);
    }
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
                index === 0 && styles.segmentFirst,
                index > 0 && index < themeModes.length - 1 && styles.segmentMiddle,
                index === themeModes.length - 1 && styles.segmentLast,
                themeMode === mode && styles.segmentSelected,
              ]}
              onPress={() => setThemeMode(mode)}
              testID={`theme-segment-${mode}`}
            >
              {mode === "light" && (
                <Icon
                  name="lotus-sun"
                  size={25}
                  color={themeMode === mode ? "#fff" : colors.textSecondary}
                />
              )}
              {mode === "dark" && (
                <Icon
                  name="moon-and-clouds"
                  size={25}
                  color={themeMode === mode ? "#fff" : colors.textSecondary}
                />
              )}
              {mode === "system" && (
                <Icon
                  name="auto-theme-icon"
                  size={25}
                  color={themeMode === mode ? "#fff" : colors.textSecondary}
                />
              )}
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
    },
    segment: {
      flex: 1,
      paddingVertical: 10,
      paddingHorizontal: 12,
      gap: 4,
      alignItems: "center",
      borderRightWidth: 1,
      borderRightColor: colors.border,
    },
    segmentFirst: {
      borderTopLeftRadius: 6,
      borderBottomLeftRadius: 6,
    },
    segmentMiddle: {
      borderRadius: 0,
    },
    segmentLast: {
      borderRightWidth: 0,
      borderTopRightRadius: 6,
      borderBottomRightRadius: 6,
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
      backgroundColor: colors.primaryAlpha25,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    importButtonPressed: {
      backgroundColor: colors.primaryDarkAlpha25,
      borderWidth: 1,
      borderColor: colors.primaryDark,
    },
    buttonDisabled: {
      backgroundColor: colors.textTertiary,
      borderWidth: 1,
      borderColor: colors.textTertiary,
    },
    buttonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "600",
    },
  });
}
