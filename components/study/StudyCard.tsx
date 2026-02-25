import type { StudyCard as StudyCardType } from "@/db/types";
import { StyleSheet, Text, View } from "react-native";

const TYPE_COLORS: Record<string, string> = {
  word: "#4CAF50",
  prefix: "#2196F3",
  suffix: "#9C27B0",
  root: "#FF9800",
  particle: "#607D8B",
};

type StudyCardProps = {
  card: StudyCardType;
  showAnswer: boolean;
};

/**
 * Displays a flashcard with the prompt side visible.
 * Shows Pali or meaning based on study direction.
 */
export function StudyCard({ card, showAnswer }: StudyCardProps) {
  const badgeColor = TYPE_COLORS[card.type] ?? "#999";

  // Determine what to show based on direction
  const isPaliToMeaning = card.direction === "pali_to_meaning";
  const prompt = isPaliToMeaning ? card.pali : card.meaning;
  const answer = isPaliToMeaning ? card.meaning : card.pali;
  const directionHint = isPaliToMeaning ? "What is the meaning?" : "What is the Pali?";

  return (
    <View style={styles.container} testID="study-card">
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: badgeColor }]}>
          <Text style={styles.badgeText}>{card.type}</Text>
        </View>
        <Text style={styles.directionHint}>{directionHint}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.prompt} testID="study-card-prompt">
          {prompt}
        </Text>

        {showAnswer && (
          <View style={styles.answerSection}>
            <Text style={styles.answerLabel}>Answer:</Text>
            <Text style={styles.answer} testID="study-card-answer">
              {answer}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "500",
  },
  directionHint: {
    fontSize: 14,
    color: "#666",
    marginLeft: 12,
    fontStyle: "italic",
  },
  content: {
    alignItems: "center",
  },
  prompt: {
    fontSize: 32,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 16,
  },
  answerSection: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    width: "100%",
    alignItems: "center",
  },
  answerLabel: {
    fontSize: 14,
    color: "#999",
    marginBottom: 8,
  },
  answer: {
    fontSize: 24,
    fontWeight: "500",
    color: "#333",
    textAlign: "center",
  },
});
