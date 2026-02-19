import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Item } from "@/db";

type ItemCardProps = {
  item: Item;
  onPress: (item: Item) => void;
};

const TYPE_COLORS: Record<string, string> = {
  word: "#4CAF50",
  prefix: "#2196F3",
  suffix: "#9C27B0",
  root: "#FF9800",
  particle: "#607D8B",
};

export function ItemCard({ item, onPress }: ItemCardProps) {
  const badgeColor = TYPE_COLORS[item.type] ?? "#999";

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={() => onPress(item)}
      testID={`item-card-${item.id}`}
    >
      <View style={styles.content}>
        <Text style={styles.pali}>{item.pali}</Text>
        <Text style={styles.meaning} numberOfLines={2}>
          {item.meaning}
        </Text>
      </View>
      <View style={[styles.badge, { backgroundColor: badgeColor }]}>
        <Text style={styles.badgeText}>{item.type}</Text>
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
  pali: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  meaning: {
    fontSize: 14,
    color: "#666",
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
});
