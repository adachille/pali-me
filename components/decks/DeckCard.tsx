import { DEFAULT_DECK_ID } from "@/db";
import type { DeckWithCount } from "@/db/repositories/deckRepository";
import type { ThemeColors } from "@/constants/theme";
import { useThemeColors } from "@/hooks/useThemeColors";
import { Pressable, StyleSheet, Text, View } from "react-native";

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
  const colors = useThemeColors();
  const styles = createStyles(colors);

  const isAllDeck = deck.id === DEFAULT_DECK_ID;
  const itemCountText = deck.itemCount === 1 ? "1 item" : `${deck.itemCount} items`;
  const normalizedName = deck.name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const deckNameTestId = `deck-card-name-${normalizedName || "unnamed"}`;

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={() => onPress(deck)}
      testID={`deck-card-${deck.id}`}
    >
      <View style={styles.content}>
        <View style={styles.nameRow}>
          {isAllDeck && <Text style={styles.pinIcon}>📌</Text>}
          <Text style={[styles.name, isAllDeck && styles.allDeckName]} testID={deckNameTestId}>
            {deck.name}
          </Text>
        </View>
        <Text style={styles.date}>{formatRelativeDate(deck.createdAt)}</Text>
      </View>
      <View style={[styles.badge, isAllDeck && styles.allDeckBadge]}>
        <Text style={styles.badgeText}>{itemCountText}</Text>
      </View>
    </Pressable>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.background,
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    pressed: {
      backgroundColor: colors.surface,
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
      color: colors.primary,
      marginRight: 6,
      fontWeight: "bold",
    },
    name: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.textPrimary,
      marginBottom: 4,
    },
    allDeckName: {
      color: colors.primary,
    },
    date: {
      fontSize: 13,
      color: colors.textHint,
    },
    badge: {
      backgroundColor: colors.surfaceVariant,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    allDeckBadge: {
      backgroundColor: colors.primaryLight,
    },
    badgeText: {
      fontSize: 13,
      color: colors.textSecondary,
      fontWeight: "500",
    },
  });
}
