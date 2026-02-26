import type { DeckStudyDirection } from "@/db/types";
import { useTheme } from "@/theme";
import type { AppColors } from "@/theme";
import { useMemo } from "react";
import { Modal, Pressable, StyleSheet, Switch, Text, View } from "react-native";

type StudySettingsModalProps = {
  visible: boolean;
  direction: DeckStudyDirection;
  endlessMode: boolean;
  onDirectionChange: (direction: DeckStudyDirection) => void;
  onEndlessModeChange: (enabled: boolean) => void;
  onClose: () => void;
};

const DIRECTION_OPTIONS: { value: DeckStudyDirection; label: string; description: string }[] = [
  { value: "pali_first", label: "Pali First", description: "Show Pali, guess meaning" },
  { value: "meaning_first", label: "Meaning First", description: "Show meaning, guess Pali" },
  { value: "random", label: "Random", description: "Mix both directions" },
];

/**
 * Modal for configuring study session settings.
 * Allows changing study direction and toggling endless mode.
 */
export function StudySettingsModal({
  visible,
  direction,
  endlessMode,
  onDirectionChange,
  onEndlessModeChange,
  onClose,
}: StudySettingsModalProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.overlayBackground} onPress={onClose} />
        <View style={styles.modalContent} testID="study-settings-modal">
          <Text style={styles.modalTitle}>Study Settings</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Study Direction</Text>
            {DIRECTION_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                style={({ pressed }) => [
                  styles.optionRow,
                  direction === option.value && styles.optionRowSelected,
                  pressed && styles.optionRowPressed,
                ]}
                onPress={() => onDirectionChange(option.value)}
                testID={`direction-${option.value}`}
              >
                <View style={styles.optionContent}>
                  <Text style={styles.optionLabel}>{option.label}</Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                </View>
                <View style={[styles.radio, direction === option.value && styles.radioSelected]}>
                  {direction === option.value && <View style={styles.radioInner} />}
                </View>
              </Pressable>
            ))}
          </View>

          <View style={styles.section}>
            <View style={styles.toggleRow}>
              <View style={styles.toggleContent}>
                <Text style={styles.sectionTitle}>Endless Mode</Text>
                <Text style={styles.toggleDescription}>
                  Ignore intervals and study continuously
                </Text>
              </View>
              <Switch
                value={endlessMode}
                onValueChange={onEndlessModeChange}
                trackColor={{ false: colors.border, true: colors.primaryLight }}
                thumbColor={endlessMode ? colors.primary : colors.surfaceVariant}
                testID="endless-mode-toggle"
              />
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [styles.closeButton, pressed && styles.closeButtonPressed]}
            onPress={onClose}
            testID="settings-close"
          >
            <Text style={styles.closeButtonText}>Done</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function makeStyles(colors: AppColors) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    overlayBackground: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
      backgroundColor: colors.background,
      borderRadius: 16,
      width: "85%",
      maxWidth: 400,
      padding: 24,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 20,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 12,
    },
    optionRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderRadius: 8,
      marginBottom: 4,
    },
    optionRowSelected: {
      backgroundColor: colors.primarySurface,
    },
    optionRowPressed: {
      backgroundColor: colors.surface,
    },
    optionContent: {
      flex: 1,
    },
    optionLabel: {
      fontSize: 16,
      fontWeight: "500",
      color: colors.text,
    },
    optionDescription: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 2,
    },
    radio: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: colors.borderSubtle,
      alignItems: "center",
      justifyContent: "center",
    },
    radioSelected: {
      borderColor: colors.primary,
    },
    radioInner: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.primary,
    },
    toggleRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 8,
    },
    toggleContent: {
      flex: 1,
    },
    toggleDescription: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 2,
    },
    closeButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: "center",
    },
    closeButtonPressed: {
      opacity: 0.8,
    },
    closeButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.background,
    },
  });
}
