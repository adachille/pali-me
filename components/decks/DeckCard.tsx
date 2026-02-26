import { DEFAULT_DECK_ID } from "@/db";
import type { DeckWithCount } from "@/db/repositories/deckRepository";
import { useTheme } from "@/theme";
import type { AppColors } from "@/theme";
import { useMemo } from "react";
import type { GestureResponderEvent } from "react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

type DeckCardProps = {
  deck: DeckWithCount;
  onPress: (deck: DeckWithCount) => void;
  onStudyPress?: (deck: DeckWithCount) => void;
  onEditPress?: (deck: DeckWithCount) => void;
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

export function DeckCard({ deck, onPress, onStudyPress, onEditPress }: DeckCardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const isAllDeck = deck.id === DEFAULT_DECK_ID;
  const itemCountText = deck.itemCount === 1 ? "1 item" : `${deck.itemCount} items`;
  const normalizedName = deck.name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const deckNameTestId = `deck-card-name-${normalizedName || "unnamed"}`;
  const hasActions = onStudyPress || onEditPress;

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
        {hasActions ? (
          <View style={styles.metaRow}>
            <Text style={styles.itemCount}>{itemCountText}</Text>
            <Text style={styles.metaSeparator}>·</Text>
            <Text style={styles.date}>{formatRelativeDate(deck.createdAt)}</Text>
          </View>
        ) : (
          <Text style={styles.date}>{formatRelativeDate(deck.createdAt)}</Text>
        )}
      </View>
      {hasActions ? (
        <View style={styles.actions}>
          {onStudyPress && (
            <Pressable
              style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
              onPress={(e?: GestureResponderEvent) => {
                e?.stopPropagation();
                onStudyPress(deck);
              }}
              testID={`deck-study-${deck.id}`}
              hitSlop={8}
            >
              <Text style={styles.actionIcon}>▶️</Text>
            </Pressable>
          )}
          {onEditPress && (
            <Pressable
              style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
              onPress={(e?: GestureResponderEvent) => {
                e?.stopPropagation();
                onEditPress(deck);
              }}
              testID={`deck-edit-${deck.id}`}
              hitSlop={8}
            >
              <Text style={styles.actionIcon}>✏️</Text>
            </Pressable>
          )}
        </View>
      ) : (
        <View style={[styles.badge, isAllDeck && styles.allDeckBadge]}>
          <Text style={styles.badgeText}>{itemCountText}</Text>
        </View>
      )}
    </Pressable>
  );
}

function makeStyles(colors: AppColors) {
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
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 2,
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
      color: colors.text,
      marginBottom: 4,
    },
    allDeckName: {
      color: colors.primary,
    },
    itemCount: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    metaSeparator: {
      fontSize: 13,
      color: colors.textTertiary,
      marginHorizontal: 6,
    },
    date: {
      fontSize: 13,
      color: colors.textTertiary,
    },
    actions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    actionButton: {
      padding: 8,
      borderRadius: 8,
    },
    actionButtonPressed: {
      backgroundColor: colors.surfaceVariant,
    },
    actionIcon: {
      fontSize: 20,
    },
    badge: {
      backgroundColor: colors.border,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    allDeckBadge: {
      backgroundColor: colors.primarySurface,
    },
    badgeText: {
      fontSize: 13,
      color: colors.textSecondary,
      fontWeight: "500",
    },
  });
}
