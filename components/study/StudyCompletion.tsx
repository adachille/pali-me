import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme";
import type { AppColors } from "@/theme";

type StudyCompletionProps = {
  totalCards: number;
  correctCount: number;
  onBackToHome: () => void;
};

/**
 * Session completion screen with summary statistics.
 */
export function StudyCompletion({ totalCards, correctCount, onBackToHome }: StudyCompletionProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const accuracy = totalCards > 0 ? Math.round((correctCount / totalCards) * 100) : 0;

  return (
    <View style={styles.container} testID="study-completion">
      <View style={styles.content}>
        <Text style={styles.emoji}>🎉</Text>
        <Text style={styles.title}>Great job!</Text>
        <Text style={styles.subtitle}>You&apos;ve completed this study session.</Text>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalCards}</Text>
            <Text style={styles.statLabel}>Cards Studied</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{accuracy}%</Text>
            <Text style={styles.statLabel}>Accuracy</Text>
          </View>
        </View>

        <View style={styles.breakdown}>
          <Text style={styles.breakdownText}>
            ✓ {correctCount} correct · ✗ {totalCards - correctCount} incorrect
          </Text>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        onPress={onBackToHome}
        testID="completion-back-home"
      >
        <Text style={styles.buttonText}>Back to Home</Text>
      </Pressable>
    </View>
  );
}

function makeStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      padding: 24,
      justifyContent: "center",
    },
    content: {
      alignItems: "center",
      marginBottom: 32,
    },
    emoji: {
      fontSize: 64,
      marginBottom: 16,
    },
    title: {
      fontSize: 28,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: "center",
      marginBottom: 32,
    },
    statsContainer: {
      flexDirection: "row",
      backgroundColor: colors.background,
      borderRadius: 16,
      padding: 24,
      marginBottom: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    statItem: {
      flex: 1,
      alignItems: "center",
    },
    statValue: {
      fontSize: 36,
      fontWeight: "700",
      color: colors.primary,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    divider: {
      width: 1,
      backgroundColor: colors.border,
      marginHorizontal: 16,
    },
    breakdown: {
      paddingVertical: 8,
    },
    breakdownText: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    button: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: "center",
      marginHorizontal: 16,
    },
    buttonPressed: {
      opacity: 0.8,
    },
    buttonText: {
      fontSize: 18,
      fontWeight: "600",
      color: "#fff",
    },
  });
}
