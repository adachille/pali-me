import type { LessonNodeType, NodeState } from "@/src/data/lessons/types";
import type { AppColors } from "@/src/theme";
import { useTheme } from "@/src/theme";
import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  state: NodeState;
  type: LessonNodeType;
  label: string;
  onPress: () => void;
};

export function LessonNode({ state, type, label, onPress }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const isDisabled = state === "locked";

  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [
          styles.circle,
          state === "locked" && styles.circleLocked,
          state === "available" && styles.circleAvailable,
          state === "completed" && styles.circleCompleted,
          pressed && !isDisabled && styles.circlePressed,
        ]}
        onPress={onPress}
        disabled={isDisabled}
        testID={`lesson-node-${type}`}
        accessibilityLabel={`${label} - ${state}`}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled }}
      >
        {state === "completed" ? (
          <Ionicons name="checkmark" size={24} color="#fff" />
        ) : (
          <Text style={[styles.icon, state === "locked" && styles.iconLocked]}>
            {type === "learn" ? "📖" : type === "vocab_practice" ? "🔤" : "✍️"}
          </Text>
        )}
      </Pressable>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

function makeStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      alignItems: "center",
      width: 80,
    },
    circle: {
      width: 52,
      height: 52,
      borderRadius: 26,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 4,
    },
    circleLocked: {
      backgroundColor: colors.border,
    },
    circleAvailable: {
      backgroundColor: colors.primary,
    },
    circleCompleted: {
      backgroundColor: colors.gold,
    },
    circlePressed: {
      backgroundColor: colors.primaryDark,
    },
    icon: {
      fontSize: 22,
    },
    iconLocked: {
      opacity: 0.5,
    },
    label: {
      fontSize: 11,
      color: colors.textSecondary,
      textAlign: "center",
    },
  });
}
