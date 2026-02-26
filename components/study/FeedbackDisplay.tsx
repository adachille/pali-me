import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme";
import type { AppColors } from "@/theme";

type FeedbackDisplayProps = {
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  onMarkCorrect: () => void;
  onNext: () => void;
};

/**
 * Displays feedback after answer submission.
 * Shows correct/incorrect status and allows override for incorrect answers.
 */
export function FeedbackDisplay({
  userAnswer,
  correctAnswer,
  isCorrect,
  onMarkCorrect,
  onNext,
}: FeedbackDisplayProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.container} testID="feedback-display">
      <View style={[styles.resultBadge, isCorrect ? styles.correctBadge : styles.incorrectBadge]}>
        <Text style={styles.resultIcon}>{isCorrect ? "✓" : "✗"}</Text>
        <Text style={styles.resultText}>{isCorrect ? "Correct!" : "Incorrect"}</Text>
      </View>

      <View style={styles.answersContainer}>
        <View style={styles.answerRow}>
          <Text style={styles.answerLabel}>Your answer:</Text>
          <Text
            style={[styles.answerText, isCorrect ? styles.correctText : styles.incorrectText]}
            testID="feedback-user-answer"
          >
            {userAnswer}
          </Text>
        </View>

        {!isCorrect && (
          <View style={styles.answerRow}>
            <Text style={styles.answerLabel}>Correct answer:</Text>
            <Text style={styles.correctAnswerText} testID="feedback-correct-answer">
              {correctAnswer}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.buttons}>
        {!isCorrect && (
          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.markCorrectButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={onMarkCorrect}
            testID="feedback-mark-correct"
          >
            <Text style={styles.markCorrectText}>Mark as Correct</Text>
          </Pressable>
        )}
        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.nextButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={onNext}
          testID="feedback-next"
        >
          <Text style={styles.nextButtonText}>Next Card</Text>
        </Pressable>
      </View>
    </View>
  );
}

function makeStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      paddingHorizontal: 16,
      paddingVertical: 16,
      gap: 16,
    },
    resultBadge: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 12,
      gap: 8,
    },
    correctBadge: {
      backgroundColor: colors.primarySurface,
    },
    incorrectBadge: {
      backgroundColor: colors.errorSurface,
    },
    resultIcon: {
      fontSize: 24,
      fontWeight: "bold",
    },
    resultText: {
      fontSize: 20,
      fontWeight: "600",
    },
    answersContainer: {
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: 16,
      gap: 12,
    },
    answerRow: {
      gap: 4,
    },
    answerLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    answerText: {
      fontSize: 18,
      fontWeight: "500",
    },
    correctText: {
      color: colors.primary,
    },
    incorrectText: {
      color: colors.error,
    },
    correctAnswerText: {
      fontSize: 18,
      fontWeight: "500",
      color: colors.primary,
    },
    buttons: {
      gap: 12,
    },
    button: {
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: "center",
    },
    buttonPressed: {
      opacity: 0.8,
    },
    markCorrectButton: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    markCorrectText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.primary,
    },
    nextButton: {
      backgroundColor: colors.primary,
    },
    nextButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.background,
    },
  });
}
