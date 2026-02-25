import {
  AnswerInput,
  FeedbackDisplay,
  StudyCard,
  StudyCompletion,
  StudyProgress,
  StudySettingsModal,
} from "@/components/study";
import { deckRepository, studyRepository, useSQLiteContext } from "@/db";
import type { DeckStudyDirection, StudyCard as StudyCardType } from "@/db/types";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

/**
 * Normalizes an answer for comparison
 * - Lowercase
 * - Trim whitespace
 * - Collapse multiple spaces
 */
function normalizeAnswer(text: string): string {
  return text.toLowerCase().trim().replace(/\s+/g, " ");
}

/**
 * Checks if user answer matches correct answer
 */
function checkAnswer(userAnswer: string, correctAnswer: string): boolean {
  return normalizeAnswer(userAnswer) === normalizeAnswer(correctAnswer);
}

/**
 * Shuffles an array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export default function StudyScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const deckId = parseInt(id, 10);
  const db = useSQLiteContext();
  const router = useRouter();
  const navigation = useNavigation();

  // Deck info
  const [deckName, setDeckName] = useState("");

  // Cards state
  const [cards, setCards] = useState<StudyCardType[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Answer state
  const [userAnswer, setUserAnswer] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Session state
  const [isComplete, setIsComplete] = useState(false);
  const [stats, setStats] = useState({ total: 0, correct: 0 });
  const [totalCards, setTotalCards] = useState(0); // Original card count for progress
  const [deckHasCards, setDeckHasCards] = useState(true); // Whether deck has any cards at all

  // Settings state
  const [direction, setDirection] = useState<DeckStudyDirection>("random");
  const [endlessMode, setEndlessMode] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);

  // Current card
  const currentCard = cards[currentIndex];

  // Load deck and cards
  const loadCards = useCallback(async () => {
    setIsLoading(true);
    try {
      const deck = await deckRepository.getById(db, deckId);
      if (deck) {
        setDeckName(deck.name);
        setDirection(deck.studyDirection);

        // Load cards based on mode
        const loadedCards = endlessMode
          ? await studyRepository.getAllCardsForDeck(db, deckId, deck.studyDirection)
          : await studyRepository.getDueCardsForDeck(db, deckId, deck.studyDirection);

        // Check if deck has any cards at all (for empty deck vs no cards due)
        if (!endlessMode) {
          const allCards = await studyRepository.getAllCardsForDeck(
            db,
            deckId,
            deck.studyDirection
          );
          setDeckHasCards(allCards.length > 0);
        } else {
          setDeckHasCards(loadedCards.length > 0);
        }

        setCards(loadedCards);
        setTotalCards(loadedCards.length);
        setCurrentIndex(0);
        setShowFeedback(false);
        setUserAnswer("");
        setIsComplete(false);
        setStats({ total: 0, correct: 0 });
      }
    } catch (error) {
      console.error("Failed to load study cards:", error);
    } finally {
      setIsLoading(false);
    }
  }, [db, deckId, endlessMode]);

  // Initial load
  useEffect(() => {
    loadCards();
  }, [loadCards]);

  // Update navigation header
  useEffect(() => {
    navigation.setOptions({
      title: deckName || "Study",
      headerRight: () => (
        <Pressable
          onPress={() => setSettingsVisible(true)}
          hitSlop={8}
          testID="study-settings-button"
          style={{ alignItems: "center", width: 48, height: 24 }}
        >
          <Ionicons name="settings-outline" size={24} color="#007AFF" />
        </Pressable>
      ),
    });
  }, [navigation, deckName]);

  // Back button confirmation
  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      // Allow navigation if session is complete or no progress made
      if (isComplete || stats.total === 0) {
        return;
      }

      e.preventDefault();

      Alert.alert("Leave Study Session?", "Your progress has been saved.", [
        { text: "Stay", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: () => navigation.dispatch(e.data.action),
        },
      ]);
    });

    return unsubscribe;
  }, [navigation, isComplete, stats.total]);

  // Handle answer submission
  const handleSubmit = useCallback(
    (answer: string) => {
      if (!currentCard) return;

      setUserAnswer(answer);

      // Determine correct answer based on direction
      const correctAnswer =
        currentCard.direction === "pali_to_meaning" ? currentCard.meaning : currentCard.pali;

      const correct = checkAnswer(answer, correctAnswer);
      setIsCorrect(correct);
      setShowFeedback(true);

      // Haptic feedback
      if (correct) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }

      // Update stats
      setStats((prev) => ({
        total: prev.total + 1,
        correct: prev.correct + (correct ? 1 : 0),
      }));
    },
    [currentCard]
  );

  // Handle "Mark as Correct" override
  const handleMarkCorrect = useCallback(async () => {
    if (!currentCard) return;

    // Record as correct in database
    await studyRepository.recordReview(db, currentCard.studyStateId, true);

    // Update stats to reflect the override
    setStats((prev) => ({
      ...prev,
      correct: prev.correct + 1,
    }));

    setIsCorrect(true);
  }, [db, currentCard]);

  // Handle moving to next card
  const handleNext = useCallback(async () => {
    if (!currentCard) return;

    // Record review to database (if not already marked correct via override)
    if (!isCorrect || userAnswer) {
      await studyRepository.recordReview(db, currentCard.studyStateId, isCorrect);
    }

    // Reset answer state
    setUserAnswer("");
    setShowFeedback(false);
    setIsCorrect(false);

    if (endlessMode) {
      // Endless mode: wrap around and reshuffle when needed
      const nextIndex = (currentIndex + 1) % cards.length;
      if (nextIndex === 0) {
        // Reshuffle when looping
        setCards(shuffleArray(cards));
      }
      setCurrentIndex(nextIndex);
    } else {
      // Standard mode
      const remainingCards = cards.filter((_, i) => i !== currentIndex);

      // Correct with no cards left: complete the session.
      if (isCorrect && remainingCards.length === 0) {
        setIsComplete(true);
        return;
      }

      // Incorrect with a single card: keep showing the same card.
      if (!isCorrect && remainingCards.length === 0) {
        setCurrentIndex(0);
        return;
      }

      let nextCards = remainingCards;
      if (!isCorrect) {
        // Reinsert incorrect card at a random position in the queue.
        const insertPosition = Math.floor(Math.random() * (remainingCards.length + 1));
        nextCards = [
          ...remainingCards.slice(0, insertPosition),
          currentCard,
          ...remainingCards.slice(insertPosition),
        ];
      }

      setCards(nextCards);
      // Keep same index (next card shifts into this position), wrapping if needed.
      setCurrentIndex(currentIndex >= nextCards.length ? 0 : currentIndex);
    }
  }, [db, currentCard, isCorrect, userAnswer, endlessMode, currentIndex, cards]);

  // Handle direction change
  const handleDirectionChange = useCallback(
    async (newDirection: DeckStudyDirection) => {
      setDirection(newDirection);
      await deckRepository.updateStudyDirection(db, deckId, newDirection);
      // Reload cards with new direction
      const loadedCards = endlessMode
        ? await studyRepository.getAllCardsForDeck(db, deckId, newDirection)
        : await studyRepository.getDueCardsForDeck(db, deckId, newDirection);
      setCards(loadedCards);
      setCurrentIndex(0);
      setShowFeedback(false);
      setUserAnswer("");
    },
    [db, deckId, endlessMode]
  );

  // Handle endless mode change
  const handleEndlessModeChange = useCallback(
    async (enabled: boolean) => {
      setEndlessMode(enabled);
      // Reload cards when toggling endless mode
      const loadedCards = enabled
        ? await studyRepository.getAllCardsForDeck(db, deckId, direction)
        : await studyRepository.getDueCardsForDeck(db, deckId, direction);
      setCards(loadedCards);
      setCurrentIndex(0);
      setShowFeedback(false);
      setUserAnswer("");
      setStats({ total: 0, correct: 0 });
      setIsComplete(false);
    },
    [db, deckId, direction]
  );

  // Handle back to home
  const handleBackToHome = useCallback(() => {
    router.back();
  }, [router]);

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer} testID="study-screen-loading">
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  // No cards in deck - show empty deck message
  if (!deckHasCards) {
    return (
      <View style={styles.emptyContainer} testID="study-screen-empty-deck">
        <Text style={styles.emptyEmoji}>📚</Text>
        <Text style={styles.emptyTitle}>No cards yet</Text>
        <Text style={styles.emptySubtitle}>Add some cards to this deck to start studying.</Text>
        <Pressable
          style={({ pressed }) => [styles.emptyButton, pressed && styles.emptyButtonPressed]}
          onPress={handleBackToHome}
          testID="empty-back-button"
        >
          <Text style={styles.emptyButtonText}>Back to Home</Text>
        </Pressable>
      </View>
    );
  }

  // No cards due - show "all caught up" message
  if (cards.length === 0 && !isComplete) {
    return (
      <View style={styles.emptyContainer} testID="study-screen-empty">
        <Text style={styles.emptyEmoji}>✨</Text>
        <Text style={styles.emptyTitle}>All caught up!</Text>
        <Text style={styles.emptySubtitle}>No cards are due for review right now.</Text>
        <Pressable
          style={({ pressed }) => [styles.emptyButton, pressed && styles.emptyButtonPressed]}
          onPress={() => handleEndlessModeChange(true)}
          testID="empty-endless-button"
        >
          <Text style={styles.emptyButtonText}>Try Endless Mode</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.backLink, pressed && styles.backLinkPressed]}
          onPress={handleBackToHome}
          testID="empty-back-button"
        >
          <Text style={styles.backLinkText}>Back to Home</Text>
        </Pressable>
      </View>
    );
  }

  // Completion state
  if (isComplete) {
    return (
      <View style={styles.container} testID="study-screen-complete">
        <StudyCompletion
          totalCards={stats.total}
          correctCount={stats.correct}
          onBackToHome={handleBackToHome}
        />
      </View>
    );
  }

  // Get correct answer for feedback
  const correctAnswer = currentCard
    ? currentCard.direction === "pali_to_meaning"
      ? currentCard.meaning
      : currentCard.pali
    : "";

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      testID="study-screen"
    >
      {/* Progress */}
      <View style={styles.progressContainer}>
        <StudyProgress
          current={Math.min(stats.correct + 1, totalCards)}
          total={totalCards}
          endlessMode={endlessMode}
        />
      </View>

      {/* Card */}
      <View style={styles.cardContainer}>
        {currentCard && <StudyCard card={currentCard} showAnswer={showFeedback} />}
      </View>

      {/* Input or Feedback */}
      <View style={styles.inputContainer}>
        {showFeedback ? (
          <FeedbackDisplay
            userAnswer={userAnswer}
            correctAnswer={correctAnswer}
            isCorrect={isCorrect}
            onMarkCorrect={handleMarkCorrect}
            onNext={handleNext}
          />
        ) : (
          <AnswerInput onSubmit={handleSubmit} disabled={showFeedback} />
        )}
      </View>

      {/* Settings Modal */}
      <StudySettingsModal
        visible={settingsVisible}
        direction={direction}
        endlessMode={endlessMode}
        onDirectionChange={handleDirectionChange}
        onEndlessModeChange={handleEndlessModeChange}
        onClose={() => setSettingsVisible(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  progressContainer: {
    paddingVertical: 16,
    alignItems: "center",
  },
  cardContainer: {
    flex: 1,
    justifyContent: "center",
  },
  inputContainer: {
    paddingBottom: Platform.OS === "ios" ? 48 : 32,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 32,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  emptyButtonPressed: {
    opacity: 0.8,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  backLink: {
    marginTop: 16,
    padding: 8,
  },
  backLinkPressed: {
    opacity: 0.6,
  },
  backLinkText: {
    fontSize: 14,
    color: "#4CAF50",
  },
});
