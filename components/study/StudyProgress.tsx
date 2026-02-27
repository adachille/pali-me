import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme";
import type { AppColors } from "@/theme";

type StudyProgressProps = {
  current: number;
  total: number;
  endlessMode?: boolean;
};

/**
 * Displays study progress indicator (e.g., "3 / 12").
 * Shows infinity symbol in endless mode.
 */
export function StudyProgress({ current, total, endlessMode }: StudyProgressProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const progressText = endlessMode ? `${current} / ∞` : `${current} / ${total}`;

  const progressPercent = endlessMode ? 0 : Math.min((current / total) * 100, 100);

  return (
    <View style={styles.container} testID="study-progress">
      <Text style={styles.text}>{progressText}</Text>
      {!endlessMode && (
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
        </View>
      )}
    </View>
  );
}

function makeStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      alignItems: "center",
      gap: 4,
    },
    text: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.textSecondary,
    },
    progressBar: {
      width: 80,
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      backgroundColor: colors.primary,
      borderRadius: 2,
    },
  });
}
