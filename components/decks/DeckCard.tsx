import { Pressable, StyleSheet, Text, View } from "react-native";
import type { DeckWithCount } from "@/db/repositories/deckRepository";
import { DEFAULT_DECK_ID } from "@/db";

type DeckCardProps = {
  deck: DeckWithCount;
  onPress: (deck: DeckWithCount) => void;
};

/**
 * Formats a date as a relative time string (e.g., "3 days ago")
 */
function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "Created today";
  } else if (diffDays === 1) {
    return "Created yesterday";
  } else if (diffDays < 7) {
    return `Created ${diffDays} days ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `Created ${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `Created ${months} ${months === 1 ? "month" : "months"} ago`;
  } else {
    const years = Math.floor(diffDays / 365);
    return `Created ${years} ${years === 1 ? "year" : "years"} ago`;
  }
}

export function DeckCard({ deck, onPress }: DeckCardProps) {
  const isAllDeck = deck.id === DEFAULT_DECK_ID;
  const itemCountText = deck.itemCount === 1 ? "1 item" : `${deck.itemCount} items`;

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={() => onPress(deck)}
      testID={`deck-card-${deck.id}`}
    >
      <View style={styles.content}>
        <View style={styles.nameRow}>
          {isAllDeck && <Text style={styles.pinIcon}>*</Text>}
          <Text style={[styles.name, isAllDeck && styles.allDeckName]}>{deck.name}</Text>
        </View>
        <Text style={styles.date}>{formatRelativeDate(deck.createdAt)}</Text>
      </View>
      <View style={[styles.badge, isAllDeck && styles.allDeckBadge]}>
        <Text style={styles.badgeText}>{itemCountText}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  pressed: {
    backgroundColor: "#f5f5f5",
  },
  content: {
    flex: 1,
    marginRight: 12,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  pinIcon: {
    fontSize: 14,
    color: "#4CAF50",
    marginRight: 6,
    fontWeight: "bold",
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  allDeckName: {
    color: "#4CAF50",
  },
  date: {
    fontSize: 13,
    color: "#999",
  },
  badge: {
    backgroundColor: "#e0e0e0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  allDeckBadge: {
    backgroundColor: "#E8F5E9",
  },
  badgeText: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
});
