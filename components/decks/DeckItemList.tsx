import type { Item } from "@/db";
import { useTheme } from "@/theme";
import type { AppColors } from "@/theme";
import { useCallback, useMemo } from "react";
import { FlatList, Pressable, StyleSheet, Text, View, type ListRenderItem } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

type DeckItemListProps = {
  items: Item[];
  onItemPress: (item: Item) => void;
  onRemoveItem: (item: Item) => void;
  onAddPress: () => void;
  isDefaultDeck?: boolean;
};

const TYPE_COLORS: Record<string, string> = {
  word: "#4CAF50",
  prefix: "#2196F3",
  suffix: "#9C27B0",
  root: "#FF9800",
  particle: "#607D8B",
};

const SWIPE_THRESHOLD = -80;

function SwipeableItemCard({
  item,
  onPress,
  onRemove,
  canRemove,
}: {
  item: Item;
  onPress: (item: Item) => void;
  onRemove: (item: Item) => void;
  canRemove: boolean;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const translateX = useSharedValue(0);
  const badgeColor = TYPE_COLORS[item.type] ?? "#999";

  const handleRemove = useCallback(() => {
    onRemove(item);
  }, [item, onRemove]);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((event) => {
      if (!canRemove) return;
      // Only allow left swipe
      if (event.translationX < 0) {
        translateX.value = Math.max(event.translationX, -100);
      }
    })
    .onEnd(() => {
      if (!canRemove) return;
      if (translateX.value < SWIPE_THRESHOLD) {
        translateX.value = withTiming(-100, { duration: 150 });
        runOnJS(handleRemove)();
      } else {
        translateX.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const deleteButtonStyle = useAnimatedStyle(() => ({
    opacity: Math.min(Math.abs(translateX.value) / 50, 1),
  }));

  return (
    <View style={styles.swipeContainer}>
      {canRemove && (
        <Animated.View style={[styles.deleteBackground, deleteButtonStyle]}>
          <Text style={styles.deleteText}>Remove</Text>
        </Animated.View>
      )}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={animatedStyle}>
          <Pressable
            style={({ pressed }) => [styles.itemCard, pressed && styles.itemCardPressed]}
            onPress={() => onPress(item)}
            testID={`deck-item-${item.id}`}
          >
            <View style={styles.itemContent}>
              <Text style={styles.pali}>{item.pali}</Text>
              <Text style={styles.meaning} numberOfLines={2}>
                {item.meaning}
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: badgeColor }]}>
              <Text style={styles.badgeText}>{item.type}</Text>
            </View>
          </Pressable>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

function DeckEmptyItems({
  onAddPress,
  isDefaultDeck,
}: {
  onAddPress: () => void;
  isDefaultDeck: boolean;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  if (isDefaultDeck) {
    return (
      <View style={styles.emptyContainer} testID="deck-empty-items">
        <Text style={styles.emptyTitle}>No cards in your library</Text>
        <Text style={styles.emptySubtitle}>
          Add cards from the Library tab to start building your vocabulary.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.emptyContainer} testID="deck-empty-items">
      <Text style={styles.emptyTitle}>No cards in this deck</Text>
      <Text style={styles.emptySubtitle}>Add cards from your library to start studying.</Text>
      <Pressable
        style={({ pressed }) => [styles.addButton, pressed && styles.addButtonPressed]}
        onPress={onAddPress}
        testID="add-items-button"
      >
        <Text style={styles.addButtonText}>Add Cards</Text>
      </Pressable>
    </View>
  );
}

export function DeckItemList({
  items,
  onItemPress,
  onRemoveItem,
  onAddPress,
  isDefaultDeck = false,
}: DeckItemListProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const renderItem: ListRenderItem<Item> = useCallback(
    ({ item }) => (
      <SwipeableItemCard
        item={item}
        onPress={onItemPress}
        onRemove={onRemoveItem}
        canRemove={!isDefaultDeck}
      />
    ),
    [onItemPress, onRemoveItem, isDefaultDeck]
  );

  const keyExtractor = useCallback((item: Item) => String(item.id), []);

  return (
    <FlatList
      data={items}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      contentContainerStyle={items.length === 0 ? styles.emptyListContainer : undefined}
      ListEmptyComponent={<DeckEmptyItems onAddPress={onAddPress} isDefaultDeck={isDefaultDeck} />}
      testID="deck-item-list"
    />
  );
}

function makeStyles(colors: AppColors) {
  return StyleSheet.create({
    swipeContainer: {
      position: "relative",
      backgroundColor: colors.error,
    },
    deleteBackground: {
      position: "absolute",
      right: 0,
      top: 0,
      bottom: 0,
      width: 100,
      backgroundColor: colors.error,
      justifyContent: "center",
      alignItems: "center",
    },
    deleteText: {
      color: "#fff",
      fontWeight: "600",
      fontSize: 14,
    },
    itemCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.background,
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    itemCardPressed: {
      backgroundColor: colors.surface,
    },
    itemContent: {
      flex: 1,
      marginRight: 12,
    },
    pali: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 4,
    },
    meaning: {
      fontSize: 14,
      color: colors.textSecondary,
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
    emptyListContainer: {
      flex: 1,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 32,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 8,
    },
    emptySubtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: "center",
      marginBottom: 24,
      lineHeight: 24,
    },
    addButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
    },
    addButtonPressed: {
      backgroundColor: colors.primaryDark,
    },
    addButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "600",
    },
  });
}
