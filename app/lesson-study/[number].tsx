import { AnswerInput, FeedbackDisplay, StudyProgress } from "@/components/study";
import { getLessonByNumber } from "@/data/lessons";
import { lessonRepository, useSQLiteContext } from "@/db";
import type { LessonNodeType } from "@/db/types";
import type { AppColors } from "@/theme";
import { useTheme } from "@/theme";
import { showConfirm } from "@/utils/alert";
import * as Haptics from "expo-haptics";
import { Stack, useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type QuizItem = {
  prompt: string;
  answer: string;
};

const PASS_THRESHOLD = 0.8;

function normalizeAnswer(text: string): string {
  return text.toLowerCase().trim().replace(/\s+/g, " ");
}

function checkAnswer(userAnswer: string, correctAnswer: string): boolean {
  return normalizeAnswer(userAnswer) === normalizeAnswer(correctAnswer);
}

function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export default function LessonStudyScreen() {
  const { number, type } = useLocalSearchParams<{ number: string; type: string }>();
  const lessonNumber = parseInt(number, 10);
  const lesson = getLessonByNumber(lessonNumber);
  const db = useSQLiteContext();
  const router = useRouter();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const nodeType: LessonNodeType = type === "exercise" ? "exercise_practice" : "vocab_practice";
  const quizLabel = type === "exercise" ? "Exercises" : "Vocab";

  // Build quiz items from static lesson data
  const allItems = useMemo<QuizItem[]>(() => {
    if (!lesson) return [];
    if (type === "exercise") {
      return lesson.exercises.map((e) => ({ prompt: e.pali, answer: e.english }));
    }
    return lesson.vocabulary.map((v) => ({ prompt: v.pali, answer: v.english }));
  }, [lesson, type]);

  // Quiz state
  const [items, setItems] = useState<QuizItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [stats, setStats] = useState({ total: 0, correct: 0 });
  const [isComplete, setIsComplete] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const currentItem = items[currentIndex];

  // Initialize with shuffled items
  useEffect(() => {
    setItems(shuffleArray(allItems));
  }, [allItems]);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, () => setIsKeyboardVisible(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setIsKeyboardVisible(false));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Back button confirmation
  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      if (isComplete || stats.total === 0) return;

      e.preventDefault();
      showConfirm("Leave Quiz?", "Your progress will be lost.", "Leave", "destructive").then(
        (confirmed) => {
          if (confirmed) navigation.dispatch(e.data.action);
        }
      );
    });
    return unsubscribe;
  }, [navigation, isComplete, stats.total]);

  const handleSubmit = useCallback(
    (answer: string) => {
      if (!currentItem) return;

      setUserAnswer(answer);
      const correct = checkAnswer(answer, currentItem.answer);
      setIsCorrect(correct);
      setShowFeedback(true);

      Haptics.notificationAsync(
        correct ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error
      );

      setStats((prev) => ({
        total: prev.total + 1,
        correct: prev.correct + (correct ? 1 : 0),
      }));
    },
    [currentItem]
  );

  const handleMarkCorrect = useCallback(() => {
    setStats((prev) => ({ ...prev, correct: prev.correct + 1 }));
    setIsCorrect(true);
  }, []);

  const handleNext = useCallback(() => {
    setUserAnswer("");
    setShowFeedback(false);
    setIsCorrect(false);

    const remainingItems = items.filter((_, i) => i !== currentIndex);

    if (isCorrect && remainingItems.length === 0) {
      setIsComplete(true);
      return;
    }

    if (!isCorrect && remainingItems.length === 0) {
      setCurrentIndex(0);
      return;
    }

    let nextItems = remainingItems;
    if (!isCorrect) {
      const insertPosition = Math.floor(Math.random() * (remainingItems.length + 1));
      nextItems = [
        ...remainingItems.slice(0, insertPosition),
        currentItem!,
        ...remainingItems.slice(insertPosition),
      ];
    }

    setItems(nextItems);
    setCurrentIndex(currentIndex >= nextItems.length ? 0 : currentIndex);
  }, [items, currentIndex, isCorrect, currentItem]);

  const handleComplete = useCallback(async () => {
    await lessonRepository.completeNode(db, lessonNumber, nodeType);
    router.back();
  }, [db, lessonNumber, nodeType, router]);

  const handleTryAgain = useCallback(() => {
    setItems(shuffleArray(allItems));
    setCurrentIndex(0);
    setUserAnswer("");
    setShowFeedback(false);
    setIsCorrect(false);
    setStats({ total: 0, correct: 0 });
    setIsComplete(false);
  }, [allItems]);

  if (!lesson || allItems.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>No items found for this quiz.</Text>
      </View>
    );
  }

  // Completion screen
  if (isComplete) {
    const scorePercent = Math.round((stats.correct / stats.total) * 100);
    const passed = scorePercent >= PASS_THRESHOLD * 100;

    return (
      <>
        <Stack.Screen options={{ title: `${lesson.title} - ${quizLabel}` }} />
        <View style={styles.completionContainer} testID="lesson-study-complete">
          <Text style={styles.completionEmoji}>{passed ? "🎉" : "📚"}</Text>
          <Text style={styles.completionTitle}>{passed ? "Great job!" : "Keep practicing!"}</Text>
          <Text style={styles.completionScore}>
            {stats.correct} / {stats.total} correct ({scorePercent}%)
          </Text>
          {!passed && (
            <Text style={styles.completionHint}>
              Score {Math.round(PASS_THRESHOLD * 100)}% or higher to complete this node.
            </Text>
          )}
          <View style={styles.completionButtons}>
            {passed ? (
              <Pressable
                style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
                onPress={handleComplete}
                testID="lesson-study-complete-button"
              >
                <Text style={styles.primaryButtonText}>Complete & Return</Text>
              </Pressable>
            ) : (
              <Pressable
                style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
                onPress={handleTryAgain}
                testID="lesson-study-try-again-button"
              >
                <Text style={styles.primaryButtonText}>Try Again</Text>
              </Pressable>
            )}
            <Pressable
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
              onPress={() => router.back()}
              testID="lesson-study-back-button"
            >
              <Text style={styles.secondaryButtonText}>Back to Lessons</Text>
            </Pressable>
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: `${lesson.title} - ${quizLabel}` }} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        testID="lesson-study-screen"
      >
        <View style={styles.progressContainer}>
          <StudyProgress
            current={Math.min(stats.correct + 1, allItems.length)}
            total={allItems.length}
          />
        </View>

        <View style={styles.cardContainer}>
          {currentItem && (
            <View style={styles.card}>
              <Text style={styles.cardPrompt}>{currentItem.prompt}</Text>
            </View>
          )}
        </View>

        <View style={styles.inputContainer}>
          {showFeedback ? (
            <FeedbackDisplay
              userAnswer={userAnswer}
              correctAnswer={currentItem?.answer ?? ""}
              isCorrect={isCorrect}
              onMarkCorrect={handleMarkCorrect}
              onNext={handleNext}
            />
          ) : (
            <View
              style={[
                styles.answerInputWrapper,
                isKeyboardVisible && styles.answerInputWrapperKeyboardVisible,
              ]}
            >
              <AnswerInput onSubmit={handleSubmit} disabled={showFeedback} />
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

function makeStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    centered: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.surface,
    },
    errorText: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    progressContainer: {
      paddingVertical: 16,
      alignItems: "center",
    },
    cardContainer: {
      flex: 1,
      justifyContent: "center",
      paddingHorizontal: 20,
    },
    card: {
      backgroundColor: colors.background,
      borderRadius: 16,
      padding: 32,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    cardPrompt: {
      fontSize: 28,
      fontWeight: "700",
      color: colors.text,
      textAlign: "center",
    },
    inputContainer: {
      paddingBottom: Platform.OS === "ios" ? 64 : 48,
    },
    answerInputWrapper: {
      paddingBottom: 0,
    },
    answerInputWrapperKeyboardVisible: {
      paddingBottom: Platform.OS === "ios" ? 50 : 20,
    },

    // Completion
    completionContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.surface,
      padding: 32,
    },
    completionEmoji: {
      fontSize: 64,
      marginBottom: 16,
    },
    completionTitle: {
      fontSize: 28,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 8,
    },
    completionScore: {
      fontSize: 20,
      color: colors.textSecondary,
      marginBottom: 8,
    },
    completionHint: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: "center",
      marginBottom: 24,
    },
    completionButtons: {
      width: "100%",
      gap: 12,
      marginTop: 16,
    },
    primaryButton: {
      backgroundColor: colors.primary,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: "center",
    },
    primaryButtonText: {
      color: "#fff",
      fontSize: 17,
      fontWeight: "700",
    },
    secondaryButton: {
      paddingVertical: 12,
      alignItems: "center",
    },
    secondaryButtonText: {
      color: colors.primary,
      fontSize: 15,
      fontWeight: "600",
    },
    buttonPressed: {
      opacity: 0.8,
    },
  });
}
